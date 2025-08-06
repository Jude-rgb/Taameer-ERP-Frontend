/**
 * Utility functions for API operations
 */

/**
 * Process API response and handle common error patterns
 * @param {Object} response - Axios response object
 * @returns {Object} Processed response data
 */
export const processApiResponse = (response) => {
  const { status, message, data } = response.data;

  if (status === "Errors") {
    throw new Error(message || "API request failed");
  }

  if (status === "Success") {
    return {
      success: true,
      message: message || "Operation successful",
      data: data || null,
    };
  }

  throw new Error("Invalid response format from server");
};

/**
 * Handle API errors and return user-friendly messages
 * @param {Error} error - Error object from axios or other sources
 * @returns {string} User-friendly error message
 */
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, message } = error.response.data;

    if (status === "Errors") {
      return message || "Request failed";
    }

    // Handle HTTP status codes
    switch (error.response.status) {
      case 400:
        return "Bad request. Please check your input.";
      case 401:
        return "Unauthorized. Please log in again.";
      case 403:
        return "Access denied. You don't have permission for this action.";
      case 404:
        return "Resource not found.";
      case 422:
        return message || "Validation error. Please check your input.";
      case 500:
        return "Server error. Please try again later.";
      default:
        return message || `Server error (${error.response.status})`;
    }
  } else if (error.request) {
    // Network error
    return "Network error. Please check your connection and try again.";
  } else {
    // Other errors
    return error.message || "An unexpected error occurred";
  }
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: "Password is required" };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      message: "Password must be at least 6 characters",
    };
  }

  return { isValid: true, message: "Password is valid" };
};

/**
 * Format API error for display
 * @param {Error} error - Error object
 * @returns {Object} Formatted error for toast/alert display
 */
export const formatErrorForDisplay = (error) => {
  const message = handleApiError(error);

  return {
    title: "Error",
    description: message,
    variant: "destructive",
  };
};

/**
 * Format success response for display
 * @param {string} message - Success message
 * @returns {Object} Formatted success for toast display
 */
export const formatSuccessForDisplay = (message) => {
  return {
    title: "Success",
    description: message,
    variant: "success",
  };
};
