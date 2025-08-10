import api from "./config.js";
import { processApiResponse, handleApiError } from "@/utils/apiUtils.js";

/**
 * Dashboard API services
 */

/**
 * Fetch quotation summary
 * @param {number|null} userId - User ID for filtering, null for all data
 * @returns {Promise<Object>} Quotation summary data
 */
export const fetchQuotationSummary = async (userId = null) => {
  try {
    const payload = { user_id: userId };
    const response = await api.post("api/taameer/quotation/summary", payload);
    return processApiResponse(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Fetch all invoices
 * @returns {Promise<Object>} Invoices data
 */
export const fetchInvoices = async () => {
  try {
    const response = await api.get("api/taameer/invoice/all");
    return processApiResponse(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Fetch all quotations
 * @returns {Promise<Object>} Quotations data
 */
export const fetchQuotations = async () => {
  try {
    const response = await api.get("api/taameer/quotation/all");
    return processApiResponse(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get single invoice details by ID
 * @param {number|string} invoiceId
 */
export const getInvoiceDetails = async (invoiceId) => {
  try {
    const response = await api.post("api/taameer/invoice/getinvoice", {
      invoice_id: String(invoiceId),
    });
    return processApiResponse(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
