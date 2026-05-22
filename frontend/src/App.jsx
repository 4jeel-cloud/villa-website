import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import {
  cancelBooking,
  createBooking,
  createRazorpayOrder,
  getAvailability,
  getBookings,
  getRooms,
  updateRoomImages,
  updateRoomPrice
} from "./api";
import ErrorBoundary from "./components/ErrorBoundary";
import UserPage from "./components/UserPage";
import RoomsPage from "./components/RoomsPage";
import Footer from "./components/Footer";

const NearbyPage = lazy(() => import("./components/NearbyPage"));
const AdminPage = lazy(() => import("./components/AdminPage"));
const AdminLoginPage = lazy(() => import("./components/AdminLoginPage"));

function App() {
  const [rooms, setRooms] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const notifTimeout = useRef(null);

  const showNotification = (type, text) => {
    if (notifTimeout.current) clearTimeout(notifTimeout.current);
    setNotification({ type, text });
    notifTimeout.current = setTimeout(() => {
      setNotification(null);
      notifTimeout.current = null;
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (notifTimeout.current) clearTimeout(notifTimeout.current);
    };
  }, []);

  const [bookingForm, setBookingForm] = useState({
    roomId: "",
    checkIn: "",
    checkOut: "",
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    guests: "",
    guestType: "Family"
  });

  const [adminForm, setAdminForm] = useState({
    roomId: "",
    checkIn: "",
    checkOut: "",
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    guests: "",
    guestType: "Family",
    amount: ""
  });

  const [roomSettings, setRoomSettings] = useState({});
  const [waitingForCheckout, setWaitingForCheckout] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [focusedDate, setFocusedDate] = useState("");
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [adminToken, setAdminToken] = useState(null);
  const location = useLocation();

  useEffect(() => {
    let unsubscribe;
    import("firebase/auth").then(({ onAuthStateChanged, getIdToken }) =>
      import("./firebase").then(({ auth }) => {
        unsubscribe = onAuthStateChanged(auth, async (user) => {
          setAdminAuthed(!!user);
          if (user) {
            const token = await getIdToken(user);
            setAdminToken(token);
          } else {
            setAdminToken(null);
          }
          setAuthChecked(true);
        });
      })
    );
    return () => unsubscribe && unsubscribe();
  }, []);

  const selectedRangeLabel = useMemo(() =>
    bookingForm.checkIn && bookingForm.checkOut
      ? `Selected stay: ${bookingForm.checkIn} to ${bookingForm.checkOut}`
      : waitingForCheckout
        ? `Check-in selected: ${bookingForm.checkIn}. Now click a check-out date.`
        : "",
  [bookingForm.checkIn, bookingForm.checkOut, waitingForCheckout]);

  const roomOptions = useMemo(() => {
    return [
      <option key="" value="" disabled>Select a room</option>,
      ...rooms.map((room) => (
        <option key={room.id} value={room.id}>
          {room.name}
        </option>
      ))
    ];
  }, [rooms]);

  const loadData = async () => {
    try {
      setLoading(true);
      let bookingsData = [];
      if (adminToken) try { bookingsData = await getBookings(adminToken); } catch { }
      const [roomsData, availabilityData] = await Promise.all([
        getRooms(),
        getAvailability()
      ]);
      setRooms(roomsData);
      const mergedAvailability = [...availabilityData];
      const seen = new Set(mergedAvailability.map(e => `${e.start}|${e.end}|${e.title}`));
      for (const b of bookingsData) {
        if (b.status !== "confirmed") continue;
        const key = `${b.checkIn}|${b.checkOut}|${b.roomName} (Booked)`;
        if (!seen.has(key)) {
          seen.add(key);
          mergedAvailability.push({ id: b.id, title: `${b.roomName} (Booked)`, start: b.checkIn, end: b.checkOut, color: "#ef4444" });
        }
      }
      setAvailability(mergedAvailability);
      setBookings(bookingsData);
      setRoomSettings((prev) => {
        const next = { ...prev };
        roomsData.forEach((room) => {
          if (!next[room.id]) {
            next[room.id] = { basePrice: room.basePrice, imagesInput: room.images.join(", ") };
          }
        });
        return next;
      });
      setBookingForm((prev) => ({ ...prev, roomId: prev.roomId || roomsData[0]?.id || "" }));
      setAdminForm((prev) => ({ ...prev, roomId: prev.roomId || roomsData[0]?.id || "" }));
    } catch (error) {
      showNotification("error", error?.response?.data?.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authChecked) loadData();
  }, [authChecked, adminToken]);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
      }
    }
  }, [location]);

  const onBookingSuccess = (booking) => {
    showNotification("success", "Booking confirmed successfully.");
    setBookings((prev) => [...prev, booking]);
    setAvailability((prev) => [
      ...prev,
      { id: booking.id, title: `${booking.roomName} (Booked)`, start: booking.checkIn, end: booking.checkOut, color: "#ef4444" }
    ]);
    setBookingForm((prev) => ({ ...prev, checkIn: "", checkOut: "", guestName: "", guestEmail: "", guestPhone: "", guests: "", guestType: "Family" }));
  };

  const handleGuestBooking = async (event) => {
    event.preventDefault();
    if (!bookingForm.checkIn || !bookingForm.checkOut) {
      showNotification("error", "Please select check-in and check-out from the calendar.");
      return;
    }
    try {
      const hasRazorpay = import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (hasRazorpay) {
        const order = await createRazorpayOrder({
          roomId: bookingForm.roomId,
          checkIn: bookingForm.checkIn,
          checkOut: bookingForm.checkOut,
        });

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: "INR",
          name: "Creek View Villa",
          description: rooms.find(r => r.id === bookingForm.roomId)?.name || "Room booking",
          order_id: order.id,
          handler: async (response) => {
            try {
              const booking = await createBooking({
                ...bookingForm,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              });
              onBookingSuccess(booking);
            } catch (err) {
              showNotification("error", err?.response?.data?.message || "Payment succeeded but booking failed. Contact support.");
            }
          },
          prefill: {
            name: bookingForm.guestName,
            email: bookingForm.guestEmail,
            contact: bookingForm.guestPhone,
          },
          theme: { color: "#059669" },
          modal: {
            ondismiss: () => {
              showNotification("error", "Payment cancelled. Booking not confirmed.");
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        const booking = await createBooking({ ...bookingForm });
        onBookingSuccess(booking);
      }
    } catch (error) {
      showNotification("error", error?.response?.data?.message || "Could not complete booking.");
    }
  };

  const handleCalendarDateClick = (clickInfo) => {
    const clickedDate = clickInfo.dateStr;

    const fullyBusy = new Set();
    const checkoutOnly = new Set();

    for (const evt of availability) {
      if (!evt.start || !evt.end) continue;

      const cur = new Date(evt.start + "T00:00:00");
      const end = new Date(evt.end   + "T00:00:00");

      const toDateKey = (d) => {
        const dt = typeof d === "string" ? new Date(d + "T00:00:00") : d;
        return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
      };

      while (cur < end) {
        fullyBusy.add(toDateKey(cur));
        cur.setDate(cur.getDate() + 1);
      }
      checkoutOnly.add(toDateKey(end));
    }

    checkoutOnly.forEach(d => fullyBusy.delete(d));

    if (fullyBusy.has(clickedDate)) {
      showNotification("error", "This date is already booked. Please select an available date.");
      return;
    }

    setFocusedDate(clickedDate);

    if (clickedDate === bookingForm.checkOut) {
      setBookingForm(prev => ({ ...prev, checkOut: "" }));
      setWaitingForCheckout(true);
      return;
    }
    if (clickedDate === bookingForm.checkIn) {
      setBookingForm(prev => ({ ...prev, checkIn: "", checkOut: "" }));
      setWaitingForCheckout(false);
      return;
    }

    if (!bookingForm.checkIn) {
      setBookingForm(prev => ({ ...prev, checkIn: clickedDate, checkOut: "" }));
      setWaitingForCheckout(true);
      return;
    }

    if (clickedDate <= bookingForm.checkIn) {
      setBookingForm(prev => ({ ...prev, checkIn: clickedDate, checkOut: "" }));
      setWaitingForCheckout(true);
      return;
    }

    let cursor = new Date(bookingForm.checkIn + "T00:00:00");
    cursor.setDate(cursor.getDate() + 1);
    const checkOutDate = new Date(clickedDate + "T00:00:00");
    const toKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    while (cursor < checkOutDate) {
      if (fullyBusy.has(toKey(cursor))) {
        showNotification("error", "A date in this range is already booked. Please choose different dates.");
        setBookingForm(prev => ({ ...prev, checkIn: "", checkOut: "" }));
        setWaitingForCheckout(false);
        return;
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    setBookingForm(prev => ({ ...prev, checkOut: clickedDate }));
    setWaitingForCheckout(false);
  };

  const handleAdminDateClick = (clickInfo) => {
    const clickedDate = clickInfo.dateStr;
    setAdminForm((prev) => ({ ...prev, checkIn: clickedDate }));
  };

  const handleAdminBooking = async (event) => {
    event.preventDefault();
    try {
      const booking = await createBooking({ ...adminForm, createdBy: "admin" });
      setBookings((prev) => [...prev, booking]);
      setAvailability((prev) => [
        ...prev,
        { id: booking.id, title: `${booking.roomName} (Booked)`, start: booking.checkIn, end: booking.checkOut, color: "#ef4444" }
      ]);
      showNotification("success", "Admin booking created.");
      setAdminForm((prev) => ({ ...prev, checkIn: "", checkOut: "", guestName: "", guestEmail: "", guestPhone: "", guests: "", guestType: "Family", amount: "" }));
    } catch (error) {
      showNotification("error", error?.response?.data?.message || "Could not create admin booking.");
    }
  };

  const handleCancel = async (bookingId) => {
    try {
      if (!adminToken) {
        showNotification("error", "No admin token available — try refreshing the page.");
        return;
      }
      await cancelBooking(bookingId, { reason: "Cancelled from admin dashboard", refundStatus: "pending" }, adminToken);
      const cancelled = bookings.find((b) => b.id === bookingId);
      setBookings((prev) =>
        prev.map((b) => b.id === bookingId ? { ...b, status: "cancelled" } : b)
      );
      setAvailability((prev) => prev.filter((e) => {
        if (e.id === bookingId) return false;
        if (cancelled &&
            e.start === cancelled.checkIn &&
            e.end === cancelled.checkOut &&
            e.title && e.title.startsWith(cancelled.roomName)) return false;
        return true;
      }));
      showNotification("success", "Booking cancelled.");
    } catch (error) {
      const status = error?.response?.status;
      const msg = error?.response?.data?.message || error.message || "Cancellation failed.";
      showNotification("error", `${msg} (HTTP ${status})`);
    }
  };

  const handleRoomUpdate = async (roomId) => {
    const data = roomSettings[roomId];
    try {
      await updateRoomPrice(roomId, Number(data.basePrice), adminToken);
      const images = data.imagesInput
        .split(",")
        .map((img) => img.trim())
        .filter(Boolean);
      await updateRoomImages(roomId, images, adminToken);
      setRooms((prev) =>
        prev.map((r) => r.id === roomId ? { ...r, basePrice: Number(data.basePrice), images } : r)
      );
      showNotification("success", "Room details updated.");
    } catch (error) {
      showNotification("error", error?.response?.data?.message || "Room update failed.");
    }
  };

  if (loading) {
    return <main className="wrapper">Loading...</main>;
  }

  return (
    <ErrorBoundary>
    <main className="wrapper">
      <header className={`topNav ${isScrolled ? "scrolled" : ""} ${["/admin","/rooms","/nearby"].includes(location.pathname) ? "topNav--light" : ""}`}>
        <Link className="brand" to="/" style={{ textDecoration: "none" }}>CreekViewVilla</Link>
        <nav className="navCenter">
          <Link className={`navLink${location.pathname === "/" && location.hash === "#photos" ? " active" : ""}`} to="/#photos">Photos</Link>
          <Link className={`navLink${location.pathname === "/" && location.hash === "#location" ? " active" : ""}`} to="/#location">Location</Link>
          <Link className={`navLink${location.pathname === "/rooms" ? " active" : ""}`} to="/rooms">Rooms</Link>
          <Link className={`navLink${location.pathname === "/nearby" ? " active" : ""}`} to="/nearby">Nearby</Link>
        </nav>
        <nav className="navActions">
          {location.pathname === "/admin" ? (
            <>
              <Link className="navLink navLink--admin" to="/">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </Link>
              {adminAuthed && (
                <button
                  className="navLink navLink--admin"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "8px" }}
                  onClick={async () => {
                    const { signOut } = await import("firebase/auth");
                    const { auth } = await import("./firebase");
                    await signOut(auth);
                    setAdminAuthed(false);
                  }}
                  title="Sign out"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </button>
              )}
            </>
          ) : (
            <Link className="navLink navLink--admin" to="/admin">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </Link>
          )}
        </nav>
      </header>

      {notification && (
        <div className={`notification notification--${notification.type}`} onClick={() => { if (notifTimeout.current) clearTimeout(notifTimeout.current); setNotification(null); }}>
          <div className="notificationInner">
            {notification.type === "success" ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            )}
            <span>{notification.text}</span>
          </div>
        </div>
      )}

      <div className={location.pathname === "/admin" ? "pageContent adminContent" : "pageContent"}>
        <Routes>
          <Route
            path="/"
            element={
              <UserPage
                availability={availability}
                rooms={rooms}
                bookingForm={bookingForm}
                roomOptions={roomOptions}
                selectedRangeLabel={selectedRangeLabel}
                focusedDate={focusedDate}
                onCalendarDateClick={handleCalendarDateClick}
                onBookingFormChange={(values) => setBookingForm((prev) => ({ ...prev, ...values }))}
                onGuestBooking={handleGuestBooking}
                onNotify={showNotification}
              />
            }
          />
          <Route path="/rooms" element={<RoomsPage rooms={rooms} />} />
          <Route path="/nearby" element={<Suspense fallback={<div className="pageLoading" />}><NearbyPage /></Suspense>} />
          <Route
            path="/admin"
            element={
              !authChecked ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: "#64748b" }}>Checking auth…</div>
              ) : adminAuthed ? (
              <Suspense fallback={<div className="pageLoading" />}>
              <AdminPage
                rooms={rooms}
                bookings={bookings}
                adminForm={adminForm}
                roomOptions={roomOptions}
                roomSettings={roomSettings}
                availability={availability}
                onAdminDateClick={handleAdminDateClick}
                onAdminFormChange={(values) => setAdminForm((prev) => ({ ...prev, ...values }))}
                onAdminBooking={handleAdminBooking}
                onCancel={handleCancel}
                onRoomSettingsChange={(roomId, values) =>
                  setRoomSettings((prev) => ({
                    ...prev,
                    [roomId]: { ...prev[roomId], ...values }
                  }))
                }
                onRoomUpdate={handleRoomUpdate}
              />
              </Suspense>
              ) : (
                <Suspense fallback={<div className="pageLoading" />}>
                <AdminLoginPage onLogin={() => setAdminAuthed(true)} />
                </Suspense>
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Footer />
    </main>
    </ErrorBoundary>
  );
}

export default App;
