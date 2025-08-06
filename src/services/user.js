import api from "./config.js";
import { processApiResponse, handleApiError } from "@/utils/apiUtils.js";

/**
 * User Service - API functions for user management
 */

/**
 * Fetch all users
 * @returns {Promise<Object>} Response object with success status and data
 */
export const fetchAllUsers = async () => {
  try {
    const response = await api.get("/api/user/all");
    return processApiResponse(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Create a new user
 * @param {Object} userData - User data object
 * @param {string} userData.email - User email
 * @param {string} userData.name - User full name
 * @param {string} userData.number - Contact number
 * @param {string} userData.password - User password
 * @param {string} userData.role - User role
 * @returns {Promise<Object>} Response object with success status
 */
export const createUser = async (userData) => {
  try {
    const payload = {
      email: userData.email,
      name: userData.full_name,
      number: userData.contact_number,
      password: userData.password,
      role: userData.role,
    };

    const response = await api.post("/api/user/register", payload);
    return processApiResponse(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
