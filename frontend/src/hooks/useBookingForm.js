import { useCallback, useMemo, useState } from "react";
import { createBooking, createRazorpayOrder } from "../api";
import { toDateKey } from "../utils";
import { BOOKED_COLOR, BOOKED_SUFFIX } from "../constants";

const INITIAL_FORM = {
  roomId: "", checkIn: "", checkOut: "",
  guestName: "", guestEmail: "", guestPhone: "",
  guests: "", guestType: "Family",
};

export function useBookingForm({ rooms, availability, setAvailability, setBookings, showNotification }) {
  const [bookingForm, setBookingForm] = useState(INITIAL_FORM);
  const [waitingForCheckout, setWaitingForCheckout] = useState(false);
  const [focusedDate, setFocusedDate] = useState("");

  const selectedRangeLabel = useMemo(() =>
    bookingForm.checkIn && bookingForm.checkOut
      ? `Selected stay: ${bookingForm.checkIn} to ${bookingForm.checkOut}`
      : waitingForCheckout
        ? `Check-in selected: ${bookingForm.checkIn}. Now click a check-out date.`
        : "",
    [bookingForm.checkIn, bookingForm.checkOut, waitingForCheckout]);

  const onBookingSuccess = useCallback((booking) => {
    showNotification("success", "Booking confirmed successfully.");
    setBookings((prev) => [...prev, booking]);
    setAvailability((prev) => [...prev, {
      id: booking.id, title: `${booking.roomName}${BOOKED_SUFFIX}`,
      start: booking.checkIn, end: booking.checkOut, color: BOOKED_COLOR,
    }]);
    setBookingForm(INITIAL_FORM);
  }, [showNotification, setBookings, setAvailability]);

  const handleGuestBooking = useCallback(async (event) => {
    event.preventDefault();
    if (!bookingForm.checkIn || !bookingForm.checkOut) {
      showNotification("error", "Please select check-in and check-out from the calendar.");
      return;
    }
    try {
      if (import.meta.env.VITE_RAZORPAY_KEY_ID) {
        const order = await createRazorpayOrder({
          roomId: bookingForm.roomId,
          checkIn: bookingForm.checkIn,
          checkOut: bookingForm.checkOut,
        });
        if (typeof window.Razorpay === "undefined") {
          showNotification("error", "Payment system still loading. Please try again.");
          return;
        }
        const rzp = new window.Razorpay({
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: order.amount, currency: "INR",
          name: "Creek View Villa",
          description: rooms.find(r => r.id === bookingForm.roomId)?.name || "Room booking",
          order_id: order.id,
          handler: async (response) => {
            try {
              const booking = await createBooking({
                ...bookingForm,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId:   response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              });
              onBookingSuccess(booking);
            } catch (err) {
              showNotification("error", err?.message || "Payment succeeded but booking failed. Contact support.");
            }
          },
          prefill: { name: bookingForm.guestName, email: bookingForm.guestEmail, contact: bookingForm.guestPhone },
          theme: { color: "#06402B" },
          modal: { ondismiss: () => showNotification("error", "Payment cancelled. Booking not confirmed.") },
        });
        rzp.open();
      } else {
        const booking = await createBooking({ ...bookingForm });
        onBookingSuccess(booking);
      }
    } catch (error) {
      showNotification("error", error?.message || "Could not complete booking.");
    }
  }, [bookingForm, rooms, onBookingSuccess, showNotification]);

  const handleCalendarDateClick = useCallback((clickInfo) => {
    const clickedDate    = clickInfo.dateStr;
    const fullyBusy      = new Set();
    const clickBlocked   = new Set();
    const selectedRoom   = rooms.find(r => r.id === bookingForm.roomId);
    const selectedRoomName = selectedRoom?.name;

    for (const evt of availability) {
      if (!evt.start || !evt.end) continue;
      if (selectedRoomName && !evt.title?.startsWith(selectedRoomName)) continue;
      let cur = new Date(evt.start + "T00:00:00");
      const end = new Date(evt.end + "T00:00:00");
      while (cur < end) { fullyBusy.add(toDateKey(cur)); cur.setDate(cur.getDate() + 1); }
      cur = new Date(evt.start + "T00:00:00");
      cur.setDate(cur.getDate() + 1);
      while (cur < end) { clickBlocked.add(toDateKey(cur)); cur.setDate(cur.getDate() + 1); }
    }

    if (rooms.length > 0) {
      const occMap = new Map();
      for (const evt of availability) {
        if (!evt.title?.endsWith(BOOKED_SUFFIX)) continue;
        const rName = evt.title.slice(0, -BOOKED_SUFFIX.length);
        let cur = new Date(evt.start + "T00:00:00");
        const end = new Date(evt.end + "T00:00:00");
        cur.setDate(cur.getDate() + 1);
        while (cur < end) {
          const key = toDateKey(cur);
          if (!occMap.has(key)) occMap.set(key, new Set());
          occMap.get(key).add(rName);
          cur.setDate(cur.getDate() + 1);
        }
      }
      for (const [date, rs] of occMap) {
        if (rs.size >= rooms.length) clickBlocked.add(date);
      }
    }

    if (clickBlocked.has(clickedDate)) {
      showNotification("error", "This date is already booked. Please select an available date.");
      return;
    }
    setFocusedDate(clickedDate);

    if (bookingForm.checkIn && bookingForm.checkOut) {
      if (clickedDate > bookingForm.checkIn && clickedDate < bookingForm.checkOut) return;
      if (clickedDate === bookingForm.checkIn || clickedDate === bookingForm.checkOut) {
        setBookingForm(p => ({ ...p, checkIn: "", checkOut: "" })); setWaitingForCheckout(false); return;
      }
      setBookingForm(p => ({ ...p, checkIn: clickedDate, checkOut: "" })); setWaitingForCheckout(true); return;
    }
    if (!bookingForm.checkIn) {
      setBookingForm(p => ({ ...p, checkIn: clickedDate, checkOut: "" })); setWaitingForCheckout(true); return;
    }
    if (clickedDate === bookingForm.checkIn) {
      setBookingForm(p => ({ ...p, checkIn: "", checkOut: "" })); setWaitingForCheckout(false); return;
    }
    if (clickedDate < bookingForm.checkIn) {
      setBookingForm(p => ({ ...p, checkIn: clickedDate, checkOut: "" })); setWaitingForCheckout(true); return;
    }
    let cursor = new Date(bookingForm.checkIn + "T00:00:00");
    const coDate = new Date(clickedDate + "T00:00:00");
    while (cursor < coDate) {
      if (fullyBusy.has(toDateKey(cursor))) {
        showNotification("error", "A date in this range is already booked. Please choose different dates.");
        setBookingForm(p => ({ ...p, checkIn: "", checkOut: "" })); setWaitingForCheckout(false); return;
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    setBookingForm(p => ({ ...p, checkOut: clickedDate })); setWaitingForCheckout(false);
  }, [availability, bookingForm, rooms, showNotification]);

  const setBookingFormField = useCallback((v) => setBookingForm((p) => ({ ...p, ...v })), []);

  return {
    bookingForm, setBookingForm, setBookingFormField,
    waitingForCheckout, setWaitingForCheckout,
    focusedDate,
    selectedRangeLabel,
    handleGuestBooking, handleCalendarDateClick,
  };
}
