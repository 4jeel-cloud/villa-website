import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Navigate, Route, Routes, useLocation, useSearchParams } from "react-router-dom";
import { useAppData } from "./hooks/useAppData";
import { useAdminAuth } from "./hooks/useAdminAuth";
import { useBookingForm } from "./hooks/useBookingForm.js";
import { useAdminForm } from "./hooks/useAdminForm";
import { useNotification } from "./hooks/useNotification";
import AppContext from "./context/AppContext";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingScreen from "./components/LoadingScreen";
import Footer from "./components/Footer";
import FloatingContact from "./components/FloatingContact";
import CookieConsent from "./components/CookieConsent";
import Navbar, { Sidebar } from "./components/Navbar";
import Notification from "./components/Notification";

const UserPage      = lazy(() => import("./components/UserPage"));
const RoomsPage     = lazy(() => import("./components/RoomsPage"));
const NearbyPage    = lazy(() => import("./components/NearbyPage"));
const AmenitiesPage = lazy(() => import("./pages/Amenities"));
const PhotosPage    = lazy(() => import("./pages/Photos"));
const PrivacyPage   = lazy(() => import("./pages/Privacy"));
const TermsPage     = lazy(() => import("./pages/Terms"));
const AdminPage     = lazy(() => import("./components/AdminPage"));
const AdminLoginPage = lazy(() => import("./components/AdminLoginPage"));
const ResetPassword = lazy(() => import("./components/ResetPassword"));

function App() {
  const location   = useLocation();
  const [searchParams]  = useSearchParams();

  const { notification, showNotification, dismissNotification } = useNotification();
  const { adminAuthed, setAdminAuthed, authChecked, adminToken, logout } = useAdminAuth();
  const {
    rooms, setRooms,
    availability, setAvailability,
    bookings, setBookings,
    loading,
    bookingsLoading, bookingsFetchError,
    roomSettings, setRoomSettings,
    retryFetchBookings,
  } = useAppData({ adminToken, authChecked, showNotification });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isScrolledRef = useRef(false);
  const scrollRaf = useRef(null);

  const roomOptions = useMemo(() => rooms.map((r) => ({ id: r.id, name: r.name })), [rooms]);

  const {
    bookingForm, setBookingFormField,
    focusedDate,
    selectedRangeLabel,
    handleGuestBooking, handleCalendarDateClick,
  } = useBookingForm({ rooms, availability, setAvailability, setBookings, showNotification });

  const {
    adminForm, setAdminFormField,
    handleAdminDateClick, handleAdminBooking, handleCancel, handleRoomUpdate,
  } = useAdminForm({
    rooms, setRooms, setBookings, bookings, setAvailability, showNotification, adminToken, roomSettings,
  });

  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => {
      if (scrollRaf.current) return;
      scrollRaf.current = requestAnimationFrame(() => {
        scrollRaf.current = null;
        const v = window.scrollY > 24;
        if (v !== isScrolledRef.current) { isScrolledRef.current = v; setIsScrolled(v); }
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollRaf.current) cancelAnimationFrame(scrollRaf.current);
    };
  }, []);

  useLayoutEffect(() => {
    const room = searchParams.get("room");
    if (room && rooms.length) {
      setBookingFormField({ roomId: room });
      requestAnimationFrame(() => {
        const el = document.getElementById("booking");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, [searchParams, rooms, setBookingFormField]);

  useLayoutEffect(() => {
    if (location.hash) {
      requestAnimationFrame(() => {
        const el = document.getElementById(location.hash.slice(1));
        if (el) el.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, [location]);

  useEffect(() => {
    if (!rooms.length) return;
    setBookingFormField({ roomId: rooms[0]?.id || "" });
    setAdminFormField({ roomId: rooms[0]?.id || "" });
  }, [rooms, setBookingFormField, setAdminFormField]);

  const isAdminRoute = location.pathname === "/admin";
  const isLightNav   = ["/rooms", "/nearby", "/amenities"].includes(location.pathname);

  const ctx = useMemo(() => ({
    rooms, setRooms, availability, setAvailability,
    bookings, setBookings, roomOptions, roomSettings, setRoomSettings,
    bookingForm, setBookingFormField,
    focusedDate, selectedRangeLabel,
    adminForm, setAdminFormField,
    bookingsLoading, bookingsFetchError,
    showNotification,
    handleGuestBooking, handleCalendarDateClick,
    handleAdminDateClick, handleAdminBooking, handleCancel, handleRoomUpdate,
    retryFetchBookings, logout,
  }), [
    rooms, setRooms, availability, setAvailability,
    bookings, setBookings, roomOptions, roomSettings, setRoomSettings,
    bookingForm, setBookingFormField,
    focusedDate, selectedRangeLabel,
    adminForm, setAdminFormField,
    bookingsLoading, bookingsFetchError,
    showNotification,
    handleGuestBooking, handleCalendarDateClick,
    handleAdminDateClick, handleAdminBooking, handleCancel, handleRoomUpdate,
    retryFetchBookings, logout,
  ]);

  if (loading) return <LoadingScreen />;

  return (
    <ErrorBoundary>
      <AppContext.Provider value={ctx}>
        <main className="wrapper">
          <Navbar {...{ isScrolled, sidebarOpen, setSidebarOpen, isAdminRoute, isLightNav, adminAuthed, logout }} />
          <Sidebar {...{ sidebarOpen, setSidebarOpen }} />
          <Notification notification={notification} onDismiss={dismissNotification} />

          <div className={isAdminRoute ? "pageContent pageContent--admin" : "pageContent"}>
            <Routes>
              <Route path="/" element={
                <Suspense fallback={<LoadingScreen />}>
                  <UserPage />
                </Suspense>
              } />
              <Route path="/rooms"     element={<Suspense fallback={<div className="pageLoading" />}><RoomsPage /></Suspense>} />
              <Route path="/amenities" element={<Suspense fallback={<div className="pageLoading" />}><AmenitiesPage /></Suspense>} />
              <Route path="/nearby"    element={<Suspense fallback={<div className="pageLoading" />}><NearbyPage /></Suspense>} />
              <Route path="/photos"    element={<Suspense fallback={<div className="pageLoading" />}><PhotosPage /></Suspense>} />
              <Route path="/privacy"   element={<Suspense fallback={<div className="pageLoading" />}><PrivacyPage /></Suspense>} />
              <Route path="/terms"     element={<Suspense fallback={<div className="pageLoading" />}><TermsPage /></Suspense>} />
              <Route path="/auth/reset-password" element={<Suspense fallback={<div className="pageLoading" />}><ResetPassword /></Suspense>} />
              <Route path="/admin" element={
                !authChecked ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: "#64748b" }}>
                    Checking auth…
                  </div>
                ) : adminAuthed ? (
                  <Suspense fallback={<div className="pageLoading" />}>
                    <AdminPage />
                  </Suspense>
                ) : (
                  <Suspense fallback={<div className="pageLoading" />}>
                    <AdminLoginPage onLogin={() => setAdminAuthed(true)} />
                  </Suspense>
                )
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

          {!isAdminRoute && <Footer />}
          {!isAdminRoute && <FloatingContact />}
        </main>
      </AppContext.Provider>
      <CookieConsent />
    </ErrorBoundary>
  );
}

export default App;
