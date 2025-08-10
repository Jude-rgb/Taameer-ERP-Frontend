import api from "./config.js";
import { processApiResponse, handleApiError } from "@/utils/apiUtils.js";

export const quotationService = {
  async create(payload) {
    try {
      const response = await api.post("api/taameer/quotation/create", payload);
      return processApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  async update(payload) {
    try {
      const response = await api.post("api/taameer/quotation/update", payload);
      return processApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  async deleteProduct(payload) {
    try {
      // Backend route uses 'quaution' spelling per spec
      const response = await api.post(
        "api/taameer/quaution/product/delete",
        payload
      );
      return processApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default quotationService;
