import api from "./config";
import { processApiResponse, handleApiError } from "@/utils/apiUtils.js";

// Get purchase orders list
export const getPurchaseOrders = async () => {
  try {
    const response = await api.get("/api/taameer/purchases/list");
    return processApiResponse(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Get purchase order details
export const getPurchaseOrderDetails = async (purchaseId) => {
  try {
    const response = await api.post(
      "/api/taameer/purchases/order/product/details",
      {
        purchase_id: purchaseId,
      }
    );
    return processApiResponse(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Get purchase payments
export const getPurchasePayments = async (purchaseId) => {
  try {
    const response = await api.post("/api/taameer/purchases/payment", {
      purchase_id: purchaseId,
    });
    return processApiResponse(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Delete purchase order
export const deletePurchaseOrder = async (purchaseId) => {
  try {
    const response = await api.post("/api/taameer/purchases/order/delete", {
      purchase_id: purchaseId,
    });
    return processApiResponse(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Update stock quantities
export const updateStock = async (payload) => {
  try {
    const response = await api.post(
      "/api/taameer/purchases/order/stock/update",
      payload
    );
    return processApiResponse(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Create purchase order
export const createPurchaseOrder = async (payload) => {
  try {
    const response = await api.post(
      "/api/taameer/create/purchases/orders",
      payload
    );
    return processApiResponse(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Get suppliers for purchase orders
export const getSuppliersForPurchase = async () => {
  try {
    const response = await api.get("/api/taameer/purchases/get_suppliers");
    return processApiResponse(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Create payment for purchase order
export const createPayment = async (payload) => {
  try {
    console.log("Sending payment request with payload:", payload);
    console.log("Payload type:", typeof payload);
    console.log("Is FormData:", payload instanceof FormData);

    // Log FormData contents for debugging
    if (payload instanceof FormData) {
      console.log("FormData contents:");
      for (let [key, value] of payload.entries()) {
        console.log(`${key}:`, value);
      }
    }

    const response = await api.post(
      "/api/taameer/purchases/payment/create",
      payload,
      {
        headers:
          payload instanceof FormData
            ? {}
            : {
                "Content-Type": "application/json",
              },
      }
    );

    console.log("Payment API response:", response);
    return processApiResponse(response);
  } catch (error) {
    console.error("Payment API error:", error);
    throw new Error(handleApiError(error));
  }
};
