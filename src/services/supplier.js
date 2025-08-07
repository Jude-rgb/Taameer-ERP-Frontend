import api from "./config.js";
import { processApiResponse, handleApiError } from "@/utils/apiUtils.js";

/**
 * Supplier Service - API functions for supplier management
 */

/**
 * Fetch all suppliers
 * @returns {Promise<Object>} Response object with success status and data
 */
export const fetchAllSuppliers = async () => {
  try {
    const response = await api.get("/api/taameer/supplier/all");
    return processApiResponse(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Create a new supplier
 * @param {Object} supplierData - Supplier data object
 * @param {string} supplierData.selectedOption - Type: "individual_type" | "business_type"
 * @param {string} supplierData.first_name - First name (required for individual)
 * @param {string} supplierData.last_name - Last name (required for individual)
 * @param {string} supplierData.business_name - Business name (required for business)
 * @param {string} supplierData.mobile_number - Mobile number
 * @param {string} supplierData.email - Email address
 * @param {string} supplierData.address_line_1 - Address line 1
 * @param {string} supplierData.tax_number - Tax number
 * @returns {Promise<Object>} Response object with success status
 */
export const createSupplier = async (supplierData) => {
  try {
    const payload = {
      selectedOption: supplierData.selectedOption,
      first_name: supplierData.first_name,
      last_name: supplierData.last_name,
      buiness_name: supplierData.buiness_name,
      mobile_number: supplierData.mobile_number,
      email: supplierData.email,
      address_line_1: supplierData.address_line_1,
      tax_number: supplierData.tax_number,
    };

    const response = await api.post("/api/taameer/supplier/register", payload);
    return processApiResponse(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Update an existing supplier
 * @param {string} supplierId - Supplier ID
 * @param {Object} supplierData - Updated supplier data
 * @returns {Promise<Object>} Response object with success status
 */
export const updateSupplier = async (supplierId, supplierData) => {
  try {
    const payload = {
      id: supplierId,
      selectedOption: supplierData.selectedOption,
      first_name: supplierData.first_name,
      last_name: supplierData.last_name,
      buiness_name: supplierData.buiness_name,
      mobile_number: supplierData.mobile_number,
      email: supplierData.email,
      address_line_1: supplierData.address_line_1,
      tax_number: supplierData.tax_number,
    };

    const response = await api.post("/api/taameer/supplier/update", payload);
    return processApiResponse(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Delete a supplier
 * @param {string} supplierId - Supplier ID
 * @returns {Promise<Object>} Response object with success status
 */
export const deleteSupplier = async (supplierId) => {
  try {
    const response = await api.delete(`/api/taameer/supplier/${supplierId}`);
    return processApiResponse(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Toggle supplier status
 * @param {string} supplierId - Supplier ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Response object with success status
 */
export const toggleSupplierStatus = async (supplierId, status) => {
  try {
    const payload = {
      id: supplierId,
      status: status,
    };

    const response = await api.post("/api/taameer/supplier/update", payload);
    return processApiResponse(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
