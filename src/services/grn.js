import api from "./config.js";
import { processApiResponse, handleApiError } from "@/utils/apiUtils";

export const grnService = {
  /**
   * Fetch all GRNs
   */
  async fetchAllGRN() {
    try {
      const response = await api.get("/api/taameer/grn/all");
      return processApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Create GRN
   */
  async createGRN(payload) {
    try {
      const response = await api.post("/api/taameer/grn/create", payload);
      return processApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
