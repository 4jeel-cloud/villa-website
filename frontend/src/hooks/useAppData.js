/**
 * useAppData — loads rooms, availability and (when authed) bookings.
 * Keeps all data-fetching logic out of App.jsx.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { getRooms, getAvailability, getBookings } from "../api";
import { fetchCalendarEvents, subscribeCalendarEvents } from "../calendarDb";
import { loadBookingCache } from "../bookingCache";
import { BOOKED_SUFFIX, BOOKED_COLOR, CONFIRMED_STATUS } from "../constants";

export function mergeBookingsIntoAvailability(availData, bookingsData) {
  if (!bookingsData?.length) return availData;
  const merged = availData.slice();
  const seen = new Set();
  for (const e of merged) seen.add(`${e.start}|${e.end}|${e.title}`);
  for (const b of bookingsData) {
    if (b.status !== CONFIRMED_STATUS) continue;
    const key = `${b.checkIn}|${b.checkOut}|${b.roomName}${BOOKED_SUFFIX}`;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push({ id: b.id, title: `${b.roomName}${BOOKED_SUFFIX}`, start: b.checkIn, end: b.checkOut, color: BOOKED_COLOR });
    }
  }
  return merged;
}

export function useAppData({ adminToken, authChecked, showNotification }) {
  const [rooms, setRooms] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsFetchError, setBookingsFetchError] = useState(false);
  const [roomSettings, setRoomSettings] = useState({});

  const bookingsFetched = useRef(false);
  const [bookingsFetchTrigger, setBookingsFetchTrigger] = useState(0);

  // Keep a ref so Firestore subscription always reads latest bookings
  const bookingsRef = useRef([]);
  useEffect(() => { bookingsRef.current = bookings; }, [bookings]);

  // Real-time Firestore subscription for admin calendar auto-refresh
  useEffect(() => {
    const unsub = subscribeCalendarEvents((events) => {
      setAvailability(mergeBookingsIntoAvailability(events, bookingsRef.current));
    });
    return unsub;
  }, []);

  // Load public data (rooms + availability) immediately — no auth required
  useEffect(() => {
    (async () => {
      try {
        const firestoreEvents = await fetchCalendarEvents();
        if (firestoreEvents?.length) setAvailability(firestoreEvents);
      } catch { /* fall back to API */ }
      setLoading(false);
      setDataLoaded(true);

      try {
        const [roomsData, availData] = await Promise.all([getRooms(), getAvailability()]);
        setRooms(roomsData);
        setAvailability(mergeBookingsIntoAvailability(availData, []));
        setRoomSettings((prev) => {
          const next = { ...prev };
          roomsData.forEach((room) => {
            if (!next[room.id]) {
              next[room.id] = { basePrice: room.basePrice, imagesInput: room.images.join(", ") };
            }
          });
          return next;
        });
      } catch (err) {
        showNotification("error", err?.message || "Failed to load data.");
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load bookings once admin token is available
  useEffect(() => {
    if (!authChecked || bookingsFetched.current || !adminToken) return;
    (async () => {
      setBookingsLoading(true);
      const cached = await loadBookingCache();
      if (cached?.length) setBookings(cached);
      try {
        const data = await getBookings(adminToken);
        setBookings(data);
        bookingsFetched.current = true;
        setBookingsFetchError(false);
      } catch (e) {
        console.warn("Failed to fetch bookings:", e);
        setBookingsFetchError(true);
        showNotification("error", "Could not load bookings. Check your connection and retry.");
      } finally {
        setBookingsLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, adminToken, bookingsFetchTrigger]);

  // Merge bookings into availability once both are ready
  useEffect(() => {
    if (!dataLoaded || !bookingsFetched.current) return;
    setAvailability((prev) => mergeBookingsIntoAvailability(prev, bookings));
  }, [dataLoaded, bookings]);

  const retryFetchBookings = useCallback(() => {
    bookingsFetched.current = false;
    setBookingsFetchError(false);
    setBookingsFetchTrigger(c => c + 1);
  }, []);

  return {
    rooms, setRooms,
    availability, setAvailability,
    bookings, setBookings,
    loading, dataLoaded,
    bookingsLoading, bookingsFetchError,
    roomSettings, setRoomSettings,
    retryFetchBookings,
  };
}
