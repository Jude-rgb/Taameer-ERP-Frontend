import { create } from "zustand";
import { productService } from "@/services/product.js";

export const useProductStore = create((set, get) => ({
  // State
  products: [],
  isLoading: false,
  error: null,

  // Actions
  setProducts: (products) => set({ products }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  // Fetch all products
  fetchProducts: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await productService.fetchAllProducts();
      set({
        products: response.data || [],
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  // Add a new product
  addProduct: async (productData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await productService.createProduct(productData);
      const newProduct = response.data;

      // Refresh the entire products list to ensure consistency
      const updatedProductsResponse = await productService.fetchAllProducts();
      
      set({
        products: updatedProductsResponse.data || [],
        isLoading: false,
      });

      return newProduct;
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  // Update a product
  updateProduct: async (productData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await productService.updateProduct(productData);
      const updatedProduct = response.data;

      // Refresh the entire products list to ensure consistency
      const updatedProductsResponse = await productService.fetchAllProducts();
      
      set({
        products: updatedProductsResponse.data || [],
        isLoading: false,
      });

      return updatedProduct;
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  // Delete a product
  deleteProduct: async (productId) => {
    try {
      set({ isLoading: true, error: null });
      await productService.deleteProduct(productId);

      set((state) => ({
        products: state.products.filter((product) => product.id !== productId),
        isLoading: false,
      }));
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

  // Get product by ID
  getProductById: (productId) => {
    const { products } = get();
    return products.find((product) => product.id === productId);
  },

  // Get unique brands
  getUniqueBrands: () => {
    const { products } = get();
    const brands = [
      ...new Set(products.map((product) => product.product_brand)),
    ];
    return brands.filter((brand) => brand).sort();
  },
}));
