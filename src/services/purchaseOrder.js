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
