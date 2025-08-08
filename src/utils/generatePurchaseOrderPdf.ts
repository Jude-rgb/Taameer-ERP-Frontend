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
  currency_type?: string;
  currency_decimal_places?: number;
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

  // Compute totals from line items
  const subTotal = data.purchases_product_details.reduce((sum, item) => {
    const unit = toNumber(item.unit_cost);
    const qty = toNumber(item.purchase_quantity);
    return sum + unit * qty;
  }, 0);
  const vatTotal = data.purchases_product_details.reduce((sum, item) => sum + toNumber(item.vat), 0);
  const grandTotal = opts.withVAT ? subTotal + vatTotal : subTotal;

  // Load logo
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

  const margin = 15;
  const headerHeight = 30;
  const footerHeight = 15;

  // Colors inspired by the reference image
  const darkGray: [number, number, number] = [64, 64, 64];
  const lightGray: [number, number, number] = [245, 245, 245];
  const borderGray: [number, number, number] = [200, 200, 200];

  const drawHeader = () => {
    // Logo placeholder box
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.rect(margin, 10, 25, 15, 'FD');
    
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', margin + 2, 12, 21, 11, undefined, 'FAST');
    } else {
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.setFontSize(8);
      doc.text('YOUR LOGO', margin + 12.5, 18, { align: 'center' });
      doc.text('HERE', margin + 12.5, 21, { align: 'center' });
    }

    // Purchase Order title
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFontSize(20);
    doc.text('PURCHASE ORDER', pageWidth - margin, 20, { align: 'right' });

    // Date and PO# info
    doc.setFontSize(10);
    doc.text(`DATE: ${data.purchase_date}`, pageWidth - margin, 28, { align: 'right' });
    doc.text(`PO#: ${data.purchase_no}`, pageWidth - margin, 33, { align: 'right' });
  };

  const drawCompanyInfo = (startY: number) => {
    let y = startY;
    
    // Company info section
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFontSize(9);
    doc.text('Company Name:', margin, y);
    doc.text('AL DAR CONSTRUCTION', margin, y + 4);
    doc.text('(TAAMEER CONSTRUCTION MATERIALS)', margin, y + 8);
    doc.text('Oman, Muscat Grand Mall', margin, y + 12);
    doc.text('CR: 1119792', margin, y + 16);
    doc.text('taameer@gethor.com', margin, y + 20);

    return y + 28;
  };

  const drawVendorShipToSection = (startY: number) => {
    let y = startY;
    
    // Vendor and Ship To headers (black background)
    doc.setFillColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.rect(margin, y, (pageWidth - 2 * margin) / 2 - 2, 8, 'F');
    doc.rect(margin + (pageWidth - 2 * margin) / 2 + 2, y, (pageWidth - 2 * margin) / 2 - 2, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text('VENDOR INFORMATION', margin + 2, y + 5);
    doc.text('SHIP TO', margin + (pageWidth - 2 * margin) / 2 + 4, y + 5);

    y += 8;

    // Vendor info box
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.rect(margin, y, (pageWidth - 2 * margin) / 2 - 2, 25, 'D');
    
    const supplierName = data.suppliers.supplier_type === 'business_type'
      ? (data.suppliers.business_name || 'N/A')
      : `${data.suppliers.first_name || ''} ${data.suppliers.last_name || ''}`.trim() || 'N/A';

    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFontSize(9);
    doc.text(supplierName, margin + 2, y + 5);
    doc.text(data.suppliers.address_line_1 || '-', margin + 2, y + 9);
    doc.text(`Mobile: ${data.suppliers.mobile_number || '-'}`, margin + 2, y + 13);
    doc.text(`Email: ${data.suppliers.email || '-'}`, margin + 2, y + 17);

    // Ship To box
    doc.rect(margin + (pageWidth - 2 * margin) / 2 + 2, y, (pageWidth - 2 * margin) / 2 - 2, 25, 'D');
    doc.text('Address - Taameer Warehouse(Barka)', margin + (pageWidth - 2 * margin) / 2 + 4, y + 5);
    doc.text('Contact - Younas(79903834)', margin + (pageWidth - 2 * margin) / 2 + 4, y + 9);

    return y + 30;
  };

  const drawFooter = (pageNumber: number) => {
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.line(margin, pageHeight - footerHeight, pageWidth - margin, pageHeight - footerHeight);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFontSize(8);
    doc.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
    doc.text('P.O.BOX 1950, PC 130, Al khuwair, Muscat Grand Mall | TEL: +968 79903828, 93655315 | taameer@gethor.com', 
      pageWidth / 2, pageHeight - 4, { align: 'center' });
  };

  // Draw first page content
  drawHeader();
  let currentY = drawCompanyInfo(45);
  currentY = drawVendorShipToSection(currentY);

  // Table data
  const tableBody: RowInput[] = data.purchases_product_details.map((item, index) => {
    const unit = toNumber(item.unit_cost);
    const qty = toNumber(item.purchase_quantity);
    const lineTotal = unit * qty;
    return [
      String(index + 1),
      String(item.product_name || item.product_code || ''),
      `${fmt(qty)}`,
      `${fmt(unit)}`,
      `${fmt(lineTotal)}`,
    ];
  });

  // Add table
  autoTable(doc, {
    head: [['ITEM #', 'DESCRIPTION', 'QTY', 'PRICE', 'TOTAL']],
    body: tableBody,
    startY: currentY + 5,
    margin: { top: headerHeight + 5, bottom: footerHeight + 5, left: margin, right: margin },
    styles: { 
      fontSize: 9, 
      cellPadding: 3,
      lineColor: borderGray,
      lineWidth: 0.1
    },
    headStyles: { 
      fillColor: darkGray, 
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    didDrawPage: (data) => {
      drawHeader();
      const pageNumber = (doc as any).internal.getNumberOfPages();
      drawFooter(pageNumber);
    },
  });

  // Totals section
  let yAfter = (doc as any).lastAutoTable?.finalY || currentY + 50;
  
  if (yAfter > pageHeight - 60) {
    doc.addPage();
    drawHeader();
    drawFooter((doc as any).internal.getNumberOfPages());
    yAfter = headerHeight + 20;
  }

  // Comments section
  yAfter += 10;
  doc.setFillColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.rect(margin, yAfter, (pageWidth - 2 * margin) * 0.6, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('Comments or Special Instructions', margin + 2, yAfter + 5);

  // Comments box
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.rect(margin, yAfter + 8, (pageWidth - 2 * margin) * 0.6, 20, 'D');
  if (data.note) {
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFontSize(9);
    doc.text(String(data.note), margin + 2, yAfter + 13);
  }

  // Totals section (right side)
  const totalsX = margin + (pageWidth - 2 * margin) * 0.65;
  const totalsWidth = (pageWidth - 2 * margin) * 0.35;
  
  const drawTotalRow = (label: string, value: string, y: number, isGrandTotal = false) => {
    if (isGrandTotal) {
      doc.setFillColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.rect(totalsX, y - 4, totalsWidth, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
    } else {
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.setFontSize(9);
    }
    
    doc.text(label, totalsX + 2, y);
    doc.text(value, totalsX + totalsWidth - 2, y, { align: 'right' });
  };

  drawTotalRow('SUB TOTAL', `${fmt(subTotal)}`, yAfter + 13);
  if (opts.withVAT) {
    drawTotalRow('TAX', `${fmt(vatTotal)}`, yAfter + 21);
    drawTotalRow('GRAND TOTAL', `${fmt(grandTotal)}`, yAfter + 33, true);
  } else {
    drawTotalRow('TAX', '0.000', yAfter + 21);
    drawTotalRow('GRAND TOTAL', `${fmt(grandTotal)}`, yAfter + 33, true);
  }

  // Save with purchase order number as filename
  const fileName = `${data.purchase_no.replace(/\//g, '_')}.pdf`;
  doc.save(fileName);
}
