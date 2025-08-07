import { create } from "zustand";
import {
  fetchAllSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  toggleSupplierStatus,
} from "@/services/supplier.js";

/**
 * Supplier Store - Zustand store for supplier data
 */
export const useSupplierStore = create((set, get) => ({
  // State
  suppliers: [],
  isLoading: false,
  error: null,

  // Actions
  fetchSuppliers: async () => {
    try {
      set({ isLoading: true, error: null });

      const response = await fetchAllSuppliers();

      if (response.success && response.data) {
        set({
          suppliers: response.data || [],
          isLoading: false,
        });
      } else {
        throw new Error(response.message || "Failed to fetch suppliers");
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  addSupplier: async (supplierData) => {
    try {
      set({ isLoading: true, error: null });

      const response = await createSupplier(supplierData);

      if (response.success) {
        // Refresh the suppliers list
        await get().fetchSuppliers();
        set({ isLoading: false });
      } else {
        throw new Error(response.message || "Failed to create supplier");
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  updateSupplier: async (supplierId, supplierData) => {
    try {
      set({ isLoading: true, error: null });

      const response = await updateSupplier(supplierId, supplierData);

      if (response.success) {
        // Refresh the suppliers list
        await get().fetchSuppliers();
        set({ isLoading: false });
      } else {
        throw new Error(response.message || "Failed to update supplier");
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  deleteSupplier: async (supplierId) => {
    try {
      set({ isLoading: true, error: null });

      const response = await deleteSupplier(supplierId);

      if (response.success) {
        // Refresh the suppliers list
        await get().fetchSuppliers();
        set({ isLoading: false });
      } else {
        throw new Error(response.message || "Failed to delete supplier");
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  toggleStatus: async (supplierId, status) => {
    try {
      set({ isLoading: true, error: null });

      const response = await toggleSupplierStatus(supplierId, status);

      if (response.success) {
        // Refresh the suppliers list
        await get().fetchSuppliers();
        set({ isLoading: false });
      } else {
        throw new Error(response.message || "Failed to update supplier status");
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  // Reset store
  reset: () => {
    set({
      suppliers: [],
      isLoading: false,
      error: null,
    });
  },
}));
