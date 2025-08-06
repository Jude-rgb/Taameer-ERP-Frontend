import api from "./config.js";

/**
 * Authentication service for user login/logout operations
 */
export const authService = {
  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Success/failure response
   */
  async login(email, password) {
    try {
      const response = await api.post("/api/user/login", {
        email,
        password,
      });

      const { status, message, data } = response.data;

      // Check if API returned an error
      if (status === "Errors") {
        throw new Error(message || "Login failed");
      }

      // Check if we have valid data
      if (status === "Success" && data) {
        const { user, access_token } = data;

        // Save user data to localStorage
        localStorage.setItem("access_token", access_token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
          })
        );

        return {
          success: true,
          message: message || "Login successful",
          user: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
          },
          access_token,
        };
      }

      throw new Error("Invalid response from server");
    } catch (error) {
      // Handle axios errors
      if (error.response) {
        // Server responded with error status
        const { status, message } = error.response.data;
        if (status === "Errors") {
          throw new Error(message || "Login failed");
        }
        throw new Error(message || `Server error: ${error.response.status}`);
      } else if (error.request) {
        // Network error
        throw new Error("Network error, please try again");
      } else {
        // Other errors
        throw new Error(error.message || "An unexpected error occurred");
      }
    }
  },

  /**
   * Logout user and clear stored data
   */
  logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
  },

  /**
   * Get current user from localStorage
   * @returns {Object|null} User object or null if not logged in
   */
  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Get access token from localStorage
   * @returns {string|null} Access token or null if not found
   */
  getAccessToken() {
    return localStorage.getItem("access_token");
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user is logged in
   */
  isAuthenticated() {
    return !!this.getAccessToken();
  },
};
