import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000"
});

export const getRooms = async () => (await api.get("/rooms")).data;
export const getAvailability = async () => (await api.get("/availability")).data;
export const getBookings = async (token) =>
  (await api.get("/bookings", { headers: token ? { Authorization: `Bearer ${token}` } : {} })).data;
export const createBooking = async (payload) => (await api.post("/bookings", payload)).data;
export const createRazorpayOrder = async (payload) => (await api.post("/api/create-razorpay-order", payload)).data;
export const cancelBooking = async (id, payload, token) =>
  (await api.patch(`/admin/bookings/${id}/cancel`, payload, { headers: token ? { Authorization: `Bearer ${token}` } : {} })).data;
export const updateRoomPrice = async (id, basePrice, token) =>
  (await api.patch(`/admin/rooms/${id}/price`, { basePrice }, { headers: token ? { Authorization: `Bearer ${token}` } : {} })).data;
export const updateRoomImages = async (id, images, token) =>
  (await api.patch(`/admin/rooms/${id}/images`, { images }, { headers: token ? { Authorization: `Bearer ${token}` } : {} })).data;
