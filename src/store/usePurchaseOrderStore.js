import { create } from "zustand";
import {
  getPurchaseOrders,
  getPurchaseOrderDetails,
  getPurchasePayments,
  deletePurchaseOrder,
} from "@/services/purchaseOrder";

/**
 * Purchase Order Store - Zustand store for purchase order data
 * Follows the same pattern as useSupplierStore and useUserStore
 */
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

  // Actions
  fetchPurchaseOrders: async () => {
    try {
      set({ isLoading: true, error: null });

      const response = await getPurchaseOrders();

      if (response.success && response.data) {
        set({
          purchaseOrders: response.data || [],
          isLoading: false,
        });
      } else {
        throw new Error(response.message || "Failed to fetch purchase orders");
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  // Get purchase order details
  getPurchaseOrderDetails: async (purchaseId) => {
    try {
      set({ isLoading: true, error: null });

      const response = await getPurchaseOrderDetails(purchaseId);

      if (response.success && response.data) {
        set({
          selectedPurchaseOrder: response.data,
          isLoading: false,
        });
      } else {
        throw new Error(
          response.message || "Failed to fetch purchase order details"
        );
      }

      return response;
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  // Get purchase payments
  getPurchasePayments: async (purchaseId) => {
    try {
      set({ isLoading: true, error: null });

      const response = await getPurchasePayments(purchaseId);

      if (response.success && response.data) {
        set({
          purchasePayments: response.data || [],
          isLoading: false,
        });
      } else {
        throw new Error(
          response.message || "Failed to fetch purchase payments"
        );
      }

      return response;
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  // Delete purchase order
  deletePurchaseOrder: async (purchaseId) => {
    try {
      set({ isLoading: true, error: null });

      const response = await deletePurchaseOrder(purchaseId);

      if (response.success) {
        // Refresh the purchase orders list
        await get().fetchPurchaseOrders();
        set({ isLoading: false });
      } else {
        throw new Error(response.message || "Failed to delete purchase order");
      }

      return response;
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
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

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () =>
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
    }),

  // Get filtered purchase orders
  getFilteredPurchaseOrders: () => {
    const { purchaseOrders, filters } = get();

    let filtered = [...purchaseOrders];

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

    return filtered;
  },

  // Get purchase order by ID
  getPurchaseOrderById: (orderId) => {
    const { purchaseOrders } = get();
    return purchaseOrders.find((order) => order.id === orderId);
  },

  // Get unique suppliers from purchase orders
  getUniqueSuppliers: () => {
    const { purchaseOrders } = get();
    const uniqueSuppliers = new Map();
    purchaseOrders.forEach(order => {
      if (order.suppliers) {
        uniqueSuppliers.set(order.suppliers.id, order.suppliers);
      }
    });
    return Array.from(uniqueSuppliers.values());
  },
}));
