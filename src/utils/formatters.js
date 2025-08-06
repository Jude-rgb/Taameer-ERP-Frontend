/**
 * Utility functions for formatting data
 */

/**
 * Format date to DD/MM/YYYY
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return "";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/**
 * Format currency to OMR with 3 decimal places and commas
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatOMRCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "OMR 0.000";
  }

  // Format with commas and 3 decimal places
  const formattedNumber = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
    useGrouping: true, // This ensures commas are added
  }).format(amount);

  return `OMR ${formattedNumber}`;
};

/**
 * Get status color for invoice payment status
 * @param {string} status - Payment status
 * @returns {string} CSS class for status color
 */
export const getInvoiceStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "done":
    case "paid":
      return "bg-success text-success-foreground";
    case "pending":
      return "bg-warning text-warning-foreground";
    case "partially":
      return "bg-orange-500 text-white";
    case "overdue":
      return "bg-destructive text-destructive-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

/**
 * Format sales trend date for display
 * @param {string} dateKey - Date key from trends (YYYY-MM or YYYY-MM-DD)
 * @param {string} period - Period type (monthly, weekly, daily)
 * @returns {string} Formatted date string
 */
export const formatTrendDate = (dateKey, period = "monthly") => {
  if (!dateKey) return "";

  const date = new Date(dateKey);
  if (isNaN(date.getTime())) return dateKey;

  switch (period) {
    case "daily":
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      });
    case "weekly":
      return `Week ${date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      })}`;
    case "monthly":
    default:
      return date.toLocaleDateString("en-GB", {
        month: "short",
        year: "numeric",
      });
  }
};
