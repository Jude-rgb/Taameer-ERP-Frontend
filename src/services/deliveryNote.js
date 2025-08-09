import api from "./config";
import { processApiResponse, handleApiError } from "@/utils/apiUtils.js";

// Get all delivery notes
export const getDeliveryNotes = async () => {
  try {
    const response = await api.get("/api/taameer/deliverynote/all");
    return processApiResponse(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Create a delivery note from invoice payload
export const createDeliveryNote = async (payload) => {
  try {
    const response = await api.post(
      "/api/taameer/deliverynote/create",
      payload
    );
    return processApiResponse(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Update delivered quantity for a single product line in a delivery note
// Payload example: { product_id: 628, new_delivered: "1" }
export const updateDeliveryQuantity = async ({ product_id, new_delivered }) => {
  try {
    const response = await api.post("/api/taameer/deliverynote/update", {
      product_id,
      new_delivered,
    });
    return processApiResponse(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Mark an entire delivery note as completed
// Payload example: { delivery_note_id: 435 }
export const completeDeliveryNote = async ({ delivery_note_id }) => {
  try {
    const response = await api.post(
      "/api/taameer/deliverynote/completeddelivery",
      { delivery_note_id }
    );
    return processApiResponse(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Upload unloading image/comment for a delivery note (multipart/form-data)
// Expected fields: image_path (binary), comment, image_update_date, delivery_note_id
export const uploadUnloading = async (formData) => {
  try {
    const response = await api.post(
      "/api/taameer/deliverynote/unloading",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return processApiResponse(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Remove an unloading image/comment
// Payload example: { image_id: 420 }
export const removeUnloadingImage = async ({ image_id }) => {
  try {
    const response = await api.post(
      "/api/taameer/deliverynote/removeunloading",
      { image_id }
    );
    return processApiResponse(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
