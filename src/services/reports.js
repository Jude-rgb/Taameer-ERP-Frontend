import api from "./config.js";
import { processApiResponse, handleApiError } from "@/utils/apiUtils.js";

/**
 * Reports API services
 */

/**
 * Fetch invoice reports by date range
 * @param {string} firstDate - YYYY-MM-DD
 * @param {string} lastDate - YYYY-MM-DD
 * @returns {Promise<Object>} Processed response with invoices and aggregates
 */
export const getInvoiceReportByDateRange = async (firstDate, lastDate) => {
  try {
    const payload = {
      first_date: firstDate,
      last_date: lastDate,
    };
    const response = await api.post(
      "api/taameer/invoice/reports/getinvoicebydaterange",
      payload
    );
    return processApiResponse(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Fetch product sales report by date range
 * @param {string} firstDate - YYYY-MM-DD
 * @param {string} lastDate - YYYY-MM-DD
 * @returns {Promise<Object>} Processed response with product sales array
 */
export const getProductSalesReportByDateRange = async (firstDate, lastDate) => {
  try {
    const payload = {
      first_date: firstDate,
      last_date: lastDate,
    };
    const response = await api.post(
      "api/taameer/product/reports/productsales",
      payload
    );
    return processApiResponse(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
