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
      // Use public folder for logo assets (served by Vite/frontend)
      let absoluteUrl = url;
      if (/^https?:/i.test(url)) {
        absoluteUrl = url;
      } else if (url.startsWith('/')) {
        // Use current origin for public folder assets
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        absoluteUrl = `${origin}${url}`;
      } else {
        // Relative paths - prepend with current origin
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        absoluteUrl = `${origin}/${url}`;
      }
      
      const res = await fetch(absoluteUrl);
      if (!res.ok) {
        throw new Error(`Failed to fetch image: ${res.status}`);
      }
      
      const blob = await res.blob();
      
      // Ensure we're handling PNG properly
      if (blob.type !== 'image/png' && blob.type !== 'image/jpeg') {
        console.warn('Image type not optimal for PDF:', blob.type);
      }
      
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read image file'));
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error loading image:', error);
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
    
    // Draw logo without background rectangle to prevent black background issues
    if (logoDataUrl) {
      // Add logo with proper transparency handling
      doc.addImage(logoDataUrl, 'PNG', logoX, logoY, logoWidth, logoHeight, undefined, 'NONE');
    } else {
      // Fallback text when no logo is available
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(logoX, logoY, logoWidth, logoHeight, 'FD');
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('YOUR LOGO', logoX + logoWidth / 2, logoY + logoHeight / 2, { align: 'center' });
      doc.setFont('helvetica', 'normal');
    }

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('DELIVERY NOTE', pageWidth - margin, logoY + 8, { align: 'right' });

    const dateStr = parseApiDate(data.created_at);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    let y = logoY + 16;
    if (dateStr) { doc.text(`DATE: ${dateStr}`, pageWidth - margin, y, { align: 'right' }); y += 6; }
    if (data.delivery_note_number) { doc.text(`DN#: ${data.delivery_note_number}`, pageWidth - margin, y, { align: 'right' }); }
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

    // Customer block (right) styled like "SHIP TO" box in Purchase Order
    const rightX = pageWidth / 2 + 10;
    const rightWidth = pageWidth - margin - rightX;
    const headerBarHeight = 8; // small, noticeable header bar
    const smallGap = 0; // join header with box body (no gap)
    const detailsHeight = 24; // compact details box height

    // Header bar
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(rightX, y, rightWidth, headerBarHeight, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('DELIVERY TO', rightX + 3, y + 5);

    // Details box
    const boxY = y + headerBarHeight + smallGap;
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.5);
    doc.rect(rightX, boxY, rightWidth, detailsHeight, 'D');

    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    const custName = data.customer_name || '';
    const addr = data.location || '';
    const phone = data.contact_number || '';
    if (custName) doc.text(String(custName), rightX + 3, boxY + 6);
    if (addr) doc.text(String(addr), rightX + 3, boxY + 12);
    if (phone) doc.text(String(phone), rightX + 3, boxY + 18);

    // Return cursor just below the taller of left text and right box
    const rightBottom = boxY + detailsHeight;
    const leftBottom = y + 32;
    return Math.max(leftBottom, rightBottom);
  };

  // Top-right info table removed; header now renders Date, QA#, INV#, and DLV# lines

  // Draw header first (header includes right-side info lines)
  drawHeader();
  // Add a bit more gap under the title section for visual breathing room
  let cursorY = drawCompanyAndCustomer(50);

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
    },
  });

  // Images & comments section removed as requested.

  // Finalize
  const sanitizedDn = (data.delivery_note_number || 'Delivery_Note')
    .toString()
    .replace(/\s+/g, '_')
    .replace(/[\\/:"*?<>|]+/g, '_');
  const fileName = `${sanitizedDn}.pdf`;
  const pageNumber = (doc as any).internal.getNumberOfPages();
  drawPageNumber(pageNumber);
  drawFooter(pageNumber);

  if (opts.openInNewTab === true && typeof window !== 'undefined') {
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
  // Always trigger a named download by default
  doc.save(fileName);
}


