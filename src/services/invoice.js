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
