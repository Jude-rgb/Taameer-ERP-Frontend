import * as XLSX from "xlsx";

/**
 * Generic function to export any data to Excel
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Optional custom filename
 * @param {string} sheetName - Optional sheet name
 */
export const exportToExcel = (data, filename = null, sheetName = "Data") => {
  try {
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Set column widths based on data
    if (data.length > 0) {
      const columnWidths = Object.keys(data[0]).map((key) => ({
        wch: Math.max(key.length, 15),
      }));
      worksheet["!cols"] = columnWidths;
    }

    // Style the header row
    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;

      worksheet[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        },
      };
    }

    // Style data rows with alternating colors
    for (let row = 1; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!worksheet[cellAddress]) continue;

        const isEvenRow = row % 2 === 0;
        worksheet[cellAddress].s = {
          fill: { fgColor: { rgb: isEvenRow ? "F2F2F2" : "FFFFFF" } },
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          },
          alignment: { vertical: "center" },
        };
      }
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate filename with current date
    const currentDate = new Date().toISOString().split("T")[0];
    const defaultFilename = `${sheetName.toLowerCase()}_${currentDate}.xlsx`;
    const finalFilename = filename || defaultFilename;

    // Save the file
    XLSX.writeFile(workbook, finalFilename);

    return { success: true, filename: finalFilename };
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    throw new Error("Failed to export data to Excel");
  }
};

/**
 * Export purchase orders data to Excel file
 * @param {Array} purchaseOrders - Array of purchase order objects
 * @param {string} filename - Optional custom filename
 */
export const exportPurchaseOrdersToExcel = (
  purchaseOrders,
  filename = null
) => {
  try {
    // Helper function to get supplier name
    const getSupplierName = (supplier) => {
      if (supplier.supplier_type === "business_type") {
        return supplier.business_name || "N/A";
      } else {
        const firstName = supplier.first_name || "";
        const lastName = supplier.last_name || "";
        return `${firstName} ${lastName}`.trim() || "N/A";
      }
    };

    // Helper function to format currency
    const formatCurrency = (
      amount,
      currencyType = "OMR",
      decimalPlaces = 3
    ) => {
      const numAmount = parseFloat(amount) || 0;
      return `${currencyType} ${numAmount.toFixed(decimalPlaces)}`;
    };

    // Helper function to format date
    const formatDate = (dateString) => {
      if (!dateString) return "N/A";
      return new Date(dateString).toLocaleDateString();
    };

    // Prepare data for export
    const exportData = purchaseOrders.map((order) => ({
      "Purchase No": order.purchase_no || "",
      "Quotation Ref": order.quotation_ref || "N/A",
      "Supplier Name": getSupplierName(order.suppliers),
      "Supplier Type":
        order.suppliers?.supplier_type === "business_type"
          ? "Business"
          : "Individual",
      "Purchase Date": formatDate(order.purchase_date),
      "Created At": formatDate(order.created_at),
      "Product Count": order.product_count || 0,
      "Grand Total": formatCurrency(
        order.grand_total,
        order.currency_type,
        order.currency_decimal_places
      ),
      "Purchase Status": getPurchaseStatusText(order.purchase_status),
      "Payment Status": getPaymentStatusText(order.payment_status),
      "Stock Status": getStockStatusText(order.stock_status),
      Currency: order.currency_type || "OMR",
      Note: order.note || "N/A",
      "Created By": order.user_name || "N/A",
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    const columnWidths = [
      { wch: 20 }, // Purchase No
      { wch: 15 }, // Quotation Ref
      { wch: 25 }, // Supplier Name
      { wch: 12 }, // Supplier Type
      { wch: 15 }, // Purchase Date
      { wch: 15 }, // Created At
      { wch: 12 }, // Product Count
      { wch: 18 }, // Grand Total
      { wch: 15 }, // Purchase Status
      { wch: 15 }, // Payment Status
      { wch: 15 }, // Stock Status
      { wch: 10 }, // Currency
      { wch: 30 }, // Note
      { wch: 15 }, // Created By
    ];
    worksheet["!cols"] = columnWidths;

    // Style the header row
    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;

      worksheet[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        },
      };
    }

    // Style data rows with alternating colors
    for (let row = 1; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!worksheet[cellAddress]) continue;

        const isEvenRow = row % 2 === 0;
        worksheet[cellAddress].s = {
          fill: { fgColor: { rgb: isEvenRow ? "F2F2F2" : "FFFFFF" } },
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          },
          alignment: { vertical: "center" },
        };
      }
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase Orders");

    // Generate filename with current date
    const currentDate = new Date().toISOString().split("T")[0];
    const defaultFilename = `purchase_orders_${currentDate}.xlsx`;
    const finalFilename = filename || defaultFilename;

    // Save the file
    XLSX.writeFile(workbook, finalFilename);

    return { success: true, filename: finalFilename };
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    throw new Error("Failed to export purchase orders to Excel");
  }
};

