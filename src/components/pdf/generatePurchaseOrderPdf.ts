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
  opts: { withVAT: boolean; logoPath?: string; openInNewTab?: boolean } = { withVAT: true }
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

  // Special formatter for quantities - no decimals if whole number
  const fmtQty = (n: number) => {
    if (Number.isInteger(n)) {
      return n.toString();
    }
    return nf.format(n);
  };

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

  const logoPath = opts.logoPath || '/saas-uploads/Logo-01.png';
  const logoDataUrl = await loadImageAsDataURL(logoPath);

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = 15;
  const headerHeight = 35; // Increased for better spacing
  const footerHeight = 20; // Increased for larger footer text

  // Modern color palette
  const primaryColor: [number, number, number] = [41, 128, 185]; // Blue
  const secondaryColor: [number, number, number] = [52, 73, 94]; // Dark blue-gray
  const accentColor: [number, number, number] = [231, 76, 60]; // Red
  const lightGray: [number, number, number] = [248, 249, 250];
  const borderGray: [number, number, number] = [220, 221, 225];
  const textDark: [number, number, number] = [33, 37, 41];
  const noticeBg: [number, number, number] = [255, 243, 205];

  const drawPageNumber = (pageNumber: number, yPosition?: number) => {
    // Page number above footer divider with proper spacing
    const y = yPosition || pageHeight - 25; // Use provided position or default
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Page ${pageNumber}`, pageWidth / 2, y, { align: 'center' });
    doc.setFont('helvetica', 'normal');
  };

  const drawHeader = () => {
    // Enhanced logo section with larger size and better positioning
    const logoX = margin;
    const logoY = 10; // Moved back up since no top page bar
    const logoWidth = 45; // Increased logo size
    const logoHeight = 18;
    
    // Draw logo without background rectangle to prevent black background issues
    if (logoDataUrl) {
      // Add logo directly without background rectangle
      doc.addImage(logoDataUrl, 'PNG', logoX, logoY, logoWidth, logoHeight, undefined, 'FAST');
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

    // Enhanced Purchase Order title with modern styling
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(24); // Increased font size
    doc.setFont('helvetica', 'bold');
    doc.text('PURCHASE ORDER', pageWidth - margin, logoY + 8, { align: 'right' });

    // Date and PO# info with better styling
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(12); // Increased font size
    doc.setFont('helvetica', 'bold');
    doc.text(`DATE: ${data.purchase_date}`, pageWidth - margin, logoY + 16, { align: 'right' });
    doc.text(`PO#: ${data.purchase_no}`, pageWidth - margin, logoY + 22, { align: 'right' });
    doc.setFont('helvetica', 'normal');
  };

  const drawCompanyInfo = (startY: number) => {
    let y = startY;
    
    // Company info section with enhanced typography
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFontSize(11); // Increased font size
    doc.setFont('helvetica', 'bold');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12); // Larger font for company name
    doc.setFont('helvetica', 'bold');
    doc.text('AL DAR CONSTRUCTION', margin, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('(TAAMEER CONSTRUCTION MATERIALS)', margin, y + 10);
    doc.text('Oman, Muscat Grand Mall', margin, y + 15);
    doc.text('CR: 1119792', margin, y + 20);
    doc.text('taameer@gethor.com', margin, y + 25);

    return y + 32;
  };

  const drawVendorShipToSection = (startY: number) => {
    let y = startY;
    
    // Enhanced Vendor and Ship To headers with modern styling
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(margin, y, (pageWidth - 2 * margin) / 2 - 2, 10, 'F'); // Increased height
    doc.rect(margin + (pageWidth - 2 * margin) / 2 + 2, y, (pageWidth - 2 * margin) / 2 - 2, 10, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12); // Increased font size
    doc.setFont('helvetica', 'bold');
    doc.text('VENDOR INFORMATION', margin + 2, y + 6);
    doc.text('SHIP TO', margin + (pageWidth - 2 * margin) / 2 + 4, y + 6);
    doc.setFont('helvetica', 'normal');

    y += 10;

    // Enhanced vendor info box with better styling
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.5);
    doc.rect(margin, y, (pageWidth - 2 * margin) / 2 - 2, 30, 'D'); // Increased height
    
    const supplierName = data.suppliers.supplier_type === 'business_type'
      ? (data.suppliers.business_name || 'N/A')
      : `${data.suppliers.first_name || ''} ${data.suppliers.last_name || ''}`.trim() || 'N/A';

    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFontSize(11); // Increased font size
    doc.setFont('helvetica', 'bold');
    doc.text(supplierName, margin + 3, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(data.suppliers.address_line_1 || '-', margin + 3, y + 12);
    doc.text(`Mobile: ${data.suppliers.mobile_number || '-'}`, margin + 3, y + 18);
    doc.text(`Email: ${data.suppliers.email || '-'}`, margin + 3, y + 24);

    // Enhanced Ship To box
    doc.rect(margin + (pageWidth - 2 * margin) / 2 + 2, y, (pageWidth - 2 * margin) / 2 - 2, 30, 'D');
    doc.setFont('helvetica', 'bold');
    doc.text('Address - Taameer Warehouse(Barka)', margin + (pageWidth - 2 * margin) / 2 + 4, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.text('Contact - Younas (+968 7990 3834)', margin + (pageWidth - 2 * margin) / 2 + 4, y + 12);

    return y + 35;
  };

  const drawFooter = (pageNumber: number) => {
    // Enhanced footer with larger text and better styling
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - footerHeight, pageWidth - margin, pageHeight - footerHeight);
    
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFontSize(9); // Slightly larger than before
    doc.text('P.O.BOX 1950, PC 130, Al khuwair, Muscat Grand Mall | TEL: +968 79903828, 93655315 | taameer@gethor.com', 
      pageWidth / 2, pageHeight - 6, { align: 'center' });
  };

  // Draw first page content
  drawHeader();
  let currentY = drawCompanyInfo(45); // Adjusted starting position
  currentY = drawVendorShipToSection(currentY);

  // Enhanced table data with currency symbols
  const tableBody: RowInput[] = data.purchases_product_details.map((item, index) => {
    const unit = toNumber(item.unit_cost);
    const qty = toNumber(item.purchase_quantity);
    const lineTotal = unit * qty;
    return [
      String(index + 1),
      String(item.product_name || item.product_code || ''),
      `${fmtQty(qty)}`, // Use special formatter for quantities
      `${currency} ${fmt(unit)}`, // Added currency symbol
      `${currency} ${fmt(lineTotal)}`, // Added currency symbol
    ];
  });

  // Enhanced table styling
  autoTable(doc, {
    head: [['ITEM #', 'DESCRIPTION', 'QTY', 'PRICE', 'TOTAL']],
    body: tableBody,
    startY: currentY + 5,
    margin: { top: headerHeight + 5, bottom: footerHeight + 5, left: margin, right: margin },
    styles: { 
      fontSize: 10, // Increased font size
      cellPadding: 4, // Increased padding
      lineColor: borderGray,
      lineWidth: 0.2, // Slightly thicker lines
      font: 'helvetica'
    },
    headStyles: { 
      fillColor: primaryColor, 
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 11 // Larger header font
    },
    alternateRowStyles: { fillColor: lightGray },
    didDrawPage: (data) => {
      const pageNumber = (doc as any).internal.getNumberOfPages();
      drawPageNumber(pageNumber);
      drawHeader();
      drawFooter(pageNumber);
    },
  });

  // Enhanced totals section with better visual separation
  let yAfter = (doc as any).lastAutoTable?.finalY || currentY + 50;
  
  if (yAfter > pageHeight - 80) {
    doc.addPage();
    const pageNumber = (doc as any).internal.getNumberOfPages();
    drawHeader();
    drawFooter(pageNumber);
    yAfter = headerHeight + 20;
  }

  // Two-column layout directly under items table (left: notices + comments, right: totals)
  let sectionTop = yAfter + 3; // Reduced from 6 to 3 for maximum space utilization
  const contentWidth = pageWidth - 2 * margin;
  const columnGap = 4;
  const columnWidth = (contentWidth - columnGap) / 2;
  const leftColX = margin;
  const rightColX = margin + columnWidth + columnGap;

  // If too close to footer, start a new page
  if (sectionTop > pageHeight - 110) {
    doc.addPage();
    const pageNumber = (doc as any).internal.getNumberOfPages();
    drawHeader();
    drawFooter(pageNumber);
    sectionTop = headerHeight + 20; // reset to top region on new page
  }

  // Totals box on the RIGHT column
  const totalsTop = sectionTop;
  const totalsX = rightColX;
  const totalsWidth = columnWidth;

  // Layout metrics
  const inset = 10; // inner padding for both sides
  const topPad = 8; // reduced top padding inside totals box
  const rowGap = 14; // tighter vertical space between rows
  const grandBarHeight = 10; // height of red bar
  const bottomPad = 8; // symmetric bottom padding to avoid large gap
  const labelColumnWidth = totalsWidth * 0.35; // 35% for labels
  const valueColumnWidth = totalsWidth * 0.65; // 65% for values
  const labelX = totalsX + 10; // reduced left padding for text
  const valueX = totalsX + 12 + labelColumnWidth + 6; // start of value column
  const rightInsetX = totalsX + totalsWidth - inset;

  // Row baselines
  const rowYSub = totalsTop + topPad;
  const rowYVat = rowYSub + rowGap;
  const rowYGrand = rowYVat + rowGap;

  // Compute dynamic box height so the space below the last row equals bottomPad
  const rowsCount = 3; // SUB TOTAL, VAT, GRAND TOTAL
  const totalsBoxHeight = topPad + Math.max(0, rowsCount - 1) * rowGap + bottomPad;

  // Draw totals background with subtle styling
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(totalsX, totalsTop, totalsWidth, totalsBoxHeight, 'F');
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.5);
  doc.rect(totalsX, totalsTop, totalsWidth, totalsBoxHeight, 'D');

  const drawTotalRow = (label: string, value: string, y: number, isGrandTotal = false) => {
    // Removed the mid-row divider to avoid a line appearing before VAT value
 
    if (isGrandTotal) {
      // Grand total styled like other rows (no red background)
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
    }

    // Label
    doc.text(label, labelX, y);

    // Value right-aligned to the inside-right edge of the totals box with auto-shrink
    const originalFontSize = isGrandTotal ? 12 : 11;
    doc.setFontSize(originalFontSize);
    const availableWidth = rightInsetX - valueX;
    let fontSize = originalFontSize;
    let textWidth = doc.getTextWidth(value);
    while (textWidth > availableWidth && fontSize > 9) {
      fontSize -= 0.5;
      doc.setFontSize(fontSize);
      textWidth = doc.getTextWidth(value);
    }
    doc.text(value, rightInsetX, y, { align: 'right' });

    // Draw an underline AFTER the row (below baseline) for SUB TOTAL and VAT rows
    if (!isGrandTotal) {
      const underlineY = y + 6; // a bit below text baseline
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.setLineWidth(0.1);
      const lineStartX2 = Math.max(labelX + doc.getTextWidth(label) + 6, valueX);
      doc.line(lineStartX2, underlineY, rightInsetX, underlineY);
    }
  };

  // Draw totals with proper currency formatting and optimal spacing
  drawTotalRow('SUB TOTAL', `${currency}  ${fmt(subTotal)}`, rowYSub);
  if (opts.withVAT) {
    drawTotalRow('VAT', `${currency}  ${fmt(vatTotal)}`, rowYVat);
    drawTotalRow('GRAND TOTAL', `${currency}  ${fmt(grandTotal)}`, rowYGrand, true);
  } else {
    drawTotalRow('VAT', `${currency}  0.000`, rowYVat);
    drawTotalRow('GRAND TOTAL', `${currency}  ${fmt(grandTotal)}`, rowYGrand, true);
  }

  // LEFT column: highlighted notices then comments box
  let leftCursorY = sectionTop;
  
  // Check if we need a page break for comments section BEFORE drawing anything
  const estimatedCommentsHeight = 10 + 28 + 20; // header + minimum box + spacing
  if (leftCursorY + estimatedCommentsHeight > pageHeight - footerHeight - 20) { // Reduced from 30 to 20 for more aggressive space utilization
    // Move comments to next page and use full width
    doc.addPage();
    const pageNumber = (doc as any).internal.getNumberOfPages();
    drawHeader();
    drawFooter(pageNumber);
    leftCursorY = headerHeight + 20;
    
    // Use full width for comments on new page
    const fullWidth = pageWidth - 2 * margin;
    
    // Comments header and box in full width
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(margin, leftCursorY, fullWidth, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Comments or Special Instructions', margin + 3, leftCursorY + 6);
    
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.5);
    
    // Calculate dynamic height for comments box based on content
    let commentsBoxHeight = 28; // Minimum height
    if (data.note) {
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      // Split text into lines that fit within the full width
      const maxWidth = fullWidth - 6; // 3mm padding on each side
      const words = String(data.note).split(' ');
      const lines: string[] = [];
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine ? currentLine + ' ' + word : word;
        const testWidth = doc.getTextWidth(testLine);
        
        if (testWidth <= maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            // Single word is too long, break it
            lines.push(word);
          }
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }
      
      // Calculate height needed for the text
      const lineHeight = 4; // Height per line in mm
      const textHeight = lines.length * lineHeight;
      const padding = 6; // 3mm top + 3mm bottom padding
      commentsBoxHeight = Math.max(28, textHeight + padding);
    }
    
    // Draw the comments box with calculated height
    doc.rect(margin, leftCursorY + 10, fullWidth, commentsBoxHeight, 'D');
    
    // Draw the text with proper wrapping
    if (data.note) {
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      // Split text into lines that fit within the full width
      const maxWidth = fullWidth - 6; // 3mm padding on each side
      const words = String(data.note).split(' ');
      const lines: string[] = [];
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine ? currentLine + ' ' + word : word;
        const testWidth = doc.getTextWidth(testLine);
        
        if (testWidth <= maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            // Single word is too long, break it
            lines.push(word);
          }
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }
      
      // Draw each line of text
      const lineHeight = 4; // Height per line in mm
      const startY = leftCursorY + 16; // Start text 6mm from top of box
      
      lines.forEach((line, index) => {
        const y = startY + (index * lineHeight);
        doc.text(line, margin + 3, y);
      });
    }
    
    // Update the cursor position for notices - reduce spacing to better utilize page space
    leftCursorY = leftCursorY + 10 + commentsBoxHeight + 1; // Reduced spacing to maximum space utilization
  } else {
    // Comments fit on current page - use two-column layout
    // Comments header and box in left column
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(leftColX, leftCursorY, columnWidth, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Comments or Special Instructions', leftColX + 3, leftCursorY + 6);
    
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.5);
    
    // Calculate dynamic height for comments box based on content
    let commentsBoxHeight = 28; // Minimum height
    if (data.note) {
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      // Split text into lines that fit within the box width
      const maxWidth = columnWidth - 6; // 3mm padding on each side
      const words = String(data.note).split(' ');
      const lines: string[] = [];
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine ? currentLine + ' ' + word : word;
        const testWidth = doc.getTextWidth(testLine);
        
        if (testWidth <= maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            // Single word is too long, break it
            lines.push(word);
          }
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }
      
      // Calculate height needed for the text
      const lineHeight = 4; // Height per line in mm
      const textHeight = lines.length * lineHeight;
      const padding = 6; // 3mm top + 3mm bottom padding
      commentsBoxHeight = Math.max(28, textHeight + padding);
    }
    
    // Draw the comments box with calculated height
    doc.rect(leftColX, leftCursorY + 10, columnWidth, commentsBoxHeight, 'D');
    
    // Draw the text with proper wrapping
    if (data.note) {
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      // Split text into lines that fit within the box width
      const maxWidth = columnWidth - 6; // 3mm padding on each side
      const words = String(data.note).split(' ');
      const lines: string[] = [];
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine ? currentLine + ' ' + word : word;
        const testWidth = doc.getTextWidth(testLine);
        
        if (testWidth <= maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            // Single word is too long, break it
            lines.push(word);
          }
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }
      
      // Draw each line of text
      const lineHeight = 4; // Height per line in mm
      const startY = leftCursorY + 16; // Start text 6mm from top of box
      
      lines.forEach((line, index) => {
        const y = startY + (index * lineHeight);
        doc.text(line, leftColX + 3, y);
      });
    }
    
    // Update the cursor position for notices
    leftCursorY = leftCursorY + 10 + commentsBoxHeight;
  }

  // Highlighted notices UNDER the two-column grid (full width)
  const notices = [
    '---** ALL SHIPPING DOCUMENTS SHOULD BE ON THE NAME OF AL DAR CONSTRUCTION LLC.',
    '--- THIS IS A COMPUTER-GENERATED DOCUMENT NO SIGNATURE REQUIRED',  
  ];
  const noticePad = 5;
  const noticeLH = 5.5;
  const noticeHeight = noticePad * 2 + notices.length * noticeLH;
   
  // Calculate the bottom position of the columns based on whether comments are on current page or new page
  let columnsBottomLeft: number;
  if (leftCursorY === headerHeight + 20) {
    // Comments are on a new page, so we need to calculate based on the current page layout
    columnsBottomLeft = leftCursorY + 10 + (data.note ? Math.max(28, (String(data.note).split(' ').length * 4) + 6) : 28);
  } else {
    // Comments are on current page, use the existing logic
    columnsBottomLeft = leftCursorY + 10 + (data.note ? Math.max(28, (String(data.note).split(' ').length * 4) + 6) : 28);
  }
   
  const columnsBottomRight = totalsTop + totalsBoxHeight;
  let noticesTop = Math.max(columnsBottomLeft, columnsBottomRight) + 1; // Reduced from 2 to 1 for maximum space utilization

  // Improved page break logic for notices - be more aggressive about using available space
  if (noticesTop + noticeHeight > pageHeight - footerHeight - 5) { // Changed from 10 to 5 for much more aggressive space utilization
    // Check if we can fit notices on current page by reducing spacing
    const availableSpace = pageHeight - noticesTop - footerHeight - 5;
    if (availableSpace >= noticeHeight * 0.3) { // Reduced from 0.6 to 0.3 - if we can fit at least 30% of notices, stay on current page
      // Reduce spacing to fit on current page - be very aggressive
      noticesTop = Math.max(columnsBottomLeft, columnsBottomRight) + 1; // Reduced from 2 to 1 for maximum space utilization
    } else {
      // Only add new page if absolutely necessary
      doc.addPage();
      const pageNumber2 = (doc as any).internal.getNumberOfPages();
      drawHeader();
      drawFooter(pageNumber2);
      noticesTop = headerHeight + 20;
    }
  }

  // Draw notices across full width
  doc.setFillColor(noticeBg[0], noticeBg[1], noticeBg[2]);
  doc.rect(margin, noticesTop, contentWidth, noticeHeight, 'F');
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.rect(margin, noticesTop, contentWidth, noticeHeight, 'D');
  // Accent bar
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(margin, noticesTop, 3, noticeHeight, 'F');
  // Notice text
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  let ty = noticesTop + noticePad + 4;
  const tx = margin + 3 + 4;
  for (const line of notices) {
    doc.text(line, tx, ty);
    ty += noticeLH;
  }

  // Draw page number above footer divider
  const pageNumber = (doc as any).internal.getNumberOfPages();
  
  // Position page number above footer, ensuring it doesn't overlap with notices
  const noticesBottom = noticesTop + noticeHeight;
  const pageNumberY = Math.max(noticesBottom + 8, pageHeight - footerHeight - 5);
  
  drawPageNumber(pageNumber, pageNumberY);
  drawFooter(pageNumber);

  // Present PDF: default to saving with a meaningful filename; open in new tab only when explicitly requested
  const sanitizedPo = (data.purchase_no || 'Purchase_Order')
    .toString()
    .replace(/\s+/g, '_')
    .replace(/[\\/:"*?<>|]+/g, '_');
  const fileName = `${sanitizedPo}.pdf`;
  if (opts.openInNewTab === true && typeof window !== 'undefined') {
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
  // Always trigger a named download by default
  doc.save(fileName);
}
