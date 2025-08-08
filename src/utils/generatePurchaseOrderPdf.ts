import jsPDF from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';

export interface PurchaseOrderDetails {
  id: number;
  purchase_no: string;
  quotation_ref?: string | null;
  purchase_date: string;
  sub_total?: string | number;
  total_vat?: string | number;
  grand_total?: string | number;
  product_count?: number;
  stock_status?: string;
  purchase_status?: string;
  payment_status?: string;
  note?: string | null;
  currency_type?: string; // e.g., 'AED'
  currency_decimal_places?: number; // e.g., 2
  user_name?: string;
  created_at?: string;
  purchases_product_details: Array<{
    id: number;
    purchase_id: number;
    purchase_no: string;
    product_code: number | string;
    product_name: string;
    unit_cost: number | string;
    purchase_quantity: number | string;
    sub_total?: number | string;
    vat?: number | string;
    total_quantity_received?: number | string;
    balance_quantity?: number | string;
  }>;
  suppliers: {
    id: number;
    supplier_type: string;
    first_name?: string | null;
    last_name?: string | null;
    mobile_number?: string | null;
    email?: string | null;
    business_name?: string | null;
    address_line_1?: string | null;
    tax_number?: string | null;
    status?: string | null;
  };
}

export async function generatePurchaseOrderPDF(
  data: PurchaseOrderDetails,
  opts: { withVAT: boolean; logoPath?: string } = { withVAT: true }
) {
  const currency = data.currency_type || 'AED';
  const decimals = 3; // Always show 3 decimals as requested

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

  // Compute totals from line items to be robust
  const subTotal = data.purchases_product_details.reduce((sum, item) => {
    const unit = toNumber(item.unit_cost);
    const qty = toNumber(item.purchase_quantity);
    return sum + unit * qty;
  }, 0);
  const vatTotal = data.purchases_product_details.reduce((sum, item) => sum + toNumber(item.vat), 0);
  const grandTotal = opts.withVAT ? subTotal + vatTotal : subTotal;

  // Load logo as data URL (if available)
  const loadImageAsDataURL = async (url: string): Promise<string | null> => {
    try {
      const res = await fetch(url);
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

  const headerHeight = 28; // space reserved for header on each page
  const footerHeight = 15; // footer space

  const primaryRGB: [number, number, number] = [32, 101, 136];
  const mutedRGB: [number, number, number] = [100, 116, 139];

  const drawHeader = () => {
    // Top bar background
    doc.setFillColor(245, 247, 250);
    doc.rect(0, 0, pageWidth, headerHeight, 'F');

    // Logo
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', 12, 6, 22, 16, undefined, 'FAST');
    }

    // Title and meta
    doc.setTextColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.setFontSize(16);
    doc.text('Purchase Order', pageWidth / 2, 14, { align: 'center' });

    doc.setTextColor(33, 37, 41);
    doc.setFontSize(10);
    doc.text(`PO No: ${data.purchase_no}`, pageWidth - 12, 9, { align: 'right' });
    doc.text(`Date: ${data.purchase_date}`, pageWidth - 12, 15, { align: 'right' });
  };

  const drawFooter = (pageNumber: number) => {
    doc.setDrawColor(230, 235, 241);
    doc.line(12, pageHeight - footerHeight, pageWidth - 12, pageHeight - footerHeight);
    doc.setTextColor(mutedRGB[0], mutedRGB[1], mutedRGB[2]);
    doc.setFontSize(9);
    doc.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 6, { align: 'center' });

    // Company contact strip
    doc.setFontSize(8);
    const footerText = 'P.O.BOX 1950, PC 130, Al khuwair, Muscat Grand Mall | TEL: +968 79903828, 93655315 | taameer@gethor.com';
    doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
  };

  // First-page company and supplier sections
  const drawCompanyAndSupplierBlocks = () => {
    let y = headerHeight + 6;

    // Left: Company details (from user request)
    doc.setTextColor(33, 37, 41);
    doc.setFontSize(10);
    const companyLines = [
      'AL DAR CONSTRUCTION',
      '(TAAMEER CONSTRUCTION MATERIALS)',
      'Oman, Muscat Grand Mall',
      'CR: 1119792',
      'taameer@gethor.com'
    ];
    companyLines.forEach((line, i) => doc.text(line, 12, y + i * 5));

    // Right: Supplier box
    const rightX = pageWidth / 2 + 10;
    doc.setFontSize(11);
    doc.setTextColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.text('Supplier', rightX, y);

    doc.setTextColor(33, 37, 41);
    doc.setFontSize(10);

    const supplierName = data.suppliers.supplier_type === 'business_type'
      ? (data.suppliers.business_name || 'N/A')
      : `${data.suppliers.first_name || ''} ${data.suppliers.last_name || ''}`.trim() || 'N/A';

    const supplierLines = [
      supplierName,
      data.suppliers.address_line_1 || '-',
      `Mobile: ${data.suppliers.mobile_number || '-'}`,
      `Email: ${data.suppliers.email || '-'}`,
    ];

    supplierLines.forEach((line, i) => doc.text(line, rightX, y + 6 + i * 5));

    // Quotation ref + Shipping details boxes
    y += 34;
    doc.setDrawColor(230, 235, 241);
    doc.setFillColor(249, 250, 252);

    // Quotation Ref box
    doc.rect(12, y, pageWidth - 24, 10, 'S');
    doc.setFontSize(9);
    doc.setTextColor(mutedRGB[0], mutedRGB[1], mutedRGB[2]);
    doc.text('Quotation Ref', 16, y + 4);
    doc.setTextColor(33, 37, 41);
    doc.setFontSize(10);
    doc.text(`${data.quotation_ref || '-'}`, 16, y + 8);

    // Shipping Details box (as requested)
    const y2 = y + 12;
    doc.rect(12, y2, pageWidth - 24, 12, 'S');
    doc.setFontSize(9);
    doc.setTextColor(mutedRGB[0], mutedRGB[1], mutedRGB[2]);
    doc.text('Shipping Details', 16, y2 + 4);
    doc.setTextColor(33, 37, 41);
    doc.setFontSize(10);
    doc.text('Address - Taameer Warehouse(Barka)  contact - Younas(79903834)', 16, y2 + 8);

    return y2 + 16; // next Y start
  };

  // Draw header/footer for first page
  drawHeader();
  const firstTableStartY = drawCompanyAndSupplierBlocks() + 4;

  // Build table rows
  const body: RowInput[] = data.purchases_product_details.map((item) => {
    const unit = toNumber(item.unit_cost);
    const qty = toNumber(item.purchase_quantity);
    const lineTotal = unit * qty;
    return [
      String(item.product_name || item.product_code || ''),
      `${fmt(unit)}`,
      `${fmt(qty)}`,
      `${fmt(lineTotal)}`,
    ];
  });

  // Add table using autoTable
  autoTable(doc, {
    head: [[
      'Item Description',
      `Unit Price (${currency})`,
      'Quantity',
      `Total (${currency})`
    ]],
    body,
    startY: firstTableStartY,
    margin: { top: headerHeight + 2, bottom: footerHeight + 2, left: 12, right: 12 },
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: primaryRGB, halign: 'center', textColor: 255 },
    alternateRowStyles: { fillColor: [250, 252, 255] },
    didDrawPage: (dataHook) => {
      drawHeader();
      const pageNumber = (doc as any).internal.getNumberOfPages();
      drawFooter(pageNumber);
    },
  });

  // Totals section
  let yAfter = (doc as any).lastAutoTable?.finalY || firstTableStartY;
  if (yAfter > pageHeight - 50) {
    doc.addPage();
    drawHeader();
    drawFooter((doc as any).internal.getNumberOfPages());
    yAfter = headerHeight + 10;
  }

  const summaryX = pageWidth - 12 - 70; // 70mm wide
  const rowHeight = 8;

  const drawSummaryRow = (label: string, value: string, isEmphasis = false) => {
    doc.setFontSize(isEmphasis ? 11 : 10);
    doc.setTextColor(33, 37, 41);
    doc.text(label, summaryX, yAfter);
    doc.text(value, pageWidth - 12, yAfter, { align: 'right' });
    yAfter += rowHeight;
  };

  drawSummaryRow('Sub Total', `${fmt(subTotal)} ${currency}`);
  drawSummaryRow('VAT', `${fmt(vatTotal)} ${currency}`);
  if (!opts.withVAT) {
    drawSummaryRow('Grand Total (Without VAT)', `${fmt(grandTotal)} ${currency}`, true);
  } else {
    drawSummaryRow('Grand Total', `${fmt(grandTotal)} ${currency}`, true);
  }

  // Notes
  if (data.note) {
    yAfter += 6;
    doc.setFontSize(9);
    doc.setTextColor(mutedRGB[0], mutedRGB[1], mutedRGB[2]);
    doc.text('Note:', 12, yAfter);
    doc.setTextColor(33, 37, 41);
    doc.text(String(data.note), 22, yAfter);
  }

  // Legal / info lines
  yAfter += 16;
  doc.setFontSize(8);
  doc.setTextColor(mutedRGB[0], mutedRGB[1], mutedRGB[2]);
  doc.text('THIS IS A COMPUTER-GENERATED DOCUMENT. NO SIGNATURE REQUIRED.', pageWidth / 2, yAfter, { align: 'center' });
  yAfter += 5;
  doc.text('ALL SHIPPING DOCUMENTS SHOULD BE ON THE NAME OF AL DAR CONSTRUCTION LLC.', pageWidth / 2, yAfter, { align: 'center' });

  // Save file
  const fileName = `${(data.purchase_no || 'purchase_order').replace(/\//g, '_')}.pdf`;
  doc.save(fileName);
}
