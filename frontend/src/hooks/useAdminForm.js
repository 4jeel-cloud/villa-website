import { useCallback, useState } from "react";
import { cancelBooking, createBooking, getRooms, updateRoomImages, updateRoomPrice } from "../api";
import { mergeBookingsIntoAvailability } from "./useAppData";

const INITIAL_ADMIN_FORM = {
  roomId: "", checkIn: "", checkOut: "",
  guestName: "", guestEmail: "", guestPhone: "",
  guests: "", guestType: "Family", amount: "",
};

export function useAdminForm({
  setRooms, setBookings, bookings, setAvailability, showNotification, adminToken, roomSettings,
}) {
  const [adminForm, setAdminForm] = useState(INITIAL_ADMIN_FORM);

  const handleAdminDateClick = useCallback((clickInfo) => {
    const d = clickInfo.dateStr;
    setAdminForm((prev) => {
      if (prev.checkIn === d) return { ...prev, checkIn: "", checkOut: "" };
      if (prev.checkOut === d) return { ...prev, checkOut: "" };
      if (!prev.checkIn) return { ...prev, checkIn: d };
      if (!prev.checkOut) {
        if (new Date(d + "T00:00:00") > new Date(prev.checkIn + "T00:00:00"))
          return { ...prev, checkOut: d };
      }
      return { ...prev, checkIn: d, checkOut: "" };
    });
  }, []);

  const handleAdminBooking = useCallback(async (event) => {
    event.preventDefault();
    try {
      const booking = await createBooking({ ...adminForm, createdBy: "admin" });
      setBookings((prev) => [...prev, booking]);
      setAvailability((prev) => mergeBookingsIntoAvailability(prev, [booking]));
      showNotification("success", "Admin booking created.");
      setAdminForm(INITIAL_ADMIN_FORM);
    } catch (error) {
      showNotification("error", error?.message || "Could not create admin booking.");
    }
  }, [adminForm, setBookings, setAvailability, showNotification]);

  const handleCancel = useCallback(async (bookingId) => {
    if (!adminToken) { showNotification("error", "No admin token — try refreshing."); return; }
    try {
      await cancelBooking(bookingId, { reason: "Cancelled from admin dashboard", refundStatus: "pending" }, adminToken);
      const cancelled = bookings.find((b) => b.id === bookingId);
      setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status: "cancelled" } : b));
      setAvailability((prev) => prev.filter((e) => {
        if (e.id === bookingId) return false;
        if (cancelled && e.start === cancelled.checkIn && e.end === cancelled.checkOut && e.title?.startsWith(cancelled.roomName)) return false;
        return true;
      }));
      showNotification("success", "Booking cancelled.");
    } catch (error) {
      showNotification("error", `${error?.message || "Cancellation failed."} (HTTP ${error?.status || 0})`);
    }
  }, [adminToken, bookings, setBookings, setAvailability, showNotification]);

  const handleRoomUpdate = useCallback(async (roomId) => {
    const data = roomSettings[roomId];
    try {
      await Promise.all([
        updateRoomPrice(roomId, Number(data.basePrice), adminToken),
        updateRoomImages(roomId, data.imagesInput.split(",").map((s) => s.trim()).filter(Boolean), adminToken),
      ]);
      const freshRooms = await getRooms();
      setRooms(freshRooms);
      showNotification("success", "Room details updated.");
    } catch (error) {
      showNotification("error", error?.message || "Room update failed.");
    }
  }, [roomSettings, adminToken, setRooms, showNotification]);

  const setAdminFormField = useCallback((v) => setAdminForm((p) => ({ ...p, ...v })), []);

  return {
    adminForm, setAdminForm, setAdminFormField,
    handleAdminDateClick, handleAdminBooking, handleCancel, handleRoomUpdate,
  };
}
