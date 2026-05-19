import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
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

function GalleryCarousel() {
  const [index, setIndex] = useState(10);
  const [paused, setPaused] = useState(false);
  const [lightboxData, setLightboxData] = useState(null);
  const transitioning = useRef(true);
  const [itemWidth, setItemWidth] = useState(0);
  const trackRef = useRef(null);
  const pauseTimeout = useRef(null);
  const touchStartX = useRef(0);
  const touchOffset = useRef(0);
  const [touchDelta, setTouchDelta] = useState(0);
  const isSwiping = useRef(false);

  const cities = [
    { img: "/carousel/1.webp" },
    { img: "/carousel/2.webp" },
    { img: "/carousel/DSC00989.webp" },
    { img: "/carousel/DSC01011.webp" },
    { img: "/carousel/DSC01019.webp" },
    { img: "/carousel/DSC01082.webp" },
    { img: "/carousel/DSC01097.webp" },
    { img: "/carousel/DSC01077.webp" },
    { img: "/carousel/DSC01105.webp" },
    { img: "/carousel/DSC01115.webp" }
  ];

  const len = cities.length;
  const items = [...cities, ...cities, ...cities];

  const snap = useCallback((dir) => {
    setIndex((prev) => prev + dir);
    setTouchDelta(0);
    touchOffset.current = 0;
    setPaused(true);
    if (pauseTimeout.current) clearTimeout(pauseTimeout.current);
    pauseTimeout.current = setTimeout(() => setPaused(false), 4000);
  }, []);

  useEffect(() => {
    return () => {
      if (pauseTimeout.current) clearTimeout(pauseTimeout.current);
    };
  }, []);

  useEffect(() => {
    const measure = () => {
      const el = document.querySelector(".carousel .carousel-item");
      if (el) {
        const w = el.getBoundingClientRect().width;
        const style = window.getComputedStyle(el);
        const ml = parseFloat(style.marginLeft) || 0;
        const mr = parseFloat(style.marginRight) || 0;
        setItemWidth(w + ml + mr);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setIndex((prev) => prev + 1), 2500);
    return () => clearInterval(timer);
  }, [paused]);

  useEffect(() => {
    if (index >= 2 * len) {
      const timeout = setTimeout(() => {
        transitioning.current = false;
        setIndex((prev) => prev - len);
      }, 500);
      return () => clearTimeout(timeout);
    }
    if (index < len) {
      const timeout = setTimeout(() => {
        transitioning.current = false;
        setIndex((prev) => prev + len);
      }, 500);
      return () => clearTimeout(timeout);
    }
    transitioning.current = true;
  }, [index, len]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const onTouchStart = (e) => {
      isSwiping.current = true;
      touchStartX.current = e.touches[0].clientX;
      touchOffset.current = 0;
      setPaused(true);
    };

    const onTouchMove = (e) => {
      if (!isSwiping.current) return;
      touchOffset.current = e.touches[0].clientX - touchStartX.current;
      setTouchDelta(touchOffset.current);
    };

    const onTouchEnd = () => {
      if (!isSwiping.current) return;
      isSwiping.current = false;
      const delta = touchOffset.current;
      if (Math.abs(delta) > 50) {
        if (delta < 0) snap(1);
        else snap(-1);
      } else {
        setTouchDelta(0);
        touchOffset.current = 0;
        if (pauseTimeout.current) clearTimeout(pauseTimeout.current);
        setPaused(false);
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [snap]);

  useEffect(() => {
    const items = document.querySelectorAll(".carousel .carousel-item");
    const handleMouseMove = (e, el) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.x;
      const y = e.clientY - rect.y;
      const midX = rect.width / 2;
      const midY = rect.height / 2;
      const angleY = -(x - midX) / 6;
      const angleX = (y - midY) / 6;
      const box = el.querySelector(".carousel-box");
      if (box) {
        box.style.transform = `perspective(800px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale3d(1.02,1.02,1.02)`;
      }
    };
    const handleMouseLeave = (el) => {
      const box = el.querySelector(".carousel-box");
      if (box) {
        box.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg)";
      }
    };
    const handleEnter = () => setPaused(true);
    const bound = [];
    items.forEach((el) => {
      const move = (e) => handleMouseMove(e, el);
      const leave = () => handleMouseLeave(el);
      el.addEventListener("mousemove", move);
      el.addEventListener("mouseleave", leave);
      el.addEventListener("mouseenter", handleEnter);
      bound.push({ el, move, leave, handleEnter });
    });
    const onExit = () => {
      if (pauseTimeout.current) clearTimeout(pauseTimeout.current);
      setPaused(false);
    };
    const container = document.querySelector(".carousel");
    container?.addEventListener("mouseleave", onExit);
    return () => {
      bound.forEach(({ el, move, leave, handleEnter }) => {
        el.removeEventListener("mousemove", move);
        el.removeEventListener("mouseleave", leave);
        el.removeEventListener("mouseenter", handleEnter);
      });
      container?.removeEventListener("mouseleave", onExit);
    };
  }, []);

  useEffect(() => {
    if (!lightboxData) return;
    const handler = (e) => {
      if (e.key === "Escape") setLightboxData(null);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [lightboxData]);

  const baseTransform = itemWidth ? -index * itemWidth : 0;
  const currentOffset = baseTransform + touchDelta;

  const row = (isTop) => (
    <div className={`carousel-row${isTop ? "" : " carousel-row--reverse"}`}>
      <div
        className="carousel-track"
        ref={isTop ? trackRef : null}
        style={{
          transform: `translateX(${currentOffset}px)`,
          transition: isSwiping.current || transitioning.current === false
            ? "none"
            : "transform 0.5s ease"
        }}
      >
        {items.map((city, i) => (
          <div className="carousel-item" key={i}>
            <div className="carousel-box" onClick={() => setLightboxData(cities[i % len])}>
              <img src={city.img} loading="lazy" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div className="homeSection">
        <h2 className="sectionHeading">Photos</h2>
        <div className="carousel">
          <button className="carousel-btn carousel-btn--prev" onClick={() => snap(1)} aria-label="Next">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          {row(true)}
          {row(false)}

          <button className="carousel-btn carousel-btn--next" onClick={() => snap(-1)} aria-label="Previous">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

      {lightboxData && (
        <div className="lightbox" onClick={() => setLightboxData(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightboxData(null)}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <img src={lightboxData.img} />
          </div>
        </div>
      )}
    </>
  );
}

function MapSection() {
  const address = "Creek+View+Villa,+MXH5%2B974,+Panthipoyil,+Padinjarathara,+Kerala+673575";

  return (
    <div className="mapLayout">
      <div className="mapContainer">
        <iframe
          src={`https://www.google.com/maps?q=${address}&output=embed`}
          className="mapIframe"
          allowFullScreen
          loading="lazy"
          title="Creek View Villa Location"
        />
        <a
          className="mapDirectionsBtn"
          href={`https://www.google.com/maps/dir/?api=1&destination=${address}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          Get Directions
        </a>
      </div>
      <div className="mapInfo">
        <h3 className="mapInfoTitle">About Creek View Villa</h3>
        <p className="mapInfoDesc">
          Nestled in the serene hills of Padinjarathara, Wayanad, Creek View Villa
          offers a peaceful retreat surrounded by lush greenery and breathtaking
          valley views. Experience the warmth of Kerala hospitality in a modern,
          comfortable homestay setting.
        </p>
        <div className="mapInfoImages">
          <img src="/carousel/1.webp" alt="" loading="lazy" />
          <img src="/carousel/2.webp" alt="" loading="lazy" />
          <img src="/carousel/DSC00989.webp" alt="" loading="lazy" />
          <img src="/carousel/DSC01011.webp" alt="" loading="lazy" />
        </div>
      </div>
    </div>
  );
}

function UserPage({
  availability,
  bookingForm,
  roomOptions,
  selectedRangeLabel,
  focusedDate,
  onCalendarDateClick,
  onBookingFormChange,
  onGuestBooking,
  onNotify
}) {
  const toDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const dayCellClassNames = (arg) => {
    const dayKey = toDateKey(arg.date);
    const { checkIn, checkOut } = bookingForm;

    if (!checkIn) return [];
    if (checkIn && !checkOut) {
      return dayKey === checkIn ? ["selected-checkin"] : [];
    }

    if (dayKey === checkIn) return ["selected-checkin"];
    if (dayKey === checkOut) return ["selected-checkout"];
    if (dayKey > checkIn && dayKey < checkOut) return ["selected-range"];
    return [];
  };

  const dayCellContent = (arg) => {
    return arg.dayNumberText;
  };

  const displayDate = focusedDate || bookingForm.checkIn || bookingForm.checkOut;
  const displayDayNumber = displayDate ? displayDate.slice(8, 10) : "--";
  const displayMonthYear = displayDate
    ? new Date(`${displayDate}T00:00:00`).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
      })
    : "Select a date";
  const displayLabel = bookingForm.checkIn && bookingForm.checkOut
    ? "Stay selected"
    : bookingForm.checkIn
      ? "Waiting for check-out"
      : "Pick your dates";

  const [formStep, setFormStep] = useState(1);

  useEffect(() => {
    if (!bookingForm.checkIn) setFormStep(1);
  }, [bookingForm.checkIn]);

  const calendarEvents = availability.map((evt) => ({
    ...evt,
    display: "background",
    backgroundColor: evt.color || "#ef4444"
  }));

  return (
    <section className="homeContent">
      <div className="homeSection" id="home">
        <div className="hero">
          <img
            src="/DSC01019.webp"
            alt="Creek View Villa"
            className="heroImage"
            fetchpriority="high"
          />
          <div className="heroText">
            <span className="heroTextPrimary">Your home,</span>
            <span className="heroTextSecondary">at Wayanad</span>
          </div>
        </div>
      </div>

      <div className="homeSection" id="booking">
        <div className="bookingLayout">
          <div className="bookingCalendar">
            <div className="calendarCard">
              <h2 className="calendarTitle">{displayMonthYear}</h2>
              <p className="calendarSubtitle">Select check-in and check-out dates for your stay.</p>
              <div className="calendarWrap">
                <FullCalendar
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  events={calendarEvents}
                  dateClick={onCalendarDateClick}
                  dayCellClassNames={dayCellClassNames}
                  dayCellContent={dayCellContent}
                  height="auto"
                  contentHeight="auto"
                  fixedWeekCount={false}
                  dayMaxEventRows={2}
                  handleWindowResize={true}
                />
              </div>
              <aside className="calendarSide">
                <p className="calendarSideLabel">{displayLabel}</p>
                <h3 className="calendarSideDay">{displayDayNumber}</h3>
                <p className="calendarSideText">{selectedRangeLabel || "First click sets check-in, second click sets check-out."}</p>
              </aside>
            </div>
          </div>

          <div className="bookingDivider">
            <div className="bookingDividerLine" />
            <div className="bookingDividerIcon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div className="bookingDividerLine" />
          </div>

          <div className="bookingForm">
            {formStep === 1 && (
              <>
                <h2 className="bookingFormTitle">Book Your Stay</h2>
                <p className="bookingFormSubtitle">Choose your room and dates</p>
                <div className="form">
                  <div className="formField">
                    <label className="formLabel">Room Type</label>
                    <select className="formInput" value={bookingForm.roomId} onChange={(e) => onBookingFormChange({ roomId: e.target.value })}>
                      {roomOptions}
                    </select>
                  </div>
                  <div className="formRow">
                    <div className="formField">
                      <label className="formLabel">Check-in</label>
                      <input className="formInput" value={bookingForm.checkIn || "Not selected"} readOnly />
                    </div>
                    <div className="formField">
                      <label className="formLabel">Check-out</label>
                      <input className="formInput" value={bookingForm.checkOut || "Not selected"} readOnly />
                    </div>
                  </div>
                  <p className="selectedDateInfo">{selectedRangeLabel || "Click dates on the calendar first."}</p>
                  <button className="formSubmit" type="button" onClick={() => { if (bookingForm.checkIn && bookingForm.checkOut) setFormStep(2); else onNotify("error", "Please select both check-in and check-out dates."); }}>
                    Next →
                  </button>
                </div>
              </>
            )}
            {formStep === 2 && (
              <>
                <h2 className="bookingFormTitle">Guest Details</h2>
                <p className="bookingFormSubtitle">Fill in your information to confirm</p>
                <form className="form" onSubmit={onGuestBooking}>
                  <div className="formField">
                    <label className="formLabel">Full Name</label>
                    <input className="formInput" placeholder="e.g. John Doe" value={bookingForm.guestName} onChange={(e) => onBookingFormChange({ guestName: e.target.value })} required />
                  </div>
                  <div className="formField">
                    <label className="formLabel">Phone Number</label>
                    <input className="formInput" placeholder="e.g. +91 98765 43210" value={bookingForm.guestPhone} onChange={(e) => onBookingFormChange({ guestPhone: e.target.value })} required />
                  </div>
                  <div className="formField">
                    <label className="formLabel">Email</label>
                    <input className="formInput" type="email" placeholder="e.g. john@email.com" value={bookingForm.guestEmail} onChange={(e) => onBookingFormChange({ guestEmail: e.target.value })} required />
                  </div>
                  <div className="formRow">
                    <div className="formField">
                      <label className="formLabel">Number of Guests</label>
                      <input className="formInput" type="number" min="1" placeholder="e.g. 2" value={bookingForm.guests} onChange={(e) => onBookingFormChange({ guests: e.target.value })} required />
                    </div>
                    <div className="formField">
                      <label className="formLabel">Guest Type</label>
                      <select className="formInput" value={bookingForm.guestType} onChange={(e) => onBookingFormChange({ guestType: e.target.value })}>
                        <option value="Family">Family</option>
                        <option value="Bachelor">Bachelor</option>
                      </select>
                    </div>
                  </div>
                  <div className="formRow">
                    <button className="formSubmit" type="button" style={{ background: "#94a3b8" }} onClick={() => setFormStep(1)}>
                      ← Back
                    </button>
                    <button className="formSubmit" type="submit">
                      Confirm Booking
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      <div id="photos">
        <GalleryCarousel />
      </div>

      <div id="location" className="homeSection mapSection">
        <h2 className="sectionHeading">Location</h2>
        <MapSection />
      </div>
    </section>
  );
}

function RoomsPage({ rooms }) {
  const [activeImg, setActiveImg] = useState({});

  return (
    <section className="card roomsPage">
      <h2>Our Rooms</h2>
      <div className="grid">
        {rooms.map((room) => {
          const imgIndex = activeImg[room.id] || 0;
          return (
            <article className="room" key={room.id}>
              <div className="roomImgWrap">
                <img src={room.images[imgIndex]} alt={room.name} loading="lazy" />
                {room.images.length > 1 && (
                  <div className="roomImgDots">
                    {room.images.map((_, i) => (
                      <button
                        key={i}
                        className={`roomImgDot${i === imgIndex ? " roomImgDot--active" : ""}`}
                        onClick={() => setActiveImg((prev) => ({ ...prev, [room.id]: i }))}
                        aria-label={`Image ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="roomInfo">
                <h3>{room.name}</h3>
                <p>{room.description}</p>
                <div className="roomMeta">
                  <span>👥 Up to {room.capacity} guests</span>
                  <span>₹{room.basePrice.toLocaleString("en-IN")}/night</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function AdminPage({
  rooms,
  bookings,
  adminForm,
  roomOptions,
  roomSettings,
  availability,
  onAdminDateClick,
  onAdminFormChange,
  onAdminBooking,
  onCancel,
  onRoomSettingsChange,
  onRoomUpdate
}) {
  const [selectedAdminBooking, setSelectedAdminBooking] = useState(null);
  const adminCalendarEvents = [
    ...availability.map((evt) => ({
      ...evt,
      display: "background",
      backgroundColor: evt.color || "#ef4444"
    })),
    ...bookings
      .filter((b) => b.status === "confirmed")
      .map((booking) => ({
        title: booking.guestName,
        start: booking.checkIn,
        end: booking.checkOut,
        backgroundColor: "#3b82f6",
        borderColor: "#2563eb",
        textColor: "#ffffff",
        classNames: ["admin-booking-event"]
      }))
  ];

  const handleDateClick = (clickInfo) => {
    const clickedDate = clickInfo.dateStr;
    const foundBooking = bookings.find(
      (b) => clickedDate >= b.checkIn && clickedDate < b.checkOut && b.status === "confirmed"
    );
    if (foundBooking) {
      setSelectedAdminBooking((prev) => prev?.id === foundBooking.id ? null : foundBooking);
    } else {
      setSelectedAdminBooking(null);
      onAdminDateClick(clickInfo);
    }
  };

  const displayDate = selectedAdminBooking ? selectedAdminBooking.checkIn : adminForm.checkIn;
  const displayDayNumber = displayDate ? displayDate.slice(8, 10) : "--";
  const displayMonthYear = displayDate
    ? new Date(`${displayDate}T00:00:00`).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
      })
    : "Select a date";

  return (
    <>
      <section className="card">
        <h2>Admin Dashboard</h2>

        <div className="bookingLayout">
          <div className="bookingCalendar">
            <div className="calendarCard">
              <h2 className="calendarTitle">{displayMonthYear}</h2>
              <p className="calendarSubtitle">
                {selectedAdminBooking
                  ? "Booking found — review or cancel below."
                  : "Click a booked date to manage, or a free date to create a booking."}
              </p>
              <div className="calendarWrap">
                <FullCalendar
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  events={adminCalendarEvents}
                  dateClick={handleDateClick}
                  height="auto"
                  contentHeight="auto"
                  fixedWeekCount={false}
                  dayMaxEventRows={2}
                  handleWindowResize={true}
                />
              </div>
              <aside className="calendarSide">
                <p className="calendarSideLabel">{selectedAdminBooking ? "Booking" : "Selected Date"}</p>
                <h3 className="calendarSideDay">{displayDayNumber}</h3>
                <p className="calendarSideText">
                  {selectedAdminBooking
                    ? `${selectedAdminBooking.guestName} · ${selectedAdminBooking.roomName}`
                    : displayDate ? `Free on ${displayDate}` : "Click a date to begin."}
                </p>
              </aside>
            </div>
          </div>

          <div className="bookingDivider">
            <div className="bookingDividerLine" />
            <div className="bookingDividerIcon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div className="bookingDividerLine" />
          </div>

          <div className="bookingForm">
            {selectedAdminBooking ? (
              /* ── Cancellation panel ── */
              <>
                <h2 className="bookingFormTitle" style={{ color: "#ef4444" }}>Cancel Booking</h2>
                <p className="bookingFormSubtitle">Review the booking details before cancelling.</p>
                <div className="form">
                  <div className="formField">
                    <label className="formLabel">Guest</label>
                    <input className="formInput" value={selectedAdminBooking.guestName} readOnly />
                  </div>
                  <div className="formField">
                    <label className="formLabel">Phone</label>
                    <input className="formInput" value={selectedAdminBooking.guestPhone || "—"} readOnly />
                  </div>
                  <div className="formField">
                    <label className="formLabel">Email</label>
                    <input className="formInput" value={selectedAdminBooking.guestEmail || "—"} readOnly />
                  </div>
                  <div className="formRow">
                    <div className="formField">
                      <label className="formLabel">Room</label>
                      <input className="formInput" value={selectedAdminBooking.roomName} readOnly />
                    </div>
                    <div className="formField">
                      <label className="formLabel">Guests</label>
                      <input className="formInput" value={`${selectedAdminBooking.guests || "—"} (${selectedAdminBooking.guestType || "—"})`} readOnly />
                    </div>
                  </div>
                  <div className="formRow">
                    <div className="formField">
                      <label className="formLabel">Check-in</label>
                      <input className="formInput" value={selectedAdminBooking.checkIn} readOnly />
                    </div>
                    <div className="formField">
                      <label className="formLabel">Check-out</label>
                      <input className="formInput" value={selectedAdminBooking.checkOut} readOnly />
                    </div>
                  </div>
                  <div className="formField">
                    <label className="formLabel">Payment</label>
                    <input className="formInput" value={selectedAdminBooking.paymentStatus || "—"} readOnly />
                  </div>
                  <div className="formRow" style={{ marginTop: 4 }}>
                    <button
                      className="formSubmit"
                      type="button"
                      style={{ background: "#94a3b8" }}
                      onClick={() => setSelectedAdminBooking(null)}
                    >
                      ← Back
                    </button>
                    <button
                      className="formSubmit"
                      type="button"
                      style={{ background: "#ef4444" }}
                      onClick={() => { onCancel(selectedAdminBooking.id); setSelectedAdminBooking(null); }}
                    >
                      Confirm Cancel
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* ── New booking panel ── */
              <>
                <h2 className="bookingFormTitle">Manual Booking</h2>
                <p className="bookingFormSubtitle">Fill in details to create a reservation</p>
                <form className="form" onSubmit={onAdminBooking}>
                  <div className="formField">
                    <label className="formLabel">Room Type</label>
                    <select className="formInput" value={adminForm.roomId} onChange={(e) => onAdminFormChange({ roomId: e.target.value })}>
                      {roomOptions}
                    </select>
                  </div>
                  <div className="formRow">
                    <div className="formField">
                      <label className="formLabel">Check-in</label>
                      <input className="formInput" value={adminForm.checkIn} placeholder="Click date on calendar" readOnly />
                    </div>
                    <div className="formField">
                      <label className="formLabel">Check-out</label>
                      <input className="formInput" type="date" value={adminForm.checkOut} onChange={(e) => onAdminFormChange({ checkOut: e.target.value })} required />
                    </div>
                  </div>
                  <div className="formField">
                    <label className="formLabel">Full Name</label>
                    <input className="formInput" placeholder="e.g. John Doe" value={adminForm.guestName} onChange={(e) => onAdminFormChange({ guestName: e.target.value })} required />
                  </div>
                  <div className="formField">
                    <label className="formLabel">Phone Number</label>
                    <input className="formInput" placeholder="e.g. +91 98765 43210" value={adminForm.guestPhone} onChange={(e) => onAdminFormChange({ guestPhone: e.target.value })} required />
                  </div>
                  <div className="formField">
                    <label className="formLabel">Email</label>
                    <input className="formInput" type="email" placeholder="e.g. john@email.com" value={adminForm.guestEmail} onChange={(e) => onAdminFormChange({ guestEmail: e.target.value })} required />
                  </div>
                  <div className="formRow">
                    <div className="formField">
                      <label className="formLabel">Number of Guests</label>
                      <input className="formInput" type="number" min="1" placeholder="e.g. 2" value={adminForm.guests} onChange={(e) => onAdminFormChange({ guests: e.target.value })} required />
                    </div>
                    <div className="formField">
                      <label className="formLabel">Guest Type</label>
                      <select className="formInput" value={adminForm.guestType} onChange={(e) => onAdminFormChange({ guestType: e.target.value })}>
                        <option value="Family">Family</option>
                        <option value="Bachelor">Bachelor</option>
                      </select>
                    </div>
                  </div>
                  <div className="formField">
                    <label className="formLabel">Amount Received (₹)</label>
                    <input className="formInput" type="number" min="0" placeholder="e.g. 5000" value={adminForm.amount || ""} onChange={(e) => onAdminFormChange({ amount: e.target.value })} />
                  </div>
                  <button className="formSubmit" type="submit">Create Admin Booking</button>
                </form>
              </>
            )}
          </div>
        </div>

        <h3>Update Room Price & Pictures</h3>
        <div className="list">
          {rooms.map((room) => (
            <div className="listItem" key={room.id}>
              <p><strong>{room.name}</strong> — ₹{(roomSettings[room.id]?.basePrice ?? room.basePrice).toLocaleString("en-IN")}/night</p>
              <div className="roomImgPreview">
                {(roomSettings[room.id]?.imagesInput ?? room.images.join(", "))
                  .split(",").map((s) => s.trim()).filter(Boolean)
                  .map((src, i) => (
                    <img key={i} src={src} alt="" style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 6, border: "1px solid #e5e7eb" }} />
                  ))}
              </div>
              <div className="formRow">
                <div className="formField">
                  <label className="formLabel">Price per night (₹)</label>
                  <input
                    className="formInput"
                    type="number"
                    value={roomSettings[room.id]?.basePrice ?? room.basePrice}
                    onChange={(e) => onRoomSettingsChange(room.id, { basePrice: e.target.value })}
                  />
                </div>
              </div>
              <div className="formField">
                <label className="formLabel">Image paths (comma separated)</label>
                <textarea
                  className="formInput"
                  rows={3}
                  placeholder="/carousel/DSC01117.webp, /carousel/DSC01115.webp"
                  value={roomSettings[room.id]?.imagesInput ?? room.images.join(", ")}
                  onChange={(e) => onRoomSettingsChange(room.id, { imagesInput: e.target.value })}
                />
              </div>
              <button className="formSubmit" type="button" onClick={() => onRoomUpdate(room.id)}>
                Save Changes
              </button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function Footer() {
  const bubbles = Array.from({ length: 64 }, (_, i) => ({
    id: i,
    size: `${2 + Math.random() * 4}rem`,
    distance: `${6 + Math.random() * 4}rem`,
    position: `${-5 + Math.random() * 110}%`,
    time: `${2 + Math.random() * 2}s`,
    delay: `${-1 * (2 + Math.random() * 2)}s`
  }));

  return (
    <>
      <div className="footer">
        <div className="footerBubbles">
          {bubbles.map((b) => (
            <div
              key={b.id}
              className="footerBubble"
              style={{
                "--size": b.size,
                "--distance": b.distance,
                "--position": b.position,
                "--time": b.time,
                "--delay": b.delay
              }}
            />
          ))}
        </div>
        <div className="footerContent">
          <div className="footerLinks">
            <div className="footerGroup">
              <b>Explore</b>
              <a href="#">Gallery</a>
              <a href="#">Rooms</a>
              <a href="#">Bookings</a>
              <a href="#">Location</a>
              <a href="#">Contact</a>
            </div>
            <div className="footerGroup">
              <b>Facilities</b>
              <a href="#">Parking</a>
              <a href="#">Wi-Fi</a>
              <a href="#">Garden</a>
              <a href="#">Kitchen</a>
              <a href="#">View Deck</a>
            </div>
            <div className="footerGroup">
              <b>Nearby</b>
              <a href="#">Chembra Peak</a>
              <a href="#">Soochipara Falls</a>
              <a href="#">Pookode Lake</a>
              <a href="#">Banasura Dam</a>
              <a href="#">Kuruva Island</a>
              <a href="#">Wayanad Sanctuary</a>
            </div>
            <div className="footerGroup">
              <b>Contact</b>
              <a href="#">+91 98765 43210</a>
              <a href="#">hello@creekviewvilla.com</a>
              <a href="#">Padinjarathara, Wayanad</a>
              <a href="#">Kerala, India</a>
            </div>
          </div>
          <div className="footerBrand">
            <div className="footerLogo" />
            <p>&copy; 2026 Creek View Villa. All rights reserved.</p>
          </div>
        </div>
      </div>
      <svg style={{ position: "fixed", top: "100vh", pointerEvents: "none" }}>
        <defs>
          <filter id="blob">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="blob"
            />
          </filter>
        </defs>
      </svg>
    </>
  );
}

function AdminLoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      const { auth } = await import("./firebase");
      await signInWithEmailAndPassword(auth, email, password);
      onLogin();
    } catch (err) {
      console.error("Firebase login error:", err.code, err.message);
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email format.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Try again later.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card" style={{ maxWidth: 380, margin: "6rem auto" }}>
      <h2 style={{ marginBottom: "0.5rem" }}>Admin Login</h2>
      <p style={{ color: "#64748b", marginBottom: "1.5rem", fontSize: "0.9rem" }}>Sign in to access the booking dashboard.</p>
      <form className="form" onSubmit={handleSubmit}>
        <div className="formField">
          <label className="formLabel">Email</label>
          <input
            className="formInput"
            type="email"
            placeholder="admin@email.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            autoFocus
            required
          />
        </div>
        <div className="formField">
          <label className="formLabel">Password</label>
          <input
            className="formInput"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            required
          />
        </div>
        {error && <p style={{ color: "#ef4444", fontSize: "0.85rem", margin: 0 }}>{error}</p>}
        <button className="formSubmit" type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </section>
  );
}

function App() {
  const [rooms, setRooms] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const showNotification = (type, text) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 3000);
  };

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
  const location = useLocation();

  // Persist Firebase auth session across page refreshes
  useEffect(() => {
    let unsubscribe;
    import("firebase/auth").then(({ onAuthStateChanged }) =>
      import("./firebase").then(({ auth }) => {
        unsubscribe = onAuthStateChanged(auth, (user) => {
          setAdminAuthed(!!user);
          setAuthChecked(true);
        });
      })
    );
    return () => unsubscribe && unsubscribe();
  }, []);

  const selectedRangeLabel =
    bookingForm.checkIn && bookingForm.checkOut
      ? `Selected stay: ${bookingForm.checkIn} to ${bookingForm.checkOut}`
      : waitingForCheckout
        ? `Check-in selected: ${bookingForm.checkIn}. Now click a check-out date.`
        : "";

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
      const [roomsData, availabilityData, bookingsData] = await Promise.all([
        getRooms(),
        getAvailability(),
        getBookings()
      ]);
      setRooms(roomsData);
      setAvailability(availabilityData);
      setBookings(bookingsData);
      // Only seed roomSettings for rooms not yet tracked — don't overwrite user edits
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
    loadData();
  }, []);

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
              await createBooking({
                ...bookingForm,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              });
              showNotification("success", "Booking confirmed successfully.");
              setBookingForm((prev) => ({ ...prev, checkIn: "", checkOut: "", guestName: "", guestEmail: "", guestPhone: "", guests: "", guestType: "Family" }));
              await loadData();
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
        // No Razorpay configured — book directly via backend
        await createBooking({ ...bookingForm });
        showNotification("success", "Booking confirmed successfully.");
        setBookingForm((prev) => ({ ...prev, checkIn: "", checkOut: "", guestName: "", guestEmail: "", guestPhone: "", guests: "", guestType: "Family" }));
        await loadData();
      }
    } catch (error) {
      showNotification("error", error?.response?.data?.message || "Could not complete booking.");
    }
  };

  const handleCalendarDateClick = (clickInfo) => {
    const clickedDate = clickInfo.dateStr;

    const busyDates = new Set();
    for (const evt of availability) {
      if (!evt.start || !evt.end) continue;
      // Only block dates for the currently selected room
      const selectedRoom = rooms.find(r => r.id === bookingForm.roomId);
      const evtTitle = evt.title || "";
      if (selectedRoom && !evtTitle.startsWith(selectedRoom.name)) continue;
      const start = new Date(evt.start + "T00:00:00");
      const end = new Date(evt.end + "T00:00:00");
      const current = new Date(start);
      while (current < end) {
        const y = current.getFullYear();
        const m = String(current.getMonth() + 1).padStart(2, "0");
        const d = String(current.getDate()).padStart(2, "0");
        busyDates.add(`${y}-${m}-${d}`);
        current.setDate(current.getDate() + 1);
      }
    }
    if (busyDates.has(clickedDate)) {
      showNotification("error", "This date is already booked. Please select an available date.");
      return;
    }

    setFocusedDate(clickedDate);

    if (clickedDate === bookingForm.checkOut) {
      setBookingForm((prev) => ({
        ...prev,
        checkOut: ""
      }));
      setWaitingForCheckout(true);
      return;
    }

    if (clickedDate === bookingForm.checkIn && !bookingForm.checkOut) {
      setBookingForm((prev) => ({
        ...prev,
        checkIn: "",
        checkOut: ""
      }));
      setWaitingForCheckout(false);
      return;
    }

    if (clickedDate === bookingForm.checkIn && bookingForm.checkOut) {
      setBookingForm((prev) => ({
        ...prev,
        checkIn: "",
        checkOut: ""
      }));
      setWaitingForCheckout(false);
      return;
    }

    if (!bookingForm.checkIn || !waitingForCheckout) {
      setBookingForm((prev) => ({
        ...prev,
        checkIn: clickedDate,
        checkOut: ""
      }));
      setWaitingForCheckout(true);
      return;
    }

    if (clickedDate <= bookingForm.checkIn) {
      showNotification("error", "Check-out must be after check-in. Please select a later date.");
      return;
    }

    setBookingForm((prev) => ({
      ...prev,
      checkOut: clickedDate
    }));
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
      // Update locally — no full reload needed
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
      await cancelBooking(bookingId, { reason: "Cancelled from admin dashboard", refundStatus: "pending" });
      const cancelled = bookings.find((b) => b.id === bookingId);
      setBookings((prev) =>
        prev.map((b) => b.id === bookingId ? { ...b, status: "cancelled" } : b)
      );
      // Remove the red background availability event for this booking
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
      showNotification("error", error?.response?.data?.message || "Cancellation failed.");
    }
  };

  const handleRoomUpdate = async (roomId) => {
    const data = roomSettings[roomId];
    try {
      await updateRoomPrice(roomId, Number(data.basePrice));
      const images = data.imagesInput
        .split(",")
        .map((img) => img.trim())
        .filter(Boolean);
      await updateRoomImages(roomId, images);
      // Update locally — no full reload needed
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
    <main className="wrapper">
      <header className={`topNav ${isScrolled ? "scrolled" : ""} ${location.pathname === "/admin" || location.pathname === "/rooms" ? "topNav--light" : ""}`}>
        <div className="brand">CreekViewVilla</div>
        <nav className="navCenter">
          <Link className="navLink" to="/#photos">Photos</Link>
          <Link className="navLink" to="/#location">Location</Link>
          <Link className="navLink navLink--rooms" to="/rooms">Rooms</Link>
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
        <div className={`notification notification--${notification.type}`} onClick={() => setNotification(null)}>
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
          <Route
            path="/admin"
            element={
              !authChecked ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: "#64748b" }}>Checking auth…</div>
              ) : adminAuthed ? (
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
              ) : (
                <AdminLoginPage onLogin={() => setAdminAuthed(true)} />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Footer />
    </main>
  );
}

export default App;
