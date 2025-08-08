import { create } from "zustand";
import { grnService } from "@/services/grn.js";

type GrnItem = any;

interface GrnStore {
  grns: GrnItem[];
  isLoading: boolean;
  error: string | null;
  fetchGRNs: () => Promise<GrnItem[]>;
}

export const useGrnStore = create<GrnStore>((set) => ({
  grns: [],
  isLoading: false,
  error: null,
  fetchGRNs: async () => {
    try {
      set({ isLoading: true, error: null });
      const resp = await grnService.fetchAllGRN();
      const list = resp.data || [];
      set({ grns: list, isLoading: false });
      return list;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
}));


