import { create } from "zustand";
import {
  getPurchaseOrders,
  getPurchaseOrderDetails,
  getPurchasePayments,
  deletePurchaseOrder,
} from "@/services/purchaseOrder";

export const usePurchaseOrderStore = create((set, get) => ({
  // State
  purchaseOrders: [],
  selectedPurchaseOrder: null,
  purchasePayments: [],
  isLoading: false,
  error: null,
  filters: {
    supplier: null,
    dateRange: null,
    paymentStatus: null,
    purchaseStatus: null,
  },
  searchQuery: "",

  // Actions
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Fetch purchase orders list
  fetchPurchaseOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getPurchaseOrders();
      console.log("Purchase orders response:", response); // Debug log

      if (response.success && response.data) {
        set({ purchaseOrders: response.data || [], isLoading: false });
      } else {
        throw new Error(response.message || "Failed to fetch purchase orders");
      }

      return response;
    } catch (error) {
      console.error("Error fetching purchase orders:", error); // Debug log
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Get purchase order details
  getPurchaseOrderDetails: async (purchaseId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getPurchaseOrderDetails(purchaseId);
      console.log("Purchase order details response:", response); // Debug log

      if (response.success && response.data) {
        set({ selectedPurchaseOrder: response.data, isLoading: false });
      } else {
        throw new Error(
          response.message || "Failed to fetch purchase order details"
        );
      }

      return response;
    } catch (error) {
      console.error("Error fetching purchase order details:", error); // Debug log
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Get purchase payments
  getPurchasePayments: async (purchaseId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getPurchasePayments(purchaseId);
      console.log("Purchase payments response:", response); // Debug log

      if (response.success && response.data) {
        set({ purchasePayments: response.data || [], isLoading: false });
      } else {
        throw new Error(
          response.message || "Failed to fetch purchase payments"
        );
      }

      return response;
    } catch (error) {
      console.error("Error fetching purchase payments:", error); // Debug log
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Delete purchase order
  deletePurchaseOrder: async (purchaseId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await deletePurchaseOrder(purchaseId);
      console.log("Delete purchase order response:", response); // Debug log

      if (response.success) {
        // Remove the deleted order from the list
        const currentOrders = get().purchaseOrders;
        const updatedOrders = currentOrders.filter(
          (order) => order.id !== purchaseId
        );
        set({ purchaseOrders: updatedOrders, isLoading: false });
      } else {
        throw new Error(response.message || "Failed to delete purchase order");
      }

      return response;
    } catch (error) {
      console.error("Error deleting purchase order:", error); // Debug log
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Set filters
  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
  clearFilters: () =>
    set({
      filters: {
        supplier: null,
        dateRange: null,
        paymentStatus: null,
        purchaseStatus: null,
      },
    }),

  // Set search query
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Reset store
  resetStore: () =>
    set({
      purchaseOrders: [],
      selectedPurchaseOrder: null,
      purchasePayments: [],
      isLoading: false,
      error: null,
      filters: {
        supplier: null,
        dateRange: null,
        paymentStatus: null,
        purchaseStatus: null,
      },
      searchQuery: "",
    }),

  // Get filtered purchase orders
  getFilteredPurchaseOrders: () => {
    const { purchaseOrders, filters, searchQuery } = get();
    console.log("Current purchase orders:", purchaseOrders); // Debug log
    console.log("Current filters:", filters); // Debug log
    console.log("Current search query:", searchQuery); // Debug log

    let filtered = [...purchaseOrders];

    // Apply search query first
    if (searchQuery && searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((order) => {
        // Search in purchase_no
        if (order.purchase_no?.toLowerCase().includes(searchLower)) {
          return true;
        }

        // Search in supplier name
        const supplier = order.suppliers;
        if (supplier) {
          if (supplier.supplier_type === "business_type") {
            if (supplier.business_name?.toLowerCase().includes(searchLower)) {
              return true;
            }
          } else {
            const fullName = `${supplier.first_name || ""} ${
              supplier.last_name || ""
            }`
              .trim()
              .toLowerCase();
            if (fullName.includes(searchLower)) {
              return true;
            }
          }
        }

        // Search in quotation_ref
        if (order.quotation_ref?.toLowerCase().includes(searchLower)) {
          return true;
        }

        return false;
      });
    }

    // Apply supplier filter
    if (filters.supplier && filters.supplier.trim()) {
      const supplierFilter = filters.supplier.toLowerCase().trim();
      filtered = filtered.filter((order) => {
        const supplier = order.suppliers;
        if (!supplier) return false;

        if (supplier.supplier_type === "business_type") {
          return supplier.business_name?.toLowerCase().includes(supplierFilter);
        } else {
          const fullName = `${supplier.first_name || ""} ${
            supplier.last_name || ""
          }`.trim();
          return fullName.toLowerCase().includes(supplierFilter);
        }
      });
    }

    // Apply date range filter
    if (filters.dateRange?.from || filters.dateRange?.to) {
      filtered = filtered.filter((order) => {
        const purchaseDate = new Date(order.purchase_date);

        if (filters.dateRange.from && filters.dateRange.to) {
          const fromDate = new Date(filters.dateRange.from);
          const toDate = new Date(filters.dateRange.to);
          return purchaseDate >= fromDate && purchaseDate <= toDate;
        } else if (filters.dateRange.from) {
          const fromDate = new Date(filters.dateRange.from);
          return purchaseDate >= fromDate;
        } else if (filters.dateRange.to) {
          const toDate = new Date(filters.dateRange.to);
          return purchaseDate <= toDate;
        }

        return true;
      });
    }

    // Apply payment status filter
    if (filters.paymentStatus) {
      filtered = filtered.filter(
        (order) => order.payment_status === filters.paymentStatus
      );
    }

    // Apply purchase status filter (using stock_status for purchase status)
    if (filters.purchaseStatus) {
      filtered = filtered.filter(
        (order) => order.stock_status === filters.purchaseStatus
      );
    }

    console.log("Filtered purchase orders:", filtered); // Debug log
    return filtered;
  },
}));
