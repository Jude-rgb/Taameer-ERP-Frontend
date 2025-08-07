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
    }),


  // Get purchase order by ID
  getPurchaseOrderById: (orderId) => {
    const { purchaseOrders } = get();
    return purchaseOrders.find((order) => order.id === orderId);
  },

}));
