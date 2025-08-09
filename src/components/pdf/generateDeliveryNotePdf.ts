import jsPDF from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';
import api from '@/services/config';

export interface DeliveryNoteStock {
  id: number;
  product_code?: string | null;
  product_name?: string | null;
  quantity?: string | number | null; // ordered qty
  delivered_quantity?: string | number | null;
  balance_quantity?: string | number | null;
}

export interface DeliveryNoteDetails {
  id: number;
  delivery_note_number: string;
  quotation_number?: string | null;
  invoice_number?: string | null;
  customer_name: string;
  contact_number?: string | null;
  location?: string | null;
  user_name?: string | null;
  delivery_note_created_date?: string | null; // yyyy/MM/dd HH:mm:ss or ISO
  created_at?: string | null;
  delivery_note_status?: string | null;
  delivery_charges?: string | number | null;
  delivery_note_stock?: DeliveryNoteStock[];
  images_of_unloding?: Array<{
    id: number;
    image_path: string;
    comment?: string | null;
    image_update_date?: string | null;
    created_at?: string | null;
  }>;
}

export async function generateDeliveryNotePDF(
  data: DeliveryNoteDetails,
  opts: { logoPath?: string; openInNewTab?: boolean } = {}
) {
  const rawBase = (api?.defaults?.baseURL as string) || '';
  const baseUrl = rawBase.replace(/\/+$/, '');

  const toNumber = (val: any): number => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    if (typeof val === 'string') {
      const parsed = parseFloat(val.replace(/[^0-9.-]/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const parseApiDate = (raw?: string | null): string => {
    if (!raw) return '';
    if (raw.includes('/')) {
      try {
        const [datePart, timePart] = raw.split(' ');
        const [yyyy, mm, dd] = datePart.split('/').map((v) => parseInt(v, 10));
        if (Number.isNaN(yyyy) || Number.isNaN(mm) || Number.isNaN(dd)) return '';
        if (timePart) {
          const [HH = '0', MM = '0', SS = '0'] = timePart.split(':');
          return new Date(yyyy, mm - 1, dd, parseInt(HH, 10) || 0, parseInt(MM, 10) || 0, parseInt(SS, 10) || 0).toLocaleString();
        }
        return new Date(yyyy, mm - 1, dd).toLocaleDateString();
      } catch {
        return '';
      }
    }
    const dt = new Date(raw);
    return Number.isNaN(dt.getTime()) ? '' : dt.toLocaleString();
  };

  // Load image URLs as base64 for embedding
  const loadImageAsDataURL = async (url: string): Promise<string | null> => {
    try {
      // Ensure absolute URL, but do NOT prefix API base for app assets (e.g., /saas-uploads/...)
      let absoluteUrl = url;
      if (/^https?:/i.test(url)) {
        absoluteUrl = url;
      } else if (url.startsWith('/')) {
        // Use current origin for root-relative assets
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        absoluteUrl = `${origin}${url}`;
      } else {
        // Backend-served relative paths like storage/unloading/...
        absoluteUrl = `${baseUrl}/${url.replace(/^\/+/, '')}`;
      }
      const res = await fetch(absoluteUrl);
      const blob = await res.blob();
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  const logoPath = opts.logoPath || '/saas-uploads/Logo-01.png';
  const logoDataUrl = await loadImageAsDataURL(logoPath);

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = 15;
  const headerHeight = 35;
  const footerHeight = 20;

  // Colors (use a distinct palette for Delivery Note)
  const primaryColor: [number, number, number] = [142, 68, 173]; // Purple
  const secondaryColor: [number, number, number] = [52, 73, 94];
  const lightGray: [number, number, number] = [248, 249, 250];
  const borderGray: [number, number, number] = [220, 221, 225];
  const textDark: [number, number, number] = [33, 37, 41];

  const drawPageNumber = (pageNumber: number) => {
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 25, { align: 'center' });
    doc.setFont('helvetica', 'normal');
  };

  const drawHeader = () => {
    const logoX = margin;
    const logoY = 10;
    const logoWidth = 45;
    const logoHeight = 18;

    // Logo container
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.rect(logoX, logoY, logoWidth, logoHeight, 'FD');
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', logoX + 2, logoY + 2, logoWidth - 4, logoHeight - 4, undefined, 'FAST');
    } else {
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('YOUR LOGO', logoX + logoWidth / 2, logoY + logoHeight / 2 - 2, { align: 'center' });
      doc.text('HERE', logoX + logoWidth / 2, logoY + logoHeight / 2 + 2, { align: 'center' });
      doc.setFont('helvetica', 'normal');
    }

    // Title
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('DELIVERY NOTE', pageWidth - margin, logoY + 8, { align: 'right' });

    // Info lines (Date and DN number)
    const displayDate = parseApiDate(data.delivery_note_created_date || data.created_at);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    if (displayDate) doc.text(`DATE: ${displayDate}`, pageWidth - margin, logoY + 16, { align: 'right' });
    doc.text(`DN#: ${data.delivery_note_number}`, pageWidth - margin, logoY + 22, { align: 'right' });
    doc.setFont('helvetica', 'normal');
  };

  const drawFooter = (pageNumber: number) => {
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - footerHeight, pageWidth - margin, pageHeight - footerHeight);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFontSize(9);
    doc.text(
      'P.O.BOX 1950, PC 130, Al khuwair, Muscat Grand Mall | TEL: +968 79903828, 93655315 | taameer@gethor.com',
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  };

  const drawCompanyAndCustomer = (startY: number) => {
    let y = startY;
    // Company block (left)
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('AL DAR CONSTRUCTION', margin, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('(TAAMEER CONSTRUCTION MATERIALS)', margin, y + 10);
    doc.text('Oman, Muscat Grand Mall', margin, y + 15);
    doc.text('00968 93655315', margin, y + 20);
    doc.text('taameer@gethor.com', margin, y + 25);

    // Customer block (right)
    const rightX = pageWidth / 2 + 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(data.customer_name || 'Customer', rightX, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    if (data.location) doc.text(String(data.location), rightX, y + 10);
    if (data.contact_number) doc.text(String(data.contact_number), rightX, y + 15);

    return y + 32;
  };

  const drawTopInfoTable = (startY: number) => {
    const rows: RowInput[] = [];
    if (data.quotation_number) rows.push(['Quotation No', data.quotation_number]);
    if (data.invoice_number) rows.push(['Invoice No', data.invoice_number]);
    rows.push(['Delivery Note No', data.delivery_note_number || '']);
    const dt = parseApiDate(data.delivery_note_created_date || data.created_at) || '';
    if (dt) rows.push(['Date', dt]);
    autoTable(doc, {
      showHead: 'never',
      body: rows,
      startY,
      styles: { font: 'helvetica', fontSize: 10, cellPadding: 2, lineWidth: 0.2, lineColor: borderGray },
      tableWidth: 88,
      margin: { left: pageWidth - margin - 88, right: margin },
    });
  };

  // Draw header and top info first
  drawHeader();
  drawTopInfoTable(12); // top-right
  const infoEndY = (doc as any).lastAutoTable?.finalY || (headerHeight + 15);
  let cursorY = drawCompanyAndCustomer(Math.max(45, infoEndY + 6));

  // Items table
  const items: DeliveryNoteStock[] = data.delivery_note_stock || [];
  const tableBody: RowInput[] = items.map((it, idx) => {
    const qty = toNumber(it.quantity);
    const delivered = toNumber(it.delivered_quantity);
    const balance = toNumber(it.balance_quantity);
    const description = `${it.product_name || ''}`.trim() || `${it.product_code || ''}`;
    return [String(idx + 1), description, String(qty), String(delivered), String(balance)];
  });

  autoTable(doc, {
    head: [['#', 'Item Description', 'Total Qty', 'Delivered Qty', 'Balance Qty']],
    body: tableBody.length ? tableBody : [['', 'No items', '', '', '']],
    startY: cursorY + 5,
    margin: { top: headerHeight + 5, bottom: footerHeight + 5, left: margin, right: margin },
    styles: {
      font: 'helvetica',
      fontSize: 10,
      cellPadding: 4,
      lineWidth: 0.2,
      lineColor: borderGray,
    },
    headStyles: {
      fillColor: primaryColor,
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 11,
    },
    alternateRowStyles: { fillColor: lightGray },
    didDrawPage: () => {
      const pageNumber = (doc as any).internal.getNumberOfPages();
      drawPageNumber(pageNumber);
      drawHeader();
      drawFooter(pageNumber);
      drawTopInfoTable(12);
    },
  });

  // Images & comments section removed as requested.

  // Finalize
  const fileName = `${(data.delivery_note_number || 'Delivery_Note').replace(/\//g, '_')}.pdf`;
  const pageNumber = (doc as any).internal.getNumberOfPages();
  drawPageNumber(pageNumber);
  drawFooter(pageNumber);

  if (opts.openInNewTab !== false && typeof window !== 'undefined') {
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } else {
    doc.save(fileName);
  }
}


