import { createStore } from "zustand/vanilla";
import { useStore as useZustandStore } from "zustand/react";
import {
  getPurchaseOrders,
  getPurchaseOrderDetails,
  getPurchasePayments,
  deletePurchaseOrder,
  updateStock,
  createPayment,
} from "@/services/purchaseOrder";

/**
 * Purchase Order Store - Zustand store for purchase order data
 * Follows the same pattern as useSupplierStore and useUserStore
 */
export const purchaseOrderStore = createStore((set, get) => ({
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

  // Update received quantities for products
  updateReceivedQty: async (purchaseId, products) => {
    try {
      set({ isLoading: true, error: null });

      // Make API calls for each product
      const updatePromises = products.map((product) =>
        updateStock({
          purchase_id: purchaseId,
          id: product.id,
          purchase_quantity: product.purchase_quantity,
          total_quantity_received: product.total_quantity_received,
          balance_quantity: product.balance_quantity,
        })
      );

      await Promise.all(updatePromises);

      // Update the selected purchase order in store with new data
      const currentSelectedOrder = get().selectedPurchaseOrder;
      if (currentSelectedOrder && currentSelectedOrder.id === purchaseId) {
        const updatedOrder = {
          ...currentSelectedOrder,
          purchases_product_details: products,
        };
        set({ selectedPurchaseOrder: updatedOrder });
      }

      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  // Mark stock as fully received
  markStockReceived: async (purchaseId, products) => {
    try {
      set({ isLoading: true, error: null });

      // Find products that need to be updated (where received < ordered)
      const productsToUpdate = products.filter(
        (product) => product.purchase_quantity > product.total_quantity_received
      );

      if (productsToUpdate.length === 0) {
        set({ isLoading: false });
        return {
          success: true,
          message: "All products already fully received",
        };
      }

      // Update each product to set received = ordered
      const updatePromises = productsToUpdate.map((product) =>
        updateStock({
          purchase_id: purchaseId,
          id: product.id,
          purchase_quantity: product.purchase_quantity,
          total_quantity_received: product.purchase_quantity,
          balance_quantity: 0,
        })
      );

      await Promise.all(updatePromises);

      // Update the selected purchase order in store with new data
      const currentSelectedOrder = get().selectedPurchaseOrder;
      if (currentSelectedOrder && currentSelectedOrder.id === purchaseId) {
        const updatedOrder = {
          ...currentSelectedOrder,
          purchases_product_details:
            currentSelectedOrder.purchases_product_details.map((product) => {
              const updatedProduct = productsToUpdate.find(
                (p) => p.id === product.id
              );
              if (updatedProduct) {
                return {
                  ...product,
                  total_quantity_received: product.purchase_quantity,
                  balance_quantity: 0,
                };
              }
              return product;
            }),
        };
        set({ selectedPurchaseOrder: updatedOrder });
      }

      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  // Create payment for purchase order
  createPayment: async (payload) => {
    try {
      set({ isLoading: true, error: null });

      const response = await createPayment(payload);

      if (response.success) {
        // Refresh payment history for the current purchase order
        const currentSelectedOrder = get().selectedPurchaseOrder;
        if (currentSelectedOrder) {
          await get().getPurchasePayments(currentSelectedOrder.id);
        }
        
        set({ isLoading: false });
        return response;
      } else {
        throw new Error(response.message || "Failed to create payment");
      }
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

export const usePurchaseOrderStore = () => useZustandStore(purchaseOrderStore);
