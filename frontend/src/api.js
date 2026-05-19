import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000"
});

// Attach admin token to requests that need it
function adminHeaders() {
  const token = import.meta.env.VITE_ADMIN_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const getRooms = async () => (await api.get("/rooms")).data;
export const getAvailability = async () => (await api.get("/availability")).data;
export const getBookings = async () => (await api.get("/bookings")).data;
export const createBooking = async (payload) => (await api.post("/bookings", payload)).data;
export const createRazorpayOrder = async (payload) => (await api.post("/api/create-razorpay-order", payload)).data;
export const cancelBooking = async (id, payload) =>
  (await api.patch(`/admin/bookings/${id}/cancel`, payload, { headers: adminHeaders() })).data;
export const updateRoomPrice = async (id, basePrice) =>
  (await api.patch(`/admin/rooms/${id}/price`, { basePrice }, { headers: adminHeaders() })).data;
export const updateRoomImages = async (id, images) =>
  (await api.patch(`/admin/rooms/${id}/images`, { images }, { headers: adminHeaders() })).data;