/**
 * Export products data to Excel file
 * @param {Array} products - Array of product objects
 * @param {string} filename - Optional custom filename
 */
export const exportProductsToExcel = (products, filename = null) => {
  try {
    // Prepare data for export
    const exportData = products.map((product) => ({
      "Product Image": product.product_image || "No Image",
      "Product Code": product.product_code || "",
      Brand: product.product_brand || "",
      "Product Name": product.product_name || "",
      "Total Stock": product.total_stock || 0,
      "Warehouse Stock": product.warehouse_stock || 0,
      "Sold Stock": product.sold_stock || 0,
      "Unit Price (Shop)": `OMR ${Number(product.unit_price_shop || 0).toFixed(
        3
      )}`,
      "Unit Price (Customer)": `OMR ${Number(
        product.unit_price_customer || 0
      ).toFixed(3)}`,
      "Stock Status": getStatusText(product.warehouse_stock),
      "Stock Duration": getStockDurationText(
        product.updated_at,
        product.warehouse_stock
      ),
      "Last Updated": product.updated_at
        ? new Date(product.updated_at).toLocaleDateString()
        : "",
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    const columnWidths = [
      { wch: 15 }, // Product Image
      { wch: 12 }, // Product Code
      { wch: 15 }, // Brand
      { wch: 25 }, // Product Name
      { wch: 12 }, // Total Stock
      { wch: 15 }, // Warehouse Stock
      { wch: 12 }, // Sold Stock
      { wch: 18 }, // Unit Price (Shop)
      { wch: 20 }, // Unit Price (Customer)
      { wch: 12 }, // Stock Status
      { wch: 15 }, // Stock Duration
      { wch: 15 }, // Last Updated
    ];
    worksheet["!cols"] = columnWidths;

    // Style the header row
    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;

      worksheet[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        },
      };
    }

    // Style data rows with alternating colors
    for (let row = 1; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!worksheet[cellAddress]) continue;

        const isEvenRow = row % 2 === 0;
        worksheet[cellAddress].s = {
          fill: { fgColor: { rgb: isEvenRow ? "F2F2F2" : "FFFFFF" } },
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          },
          alignment: { vertical: "center" },
        };
      }
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products Inventory");

    // Generate filename with current date
    const currentDate = new Date().toISOString().split("T")[0];
    const defaultFilename = `products_inventory_${currentDate}.xlsx`;
    const finalFilename = filename || defaultFilename;

    // Save the file
    XLSX.writeFile(workbook, finalFilename);

    return { success: true, filename: finalFilename };
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    throw new Error("Failed to export products to Excel");
  }
};

/**
 * Get status text based on warehouse stock
 * @param {number} warehouseStock - Warehouse stock quantity
 * @returns {string} Status text
 */
const getStatusText = (warehouseStock) => {
  const stock = Number(warehouseStock) || 0;
  if (stock > 0) return "In Stock";
  if (stock <= 0) return "Out of Stock";
  return "Out of Stock";
};

/**
 * Get stock duration text
 * @param {string} updatedAt - Last updated timestamp
 * @param {number} warehouseStock - Warehouse stock quantity
 * @returns {string} Duration text
 */
const getStockDurationText = (updatedAt, warehouseStock) => {
  if (!updatedAt || Number(warehouseStock) <= 0) return "-";

  const updatedDate = new Date(updatedAt);
  const currentDate = new Date();
  const diffTime = Math.abs(currentDate - updatedDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
};

/**
 * Get purchase status text
 * @param {string} status - Purchase status
 * @returns {string} Formatted status text
 */
const getPurchaseStatusText = (status) => {
  const statusMap = {
    draft: "Draft",
    ordered: "Ordered",
    received: "Received",
    cancelled: "Cancelled",
  };
  return statusMap[status?.toLowerCase()] || status || "N/A";
};

/**
 * Get payment status text
 * @param {string} status - Payment status
 * @returns {string} Formatted status text
 */
const getPaymentStatusText = (status) => {
  const statusMap = {
    pending: "Pending",
    done: "Paid",
  };
  return statusMap[status?.toLowerCase()] || status || "N/A";
};

/**
 * Get stock status text
 * @param {string} status - Stock status
 * @returns {string} Formatted status text
 */
const getStockStatusText = (status) => {
  const statusMap = {
    pending: "Pending",
    partially: "Partially Received",
    completed: "Completed",
  };
  return statusMap[status?.toLowerCase()] || status || "N/A";
};
