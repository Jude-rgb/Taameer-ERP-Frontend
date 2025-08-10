import jsPDF from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';

interface InvoicePaymentRow {
  id?: number | string;
  payment_invoice_number?: string | null;
  payment_method?: string | null;
  paid_amount?: string | number | null;
  balance_amount?: string | number | null;
  created_at?: string | null;
}

interface InvoiceStockItem {
  id: number;
  product_code?: string | null;
  product_name?: string | null;
  unit_price?: number | string | null;
  quantity?: number | string | null;
  total?: number | string | null;
}

export interface SubInvoiceDetailsPdf {
  id: number;
  quotation_number?: string | null;
  invoice_number?: string | null;
  created_at?: string | null;
  customer_name?: string | null;
  contact_number?: string | null;
  location?: string | null;

  sub_quotation_total?: string | number | null;
  discount_price?: string | number | null;
  quotation_vat?: string | number | null;
  delivery_charges?: string | number | null;
  refund_amount?: string | number | null;
  refund_reasons?: string | null;

  invoice_stock?: InvoiceStockItem[];
  refund_products?: Array<{ product_name?: string; product_code?: string; quantity?: string | number }>;
  invoice_payment?: InvoicePaymentRow[];
}

export async function generateSubInvoicePDF(
  data: SubInvoiceDetailsPdf,
  opts: { currency?: string; logoPath?: string; openInNewTab?: boolean } = {}
) {
  const currency = opts.currency || 'OMR';
  const decimals = 3;

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

  const parseApiDate = (raw?: string | null): string => {
    if (!raw) return '';
    const dt = new Date(raw);
    if (!isNaN(dt.getTime())) return dt.toLocaleDateString();
    if (raw.includes('/')) {
      try {
        const [datePart] = raw.split(' ');
        const [yyyy, mm, dd] = datePart.split('/').map(v => parseInt(v, 10));
        return new Date(yyyy, (mm || 1) - 1, dd || 1).toLocaleDateString();
      } catch {
        return '';
      }
    }
    return '';
  };

  // Load logo
  const logoPath = opts.logoPath || '/saas-uploads/Logo-01.png';
  const loadImageAsDataURL = async (url: string): Promise<string | null> => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      return await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };
  const logoDataUrl = await loadImageAsDataURL(logoPath);

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const headerHeight = 35;
  const footerHeight = 20;

  const primaryColor: [number, number, number] = [34, 197, 94];
  const secondaryColor: [number, number, number] = [52, 73, 94];
  const lightGray: [number, number, number] = [248, 249, 250];
  const borderGray: [number, number, number] = [220, 221, 225];
  const textDark: [number, number, number] = [33, 37, 41];
  const noticeBg: [number, number, number] = [255, 243, 205];

  const drawPageNumber = (pageNumber: number) => {
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 25, { align: 'center' });
    doc.setFont('helvetica', 'normal');
  };

  const drawHeader = () => {
    const logoX = margin, logoY = 10, logoWidth = 45, logoHeight = 18;
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.rect(logoX, logoY, logoWidth, logoHeight, 'FD');
    if (logoDataUrl) doc.addImage(logoDataUrl, 'PNG', logoX + 2, logoY + 2, logoWidth - 4, logoHeight - 4, undefined, 'FAST');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth - margin, logoY + 8, { align: 'right' });

    const dateStr = parseApiDate(data.created_at);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    let y = logoY + 16;
    if (dateStr) { doc.text(`DATE: ${dateStr}`, pageWidth - margin, y, { align: 'right' }); y += 6; }
    if (data.quotation_number) { doc.text(`QUO#: ${data.quotation_number}`, pageWidth - margin, y, { align: 'right' }); y += 6; }
    if (data.invoice_number) { doc.text(`INV#: ${data.invoice_number}`, pageWidth - margin, y, { align: 'right' }); }
    doc.setFont('helvetica', 'normal');
  };

  const drawFooter = (pageNumber: number) => {
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - footerHeight, pageWidth - margin, pageHeight - footerHeight);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFontSize(9);
    doc.text('P.O.BOX 1950, PC 130, Al khuwair, Muscat Grand Mall | TEL: +968 79903828, 93655315 | taameer@gethor.com', pageWidth / 2, pageHeight - 6, { align: 'center' });
  };

  const drawCompanyAndCustomer = (startY: number) => {
    let y = startY;
    // Company left
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

    // BILL TO box on right (same as invoice)
    const rightX = pageWidth / 2 + 10;
    const rightWidth = pageWidth - margin - rightX;
    const headerBarHeight = 8;
    const detailsHeight = 24;
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(rightX, y, rightWidth, headerBarHeight, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('BILL TO', rightX + 3, y + 5);
    const boxY = y + headerBarHeight;
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
    return Math.max(y + 32, boxY + detailsHeight);
  };

  // Totals numbers
  const subTotal = toNumber(data.sub_quotation_total);
  const discountAmt = toNumber(data.discount_price);
  const subAfterDiscount = Math.max(0, subTotal - discountAmt);
  const vatAmt = toNumber(data.quotation_vat);
  const totalBeforeDelivery = subAfterDiscount + vatAmt;
  const deliveryCharges = toNumber(data.delivery_charges);
  const refundAmt = toNumber(data.refund_amount);
  const grandTotalAfterRefund = totalBeforeDelivery + deliveryCharges - refundAmt;
  const payments: InvoicePaymentRow[] = Array.isArray(data.invoice_payment) ? data.invoice_payment : [];
  const totalPaid = payments.reduce((s, p) => s + toNumber(p.paid_amount), 0);
  const lastPaymentDate = payments.length ? payments.reduce((latest, p) => {
    const t = new Date(p.created_at || '').getTime();
    return isNaN(t) ? latest : Math.max(latest, t);
  }, 0) : 0;
  const lastPaymentDateStr = lastPaymentDate ? new Date(lastPaymentDate).toLocaleDateString() : '';
  const totalDue = Math.max(0, grandTotalAfterRefund - totalPaid);

  // Draw header and parties
  drawHeader();
  let cursorY = drawCompanyAndCustomer(50);

  // Items table (same as invoice)
  const items = (data.invoice_stock || []) as InvoiceStockItem[];
  const itemBody: RowInput[] = items.map((it, idx) => {
    const qty = toNumber(it.quantity);
    const unit = toNumber(it.unit_price);
    const lineTotal = toNumber(it.total) || unit * qty;
    const desc = `${it.product_name || ''}`.trim() || `${it.product_code || ''}`;
    return [String(idx + 1), desc, qty ? String(qty) : '0', `${currency} ${fmt(unit)}`, `${currency} ${fmt(lineTotal)}`];
  });
  autoTable(doc, {
    head: [['ITEM #', 'DESCRIPTION', 'QTY', 'PRICE', 'TOTAL']],
    body: itemBody.length ? itemBody : [['', 'No items', '', '', '']],
    startY: cursorY + 5,
    margin: { top: headerHeight + 5, bottom: footerHeight + 5, left: margin, right: margin },
    styles: { font: 'helvetica', fontSize: 10, cellPadding: 4, lineWidth: 0.2, lineColor: borderGray },
    headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold', fontSize: 11 },
    alternateRowStyles: { fillColor: lightGray },
    didDrawPage: () => {
      const pn = (doc as any).internal.getNumberOfPages();
      drawPageNumber(pn);
      drawHeader();
      drawFooter(pn);
    },
  });

  let yAfter = (doc as any).lastAutoTable?.finalY || cursorY + 50;
  if (yAfter > pageHeight - 90) {
    doc.addPage();
    const pn = (doc as any).internal.getNumberOfPages();
    drawHeader();
    drawFooter(pn);
    yAfter = headerHeight + 20;
  }

  // Totals box (include paid amount and total due)
  const contentWidth2 = pageWidth - 2 * margin;
  const totalsWidth = Math.floor(contentWidth2 * 0.65);
  const rightColX = margin + contentWidth2 - totalsWidth;
  const totalsTop = yAfter + 6;
  const labelX = rightColX + 10;
  const rightInsetX = rightColX + totalsWidth - 10;
  const valueX = rightColX + 12 + totalsWidth * 0.35 + 6;
  const rowGap = 14;
  const topPad = 8;
  const bottomPad = 8;

  const rowsAll: Array<{ label: string; value: number; isGrand?: boolean; isRefund?: boolean; show?: boolean }> = [
    { label: 'Sub Total (OMR)', value: subTotal, show: true },
    { label: 'Discount Amount (OMR)', value: discountAmt, show: discountAmt > 0.0005 },
    { label: 'Sub Total (After Discount) (OMR)', value: Math.max(0, subTotal - discountAmt), show: discountAmt > 0.0005 },
    { label: 'VAT (OMR)', value: vatAmt, show: vatAmt > 0.0005 },
    { label: 'Total (OMR)', value: totalBeforeDelivery, show: (toNumber(data.delivery_charges) > 0.0005) || (toNumber(data.refund_amount) > 0.0005) },
    { label: 'Delivery Charges (OMR)', value: toNumber(data.delivery_charges), show: toNumber(data.delivery_charges) > 0.0005 },
    { label: 'Refund Amount (OMR)', value: -toNumber(data.refund_amount), isRefund: toNumber(data.refund_amount) > 0.0005, show: toNumber(data.refund_amount) > 0.0005 },
    { label: 'Grand Total (OMR)', value: grandTotalAfterRefund, isGrand: true, show: true },
    { label: `Paid Amount (${lastPaymentDateStr || 'as of today'}) (OMR)`, value: totalPaid, show: totalPaid > 0.0005 },
    { label: 'Total Due (OMR)', value: totalDue, isGrand: true, show: true },
  ].filter(r => r.show);

  const boxHeight = topPad + Math.max(0, rowsAll.length - 1) * rowGap + bottomPad;
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(rightColX, totalsTop, totalsWidth, boxHeight, 'F');
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.5);
  doc.rect(rightColX, totalsTop, totalsWidth, boxHeight, 'D');

  rowsAll.forEach((row, idx) => {
    const y = totalsTop + topPad + idx * rowGap;
    doc.setTextColor(row.isRefund ? 220 : textDark[0], row.isRefund ? 38 : textDark[1], row.isRefund ? 38 : textDark[2]);
    doc.setFont('helvetica', row.isGrand ? 'bold' : 'bold');
    doc.setFontSize(row.isGrand ? 12 : 11);
    doc.text(row.label, labelX, y);
    const text = `${currency}  ${fmt(row.value)}`;
    doc.text(text, rightInsetX, y, { align: 'right' });
  });

  // Payments table
  if (payments.length) {
    let py = totalsTop + boxHeight + 10;
    // If not enough space to render the payments table with at least a few rows, move it entirely to next page
    const estimatedRowHeight = 8; // approx. line height with padding
    const minRowsToKeepTogether = Math.min(payments.length + 1, 6); // header + up to 5 rows
    const estimatedMinHeight = minRowsToKeepTogether * estimatedRowHeight + 12;
    const availableHeight = pageHeight - footerHeight - py - 10;
    if (py > pageHeight - 60 || estimatedMinHeight > availableHeight) {
      doc.addPage();
      const pn = (doc as any).internal.getNumberOfPages();
      drawHeader();
      drawFooter(pn);
      py = headerHeight + 20;
    }
    const payBody: RowInput[] = payments.map(p => [
      String(p.payment_invoice_number || p.id || ''),
      parseApiDate(p.created_at || '') || '',
      String(p.payment_method || ''),
      `${currency} ${fmt(toNumber(p.paid_amount))}`,
      `${currency} ${fmt(toNumber(p.balance_amount))}`,
    ]);
    autoTable(doc, {
      head: [['Payment Id', 'Date', 'Payment Method', 'Paid amount (OMR)', 'Invoice Balance (OMR)']],
      body: payBody,
      startY: py,
      margin: { top: headerHeight + 5, bottom: footerHeight + 5, left: margin, right: margin },
      styles: { font: 'helvetica', fontSize: 10, cellPadding: 3, lineWidth: 0.2, lineColor: borderGray },
      headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold', fontSize: 11 },
      pageBreak: (payments.length <= 10 ? 'avoid' : 'auto') as any,
      didDrawPage: () => {
        const pn = (doc as any).internal.getNumberOfPages();
        drawHeader();
        drawFooter(pn);
      },
    });
  }

  // Notice
  const notices = ['--- THIS IS A COMPUTER-GENERATED DOCUMENT NO SIGNATURE REQUIRED'];
  const noticePad = 5, noticeLH = 5.5;
  const noticeHeight = noticePad * 2 + notices.length * noticeLH;
  let ny = (doc as any).lastAutoTable?.finalY || totalsTop + boxHeight + 10;
  ny += 12; // add comfortable gap between payments table and notice block
  if (ny + noticeHeight > pageHeight - footerHeight - 10) {
    doc.addPage();
    const pn = (doc as any).internal.getNumberOfPages();
    drawHeader();
    drawFooter(pn);
    ny = headerHeight + 20;
  }
  doc.setFillColor(noticeBg[0], noticeBg[1], noticeBg[2]);
  doc.rect(margin, ny, pageWidth - 2 * margin, noticeHeight, 'F');
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.rect(margin, ny, pageWidth - 2 * margin, noticeHeight, 'D');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  let ty = ny + noticePad + 4;
  const tx = margin + 7;
  notices.forEach(line => { doc.text(line, tx, ty); ty += noticeLH; });

  const pageNumber = (doc as any).internal.getNumberOfPages();
  drawPageNumber(pageNumber);
  drawFooter(pageNumber);

  const sanitizedInv = (data.invoice_number || 'Invoice').toString().replace(/\s+/g, '_').replace(/[\\/:"*?<>|]+/g, '_');
  const fileName = `${sanitizedInv}.pdf`;
  if (opts.openInNewTab === true && typeof window !== 'undefined') {
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
  doc.save(fileName);
}


