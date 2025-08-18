import jsPDF from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';
import { loadImageForPDF } from '../../utils/pdfImageUtils';

export interface InvoiceStockItem {
  id: number;
  product_code?: string | null;
  product_name?: string | null;
  unit_price?: number | string | null;
  quantity?: number | string | null;
  total?: number | string | null;
}

export interface InvoiceRefundProduct {
  id: number;
  product_code?: string | null;
  product_name?: string | null;
  quantity?: number | string | null;
}

export interface InvoiceDetailsPdf {
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
  refund_products?: InvoiceRefundProduct[];
}

export async function generateInvoicePDF(
  data: InvoiceDetailsPdf,
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

  const logoPath = opts.logoPath || '/saas-uploads/Logo-01.png';
  const logoDataUrl = await loadImageForPDF(logoPath);

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = 15;
  const headerHeight = 35;
  const footerHeight = 20;

  // Theme color adjusted (green)
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
    const logoX = margin;
    const logoY = 10;
    const logoWidth = 45;
    const logoHeight = 18;
    
    // Draw logo without background rectangle to prevent black background issues
    if (logoDataUrl) {
      // Add logo as JPEG (converted from PNG for better PDF compatibility)
      doc.addImage(logoDataUrl, 'JPEG', logoX, logoY, logoWidth, logoHeight, undefined, 'SLOW');
    } else {
      // Fallback text when no logo is available
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(logoX, logoY, logoWidth, logoHeight, 'FD');
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('YOUR LOGO', logoX + logoWidth / 2, logoY + logoHeight / 2 - 2, { align: 'center' });
      doc.text('HERE', logoX + logoWidth / 2, logoY + logoHeight / 2 + 2, { align: 'center' });
      doc.setFont('helvetica', 'normal');
    }

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

    // Customer right compact box similar to Delivery Note
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
    const boxY = y + headerBarHeight; // joined
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

  // Compute totals from provided fields
  const subTotal = toNumber(data.sub_quotation_total);
  const discountAmt = toNumber(data.discount_price);
  const subAfterDiscount = Math.max(0, subTotal - discountAmt);
  const vatAmt = toNumber(data.quotation_vat);
  const totalBeforeDelivery = subAfterDiscount + vatAmt;
  const deliveryCharges = toNumber(data.delivery_charges);
  const refundAmt = toNumber(data.refund_amount);
  const grandTotalAfterRefund = totalBeforeDelivery + deliveryCharges - refundAmt;

  // Draw header and company/customer blocks
  drawHeader();
  let cursorY = drawCompanyAndCustomer(50);

  // Items table
  const items = (data.invoice_stock || []) as InvoiceStockItem[];
  const tableBody: RowInput[] = items.map((it, idx) => {
    const qty = toNumber(it.quantity);
    const unit = toNumber(it.unit_price);
    const lineTotal = toNumber(it.total) || unit * qty;
    const desc = `${it.product_name || ''}`.trim() || `${it.product_code || ''}`;
    return [String(idx + 1), desc, qty ? String(qty) : '0', `${currency} ${fmt(unit)}`, `${currency} ${fmt(lineTotal)}`];
  });
  autoTable(doc, {
    head: [['ITEM #', 'DESCRIPTION', 'QTY', 'PRICE', 'TOTAL']],
    body: tableBody.length ? tableBody : [['', 'No items', '', '', '']],
    startY: cursorY + 5,
    margin: { top: headerHeight + 5, bottom: footerHeight + 5, left: margin, right: margin },
    styles: { font: 'helvetica', fontSize: 10, cellPadding: 4, lineWidth: 0.2, lineColor: borderGray },
    headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold', fontSize: 11 },
    alternateRowStyles: { fillColor: lightGray },
    didDrawPage: () => {
      const pageNumber = (doc as any).internal.getNumberOfPages();
      drawPageNumber(pageNumber);
      drawHeader();
      drawFooter(pageNumber);
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

  // Totals box on right (single box, conditional rows, no page break inside)
  const contentWidth2 = pageWidth - 2 * margin;
  const columnGap = 4;
  const columnWidth = (contentWidth2 - columnGap) / 2;
  // Make totals box wider (about 65% of content width) and right-aligned
  let totalsTop = yAfter + 6;
  const totalsWidth = Math.floor(contentWidth2 * 0.65);
  const rightColX = margin + contentWidth2 - totalsWidth;
  const labelX = rightColX + 10;
  const valueX = rightColX + 12 + totalsWidth * 0.35 + 6;
  const rightInsetX = rightColX + totalsWidth - 10;
  const rowGap = 14;
  const topPad = 8;
  const bottomPad = 8; // match top padding to keep symmetric spacing

  const rowsAll: Array<{ label: string; value: number; isGrand?: boolean; isRefund?: boolean; show?: boolean }> = [
    { label: 'Sub Total (OMR)', value: subTotal, show: true },
    { label: 'Discount Amount (OMR)', value: discountAmt, show: discountAmt > 0.0005 },
    { label: 'Sub Total (After Discount) (OMR)', value: subAfterDiscount, show: discountAmt > 0.0005 },
    { label: 'VAT (OMR)', value: vatAmt, show: vatAmt > 0.0005 },
    { label: 'Total (OMR)', value: totalBeforeDelivery, show: (deliveryCharges > 0.0005) || (refundAmt > 0.0005) },
    { label: 'Delivery Charges (OMR)', value: deliveryCharges, show: deliveryCharges > 0.0005 },
    { label: 'Refund Amount (OMR)', value: -refundAmt, isRefund: refundAmt > 0.0005, show: refundAmt > 0.0005 },
    { label: 'Grand Total (OMR)', value: grandTotalAfterRefund, isGrand: true, show: true },
  ].filter(r => r.show);

  // Compute height so bottom gap equals bottomPad (not bottomPad + rowGap)
  const boxHeight = topPad + Math.max(0, rowsAll.length - 1) * rowGap + bottomPad;
  // If box would overflow page, move to next page first
  if (totalsTop + boxHeight > pageHeight - footerHeight - 10) {
    doc.addPage();
    const pn2 = (doc as any).internal.getNumberOfPages();
    drawHeader();
    drawFooter(pn2);
    totalsTop = headerHeight + 20;
  }

  // Box bg and border; ensure we don't overlap with the items table header by keeping a small gap
  totalsTop = Math.max(totalsTop, (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 6 : totalsTop);
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(rightColX, totalsTop, totalsWidth, boxHeight, 'F');
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.5);
  doc.rect(rightColX, totalsTop, totalsWidth, boxHeight, 'D');

  rowsAll.forEach((row, idx) => {
    const y = totalsTop + topPad + idx * rowGap;
    // Labels
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFont('helvetica', row.isGrand ? 'bold' : 'bold');
    doc.setFontSize(row.isGrand ? 12 : 11);
    doc.text(row.label, labelX, y);
    // Values (refund in red)
    if (row.isRefund) {
      doc.setTextColor(220, 38, 38); // red
    } else {
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    }
    const text = `${currency}  ${fmt(row.value)}`;
    doc.text(text, rightInsetX, y, { align: 'right' });
  });

  // Refund details section (immediately after totals)
  const refundProducts = (data.refund_products || []) as InvoiceRefundProduct[];
  if ((refundAmt > 0) || refundProducts.length > 0 || (data.refund_reasons && data.refund_reasons.trim() !== '')) {
    let leftY = totalsTop + boxHeight + 12;
    const minBottomSpace = 40; // keep visual space to footer
    const estimatedRows = Math.max(1, Math.min(refundProducts.length, 2)); // require space for at least 2 rows
    const estimatedHeight = 12 /*section title*/ + (data.refund_reasons ? 10 : 0) + (estimatedRows + 1) * 8 + 16;
    const remaining = pageHeight - footerHeight - leftY;
    if (leftY > pageHeight - footerHeight - minBottomSpace || remaining < estimatedHeight) {
      doc.addPage();
      const pn3 = (doc as any).internal.getNumberOfPages();
      drawHeader();
      drawFooter(pn3);
      leftY = headerHeight + 20;
    }
    // Card container on the left
    const isNewPageForRefund = leftY === headerHeight + 20;
    const minLeftWidth = contentWidth2 * 0.75; // widen minimum width of refund table
    const leftWidth = isNewPageForRefund ? contentWidth2 : Math.max(minLeftWidth, contentWidth2 - totalsWidth - columnGap);
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text('Refund Details', margin, leftY);
    leftY += 4;

    if (data.refund_reasons) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Refund Note: ${data.refund_reasons}`, margin, leftY + 6);
      leftY += 10;
    }

    if (refundProducts.length > 0) {
      const body: RowInput[] = refundProducts.map((rp) => [String(rp.product_name || rp.product_code || ''), String(toNumber(rp.quantity))]);
      const qtyColWidth = 35;
      const descColWidth = Math.max(60, leftWidth - qtyColWidth);
      autoTable(doc, {
        head: [['Refund Item Description', 'Quantity']],
        body: body,
        startY: leftY,
        margin: { top: headerHeight + 5, bottom: footerHeight + 5, left: margin, right: margin },
        tableWidth: leftWidth,
        styles: { font: 'helvetica', fontSize: 10, cellPadding: 3, overflow: 'linebreak', lineWidth: 0.2, lineColor: borderGray },
        columnStyles: {
          0: { cellWidth: descColWidth },
          1: { cellWidth: qtyColWidth, halign: 'right' },
        },
        headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold', fontSize: 11 },
        didDrawPage: () => {
          const pn = (doc as any).internal.getNumberOfPages();
          drawPageNumber(pn);
          drawHeader();
          drawFooter(pn);
        },
      });
      leftY = (doc as any).lastAutoTable?.finalY || leftY + 20;
    }
  }

  // Notices (same style as PO)
  const contentWidth = pageWidth - 2 * margin;
  const notices = [
    '--- THIS IS A COMPUTER-GENERATED DOCUMENT NO SIGNATURE REQUIRED',
  ];
  const noticePad = 5;
  const noticeLH = 5.5;
  const noticeHeight = noticePad * 2 + notices.length * noticeLH;
  // Place highlight note immediately after refund (or totals) if it fits; otherwise, move to next page
  const lastBlockBottom = Math.max((doc as any).lastAutoTable?.finalY || 0, totalsTop + boxHeight);
  const candidateTop = lastBlockBottom + 10;
  let noticesTop = candidateTop;
  if (candidateTop + noticeHeight > pageHeight - footerHeight - 10) {
    doc.addPage();
    const pn = (doc as any).internal.getNumberOfPages();
    drawHeader();
    drawFooter(pn);
    noticesTop = headerHeight + 20;
  }
  doc.setFillColor(noticeBg[0], noticeBg[1], noticeBg[2]);
  doc.rect(margin, noticesTop, contentWidth2, noticeHeight, 'F');
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.rect(margin, noticesTop, contentWidth2, noticeHeight, 'D');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  let ty = noticesTop + noticePad + 4;
  const tx = margin + 7;
  for (const line of notices) {
    doc.text(line, tx, ty);
    ty += noticeLH;
  }

  const pageNumber = (doc as any).internal.getNumberOfPages();
  drawPageNumber(pageNumber);
  drawFooter(pageNumber);

  const sanitizedInv = (data.invoice_number || 'Invoice')
    .toString()
    .replace(/\s+/g, '_')
    .replace(/[\\/:"*?<>|]+/g, '_');
  const fileName = `${sanitizedInv}.pdf`;
  if (opts.openInNewTab === true && typeof window !== 'undefined') {
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
  // Always trigger a named download by default
  doc.save(fileName);
}


