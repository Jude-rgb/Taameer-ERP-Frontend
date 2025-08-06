import { create } from "zustand";
import { fetchQuotationSummary } from "@/services/dashboard.js";

/**
 * Quotation Store - Zustand store for quotation data
 */
export const useQuotationStore = create((set, get) => ({
  // State
  quotationSummary: {
    total_number_of_quotations: 0,
    total_number_of_done_quotations: 0,
    total_number_of_pending_quotations: 0,
  },
  isLoading: false,
  error: null,

  // Actions
  fetchQuotationSummary: async (userId = null) => {
    try {
      set({ isLoading: true, error: null });

      const response = await fetchQuotationSummary(userId);

      if (response.success && response.data) {
        set({
          quotationSummary: {
            total_number_of_quotations:
              response.data.total_number_of_quotations || 0,
            total_number_of_done_quotations:
              response.data.total_number_of_done_quotations || 0,
            total_number_of_pending_quotations:
              response.data.total_number_of_pending_quotations || 0,
          },
          isLoading: false,
        });
      } else {
        throw new Error(
          response.message || "Failed to fetch quotation summary"
        );
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
      quotationSummary: {
        total_number_of_quotations: 0,
        total_number_of_done_quotations: 0,
        total_number_of_pending_quotations: 0,
      },
      isLoading: false,
      error: null,
    });
  },
}));
