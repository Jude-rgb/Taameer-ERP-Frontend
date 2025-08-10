import api from "./config.js";
import { processApiResponse, handleApiError } from "@/utils/apiUtils.js";

// Create invoice payment (multipart/form-data)
export const createInvoicePayment = async (formData) => {
  try {
    const response = await api.post(
      "api/taameer/invoice/invoicepayment/create",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return processApiResponse(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Create invoice refund (JSON)
export const createInvoiceRefund = async (payload) => {
  try {
    // Accept both FormData and plain object; prefer FormData for 'Form Data' like in screenshot
    const isForm =
      typeof FormData !== "undefined" && payload instanceof FormData;
    const response = await api.post(
      "/api/taameer/invoice/refund/create",
      payload,
      isForm
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : undefined
    );
    return processApiResponse(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Create invoice from quotation
export const createInvoiceFromQuotation = async (payload) => {
  try {
    const response = await api.post("api/taameer/invoice/create", payload);
    // Return raw data to allow handling of custom status shapes (e.g., { status: 'error', errors: {...} })
    return response.data;
  } catch (error) {
    // If server returned a structured error, forward it
    if (error.response?.data) {
      return error.response.data;
    }
    throw new Error(handleApiError(error));
  }
};
