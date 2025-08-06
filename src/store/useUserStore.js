import { create } from "zustand";
import { fetchAllUsers, createUser } from "@/services/user.js";

/**
 * User Store - Zustand store for user data
 */
export const useUserStore = create((set, get) => ({
  // State
  users: [],
  isLoading: false,
  error: null,

  // Actions
  fetchUsers: async () => {
    try {
      set({ isLoading: true, error: null });

      const response = await fetchAllUsers();

      if (response.success && response.data) {
        set({
          users: response.data || [],
          isLoading: false,
        });
      } else {
        throw new Error(response.message || "Failed to fetch users");
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  addUser: async (userData) => {
    try {
      set({ isLoading: true, error: null });

      const response = await createUser(userData);

      if (response.success) {
        // Refresh the users list
        await get().fetchUsers();
        set({ isLoading: false });
      } else {
        throw new Error(response.message || "Failed to create user");
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
      users: [],
      isLoading: false,
      error: null,
    });
  },
}));
