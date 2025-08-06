import { create } from "zustand";
import { fetchInvoices } from "@/services/dashboard.js";

/**
 * Invoice Store - Zustand store for invoice data
 */
export const useInvoiceStore = create((set, get) => ({
  // State
  invoices: [],
  isLoading: false,
  error: null,

  // Actions
  fetchInvoices: async () => {
    try {
      set({ isLoading: true, error: null });

      const response = await fetchInvoices();

      if (response.success && response.data) {
        set({
          invoices: response.data || [],
          isLoading: false,
        });
      } else {
        throw new Error(response.message || "Failed to fetch invoices");
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  // Get filtered invoices by user_id
  getFilteredInvoices: (userId = null) => {
    const { invoices } = get();
    if (!userId) return invoices;
    return invoices.filter((invoice) => invoice.user_id === userId);
  },

  // Get recent invoices (latest 5)
  getRecentInvoices: (userId = null) => {
    const filteredInvoices = get().getFilteredInvoices(userId);
    return filteredInvoices
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
  },

  // Calculate total sales from invoices
  getTotalSales: (userId = null) => {
    const filteredInvoices = get().getFilteredInvoices(userId);
    return filteredInvoices.reduce((sum, invoice) => {
      return sum + parseFloat(invoice.quotation_total || 0);
    }, 0);
  },

  // Calculate outstanding payments
  getOutstandingPayments: (userId = null) => {
    const filteredInvoices = get().getFilteredInvoices(userId);
    return filteredInvoices.reduce((sum, invoice) => {
      if (invoice.invoice_payment_status !== "done") {
        // Calculate outstanding amount from payment records
        const totalPaid =
          invoice.invoice_payment?.reduce((paidSum, payment) => {
            return paidSum + parseFloat(payment.paid_amount || 0);
          }, 0) || 0;

        const totalAmount = parseFloat(invoice.quotation_total || 0);
        return sum + (totalAmount - totalPaid);
      }
      return sum;
    }, 0);
  },

  // Get invoice status breakdown for pie chart
  getInvoiceStatusBreakdown: (userId = null) => {
    const filteredInvoices = get().getFilteredInvoices(userId);
    const breakdown = {
      done: 0,
      pending: 0,
      partially: 0,
      overdue: 0,
    };

    filteredInvoices.forEach((invoice) => {
      const status = invoice.invoice_payment_status?.toLowerCase();
      if (status in breakdown) {
        breakdown[status]++;
      }
    });

    return breakdown;
  },

  // Get sales trends data (monthly, weekly, daily) - filtered to past 6 months
  getSalesTrends: (userId = null, period = "monthly") => {
    const filteredInvoices = get().getFilteredInvoices(userId);
    const trends = {};

    // Calculate date range for past 6 months including current month
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 5); // 6 months ago (including current)
    sixMonthsAgo.setDate(1); // Start of month

    filteredInvoices.forEach((invoice) => {
      const date = new Date(invoice.created_at);

      // Filter to only include invoices from past 6 months
      if (date < sixMonthsAgo) return;

      let key;

      switch (period) {
        case "daily":
          key = date.toISOString().split("T")[0]; // YYYY-MM-DD
          break;
        case "weekly":
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split("T")[0];
          break;
        case "monthly":
        default:
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}`; // YYYY-MM
          break;
      }

      if (!trends[key]) {
        trends[key] = {
          date: key,
          sales: 0,
          count: 0,
        };
      }

      trends[key].sales += parseFloat(invoice.quotation_total || 0);
      trends[key].count += 1;
    });

    // Convert to array and sort by date
    return Object.values(trends).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  },

  // Get top 4 selling products by quantity from invoice_stock - filtered by user_id and current month
  getTopProducts: (userId = null, month = null) => {
    const filteredInvoices = get().getFilteredInvoices(userId);
    const productSales = {};

    // If no month specified, use current month
    const targetMonth = month || new Date().getMonth();
    const targetYear = month
      ? new Date().getFullYear()
      : new Date().getFullYear();

    filteredInvoices.forEach((invoice) => {
      const invoiceDate = new Date(invoice.created_at);
      const invoiceMonth = invoiceDate.getMonth();
      const invoiceYear = invoiceDate.getFullYear();

      // Only include invoices from the specified month and year
      if (invoiceMonth === targetMonth && invoiceYear === targetYear) {
        if (invoice.invoice_stock && Array.isArray(invoice.invoice_stock)) {
          invoice.invoice_stock.forEach((item) => {
            const productName = item.product_name;
            const quantity = parseFloat(item.quantity || 0);

            if (productName) {
              if (!productSales[productName]) {
                productSales[productName] = 0;
              }
              productSales[productName] += quantity;
            }
          });
        }
      }
    });

    // Convert to array, sort by quantity, and get top 4
    const sortedProducts = Object.entries(productSales)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 4);

    return sortedProducts;
  },

  // Get top products for each month (for chart display)
  getTopProductsByMonth: (userId = null) => {
    const filteredInvoices = get().getFilteredInvoices(userId);
    const monthlyData = {};

    // Initialize last 6 months
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(now.getMonth() - (5 - i));
      const monthKey = `${d.getFullYear()}-${(d.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      monthlyData[monthKey] = {};
    }

    filteredInvoices.forEach((invoice) => {
      const invoiceDate = new Date(invoice.created_at);
      const monthKey = `${invoiceDate.getFullYear()}-${(
        invoiceDate.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}`;

      // Only process if it's within the last 6 months
      if (monthlyData[monthKey]) {
        if (invoice.invoice_stock && Array.isArray(invoice.invoice_stock)) {
          invoice.invoice_stock.forEach((item) => {
            const productName = item.product_name;
            const quantity = parseFloat(item.quantity || 0);

            if (productName) {
              if (!monthlyData[monthKey][productName]) {
                monthlyData[monthKey][productName] = 0;
              }
              monthlyData[monthKey][productName] += quantity;
            }
          });
        }
      }
    });

    // Convert each month to top 4 products
    const result = {};
    Object.keys(monthlyData).forEach((monthKey) => {
      const sortedProducts = Object.entries(monthlyData[monthKey])
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 4);
      result[monthKey] = sortedProducts;
    });

    return result;
  },

  // Helper to filter invoices by user_id

  // Reset store
  reset: () => {
    set({
      invoices: [],
      isLoading: false,
      error: null,
    });
  },
}));
