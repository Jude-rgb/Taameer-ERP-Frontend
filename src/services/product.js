import api from "./config.js";
import { processApiResponse, handleApiError } from "@/utils/apiUtils";

export const productService = {
  /**
   * Fetch all products from the API
   * @returns {Promise<Array>} Array of products
   */
  async fetchAllProducts() {
    try {
      const response = await api.get("/api/taameer/product/all");
      return processApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Create a new product
   * @param {Object} productData - Product data to create
   * @returns {Promise<Object>} Created product
   */
  async createProduct(productData) {
    try {
      const response = await api.post(
        "/api/taameer/product/register",
        productData
      );
      return processApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update an existing product
   * @param {Object} productData - Updated product data
   * @returns {Promise<Object>} Updated product
   */
  async updateProduct(productData) {
    try {
      const response = await api.post(
        "/api/taameer/product/update",
        productData
      );
      return processApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Delete a product
   * @param {string|number} productId - Product ID to delete
   * @returns {Promise<Object>} Deletion result
   */
  async deleteProduct(productId) {
    try {
      const response = await api.delete(`/api/taameer/product/${productId}`);
      return processApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
