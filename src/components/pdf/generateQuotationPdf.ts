import jsPDF from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';

export interface QuotationStockItem {
  id: number;
  product_code?: string | null;
  product_name?: string | null;
  unit_price?: number | string | null;
  quantity?: number | string | null;
  total?: number | string | null;
}

export interface QuotationDetailsPdf {
  id: number;
  quotation_number: string;
  created_at?: string | null;
  quatation_type?: string | null;
  user_name?: string | null;
  customer_name?: string | null;
  contact_number?: string | null;
  location?: string | null;
  project?: string | null;
  sub_quotation_total?: string | number | null;
  discount_price?: string | number | null;
  quotation_vat?: string | number | null;
  delivery_charges?: string | number | null;
  quotation_total?: string | number | null;
  invoice_status?: string | null;
  invoice_number?: string | null;
  quotation_stock?: QuotationStockItem[];
}

export async function generateQuotationPDF(
  data: QuotationDetailsPdf,
  opts: { currency?: string; logoPath?: string; openInNewTab?: boolean } = {}
) {
  const currency = opts.currency || 'OMR';
  const decimals = 3;
  const parseApiDate = (raw?: string | null): string => {
    if (!raw) return '';
    if (raw.includes('/')) {
      try {
        const [datePart, timePart] = raw.split(' ');
        const [yyyy, mm, dd] = datePart.split('/').map((v) => parseInt(v, 10));
        if (Number.isNaN(yyyy) || Number.isNaN(mm) || Number.isNaN(dd)) return '';
        if (timePart) {
          const [HH = '0', MM = '0', SS = '0'] = timePart.split(':');
          return new Date(yyyy, mm - 1, dd, parseInt(HH, 10) || 0, parseInt(MM, 10) || 0, parseInt(SS, 10) || 0).toLocaleDateString();
        }
        return new Date(yyyy, mm - 1, dd).toLocaleDateString();
      } catch {
        return '';
      }
    }
    const dt = new Date(raw);
    return Number.isNaN(dt.getTime()) ? '' : dt.toLocaleDateString();
  };
  const toNumber = (val: any): number => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    if (typeof val === 'string') {
      const parsed = parseFloat(val.replace(/[^0-9.-]/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };
  const nf = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const fmt = (n: number) => `${nf.format(n)}`;

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const headerHeight = 35;
  const footerHeight = 20;

  const primary: [number, number, number] = [220, 38, 38]; // red theme
  const secondary: [number, number, number] = [52, 73, 94];
  const border: [number, number, number] = [220, 221, 225];
  const light: [number, number, number] = [248, 249, 250];
  const text: [number, number, number] = [33, 37, 41];

  const discountColor: [number, number, number] = [220, 38, 38]; // red
  const deliveryColor: [number, number, number] = [41, 128, 185]; // blue

  // Load logo
  const logoPath = opts.logoPath || '/saas-uploads/Logo-01.png';
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
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
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
  const logoDataUrl = await loadImageAsDataURL(logoPath);

  const drawPageNumber = (pageNumber: number) => {
    doc.setTextColor(text[0], text[1], text[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 25, { align: 'center' });
    doc.setFont('helvetica', 'normal');
  };

  const drawCompanyAndCustomer = (startY: number) => {
    let y = startY;
    
    // Company info section
    doc.setTextColor(text[0], text[1], text[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('AL DAR CONSTRUCTION', margin, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('(TAAMEER CONSTRUCTION MATERIALS)', margin, y + 10);
    doc.text('Oman, Muscat Grand Mall', margin, y + 15);
    doc.text('CR: 1119792', margin, y + 20);
    doc.text('taameer@gethor.com', margin, y + 25);

    // Customer right
    const rightX = pageWidth / 2 + 10;
    const rightWidth = pageWidth - margin - rightX;
    const headerBarHeight = 8;
    const detailsHeight = 24;
    doc.setFillColor(primary[0], primary[1], primary[2]);
    doc.rect(rightX, y, rightWidth, headerBarHeight, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('QUOTE FOR', rightX + 3, y + 5);
    const boxY = y + headerBarHeight;
    doc.setDrawColor(border[0], border[1], border[2]);
    doc.setLineWidth(0.5);
    doc.rect(rightX, boxY, rightWidth, detailsHeight, 'D');
    doc.setTextColor(text[0], text[1], text[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    const name = data.customer_name || '';
    const phone = data.contact_number || '';
    const location = data.location || '';
    const project = data.project || '';
    if (name) doc.text(String(name), rightX + 3, boxY + 6);
    if (phone) doc.text(String(phone), rightX + 3, boxY + 12);
    if (location) doc.text(String(location), rightX + 3, boxY + 18);
    if (project) doc.text(`Project: ${project}`, rightX + rightWidth - 3, boxY + 18, { align: 'right' });
    const leftBottom = y + 32;
    const rightBottom = boxY + detailsHeight;
    return Math.max(leftBottom, rightBottom);
  };

  const drawHeader = () => {
    const logoX = margin;
    const logoY = 10;
    const logoW = 45;
    const logoH = 18;
    
    // Draw logo without background rectangle to prevent black background issues
    if (logoDataUrl) {
      // Add logo directly without background rectangle
      doc.addImage(logoDataUrl, 'PNG', logoX, logoY, logoW, logoH, undefined, 'FAST');
    } else {
      // Fallback text when no logo is available
      doc.setDrawColor(border[0], border[1], border[2]);
      doc.setFillColor(light[0], light[1], light[2]);
      doc.rect(logoX, logoY, logoW, logoH, 'FD');
      doc.setTextColor(text[0], text[1], text[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('YOUR LOGO', logoX + logoW / 2, logoY + logoH / 2, { align: 'center' });
      doc.setFont('helvetica', 'normal');
    }
    
    // Title
    doc.setTextColor(primary[0], primary[1], primary[2]);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('QUOTATION', pageWidth - margin, logoY + 8, { align: 'right' });
    // Info lines
    const dateStr = parseApiDate(data.created_at);
    doc.setTextColor(secondary[0], secondary[1], secondary[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    let y = logoY + 16;
    if (dateStr) { doc.text(`DATE: ${dateStr}`, pageWidth - margin, y, { align: 'right' }); y += 6; }
    if (data.quotation_number) { doc.text(`QUO#: ${data.quotation_number}`, pageWidth - margin, y, { align: 'right' }); }
    doc.setFont('helvetica', 'normal');
  };

  const drawFooter = (pageNumber: number) => {
    doc.setDrawColor(border[0], border[1], border[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - footerHeight, pageWidth - margin, pageHeight - footerHeight);
    doc.setTextColor(text[0], text[1], text[2]);
    doc.setFontSize(9);
    doc.text('P.O.BOX 1950, PC 130, Al khuwair, Muscat Grand Mall | TEL: +968 79903828, 93655315 | taameer@gethor.com', pageWidth / 2, pageHeight - 6, { align: 'center' });
  };

  // Header + parties
  drawHeader();
  const partiesBottom = drawCompanyAndCustomer(50);
  const boxY = partiesBottom - 24; // last box y used for table start calcs

  // Intro line
  doc.setTextColor(text[0], text[1], text[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('We thank you for your inquiry about the captioned goods. As requested, we are making you the following offer.', margin, partiesBottom + 10);

  // Items table
  const items = (data.quotation_stock || []) as QuotationStockItem[];
  const body: RowInput[] = items.map((it, idx) => {
    const qty = toNumber(it.quantity);
    const unit = toNumber(it.unit_price);
    const lineTotal = toNumber(it.total) || unit * qty;
    const desc = `${it.product_name || ''}`.trim() || `${it.product_code || ''}`;
    return [String(idx + 1), desc, `${currency} ${fmt(unit)}`, qty ? String(qty) : '0', `${currency} ${fmt(lineTotal)}`];
  });
  autoTable(doc, {
    head: [['ITEM #', 'ITEM DESCRIPTION', 'UNIT RATE', 'QUANTITY', 'TOTAL (OMR)']],
    body: body.length ? body : [['', 'No items', '', '', '']],
    startY: partiesBottom + 16,
    margin: { top: headerHeight + 5, bottom: footerHeight + 5, left: margin, right: margin },
    styles: { font: 'helvetica', fontSize: 10, cellPadding: 4, lineWidth: 0.2, lineColor: border },
    headStyles: { fillColor: primary, textColor: 255, fontStyle: 'bold', fontSize: 11 },
    alternateRowStyles: { fillColor: light },
    didDrawPage: () => {
      const pn = (doc as any).internal.getNumberOfPages();
      drawPageNumber(pn);
      drawHeader();
      drawFooter(pn);
    },
  });

  let yAfter = (doc as any).lastAutoTable?.finalY || partiesBottom + 60;

  // Totals
  const subTotal = toNumber(data.sub_quotation_total);
  const discount = toNumber(data.discount_price);
  const subAfterDiscount = Math.max(0, subTotal - discount);
  const vat = toNumber(data.quotation_vat);
  const totalBeforeDelivery = subAfterDiscount + vat;
  const delivery = toNumber(data.delivery_charges);
  const chargesWithDelivery = totalBeforeDelivery + delivery;

  const boxX = pageWidth - margin - 100;
  let y = yAfter + 6;
  const rows: Array<[string, number, boolean?]> = [];
  const hasDiscount = discount > 0.0005;
  const hasVat = vat > 0.0005;
  const hasDelivery = delivery > 0.0005;
  rows.push(['Sub Total (OMR)', subTotal, false]);
  if (hasDiscount) {
    rows.push(['Discount Amount (OMR)', discount, false]);
    rows.push(['Sub Total (After Discount) (OMR)', subAfterDiscount, false]);
  }
  if (hasVat) {
    rows.push(['VAT (OMR)', vat, false]);
  }
  // Total is always shown and bold
  rows.push(['Total (OMR)', totalBeforeDelivery, true]);
  if (hasDelivery) {
    rows.push(['Delivery Charges (OMR)', delivery, false]);
    rows.push(['Charges with Delivery (OMR)', chargesWithDelivery, false]);
  }
  doc.setDrawColor(border[0], border[1], border[2]);
  doc.setFillColor(light[0], light[1], light[2]);
  const totalsHeight = rows.length * 8 + 10;
  if (y + totalsHeight > pageHeight - footerHeight - 10) {
    doc.addPage();
    const pn = (doc as any).internal.getNumberOfPages();
    drawPageNumber(pn);
    drawHeader();
    drawFooter(pn);
    y = headerHeight + 20;
  }
  doc.rect(boxX, y, 100, totalsHeight, 'F');
  rows.forEach((r, i) => {
    const yy = y + 8 + i * 8;
    // Only bold for the main Total (not for Charges with Delivery)
    const isMainTotal = r[0] === 'Total (OMR)';
    doc.setFont('helvetica', isMainTotal ? 'bold' : 'normal');
    // Color code discount and delivery rows
    if (r[0].startsWith('Discount')) {
      doc.setTextColor(discountColor[0], discountColor[1], discountColor[2]);
    } else if (r[0].startsWith('Delivery Charges')) {
      doc.setTextColor(deliveryColor[0], deliveryColor[1], deliveryColor[2]);
    } else {
      doc.setTextColor(text[0], text[1], text[2]);
    }
    doc.text(r[0], boxX + 6, yy);
    doc.text(`${currency} ${fmt(r[1])}`, boxX + 94, yy, { align: 'right' });
  });

  // Terms & Conditions + Method of Payment
  const termsLeft = margin;
  let ty = y + totalsHeight + 18;
  const approxTermsHeight = 5 * 5 + 6 + 4 + 3 * 5 + 12; // rough estimate
  if (ty + approxTermsHeight > pageHeight - footerHeight - 10) {
    doc.addPage();
    const pn = (doc as any).internal.getNumberOfPages();
    drawPageNumber(pn);
    drawHeader();
    drawFooter(pn);
    ty = headerHeight + 20;
  }
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(text[0], text[1], text[2]);
  doc.text('TERMS AND CONDITIONS:', termsLeft, ty);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  ty += 6;
  const terms: string[] = [
    'Payment Terms: 100% advance.',
    'Delivery Charges: will be applicable subject to the location other than the total billing amount.',
    "Note: Unloading the goods is the customers responsibility.",
    'Quoted prices are valid for 5 days.',
    'Goods once sold or reserved cannot be returned or exchanged.',
  ];
  terms.forEach((line) => { doc.text(`- ${line}`, termsLeft, ty); ty += 5; });
  ty += 4;
  doc.setFont('helvetica', 'bold');
  doc.text('METHOD OF PAYMENT:', termsLeft, ty);
  doc.setFont('helvetica', 'normal');
  ty += 6;
  const payLines = [
    'BANK MUSCAT',
    'TAAMEER CONSTRUCTION MATERIALS',
    'ACCOUNT DETAILS: 0454 0236 5194 0022',
  ];
  payLines.forEach((line) => { doc.text(line, termsLeft, ty); ty += 5; });

  const pn = (doc as any).internal.getNumberOfPages();
  drawPageNumber(pn);

  const fileName = `${(data.quotation_number || 'Quotation').toString().replace(/[\\/:"*?<>|]+/g, '_')}.pdf`;
  if (opts.openInNewTab === true && typeof window !== 'undefined') {
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
  doc.save(fileName);
}


