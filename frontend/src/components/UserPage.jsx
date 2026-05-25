import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { toDateKey } from "../utils";
import GalleryCarousel from "./GalleryCarousel";
import Location from "../sections/Location";
import WhatsIncluded from "../sections/WhatsIncluded";
import WhyCreekView from "../sections/WhyCreekView";

export default function UserPage({
  availability,
  bookings,
  rooms,
  bookingForm,
  roomOptions,
  selectedRangeLabel,
  focusedDate,
  onCalendarDateClick,
  onBookingFormChange,
  onGuestBooking,
  onNotify
}) {
  const [formStep, setFormStep] = useState(1);

  useEffect(() => {
    if (!bookingForm.checkIn) setFormStep(1);
  }, [bookingForm.checkIn]);

  const { blockedClasses, existingCheckin, existingCheckout } = useMemo(() => {
    const ck = new Map();
    const ci = new Set();
    const co = new Set();
    for (const b of (bookings || [])) {
      if (b.status !== "confirmed") continue;
      const sk = b.checkIn, ek = b.checkOut;
      ci.add(sk);
      co.add(ek);
      let cur = new Date(sk + "T00:00:00");
      const end = new Date(ek + "T00:00:00");
      while (cur < end) {
        const key = toDateKey(cur);
        if (key !== sk && key !== ek) ck.set(key, "blocked-date");
        cur.setDate(cur.getDate() + 1);
      }
    }
    for (const evt of (availability || [])) {
      if (!evt.start || !evt.end) continue;
      const sk = evt.start, ek = evt.end;
      let cur = new Date(sk + "T00:00:00");
      const end = new Date(ek + "T00:00:00");
      while (cur < end) {
        const key = toDateKey(cur);
        if (key !== sk && key !== ek && !ck.has(key)) ck.set(key, "blocked-date");
        cur.setDate(cur.getDate() + 1);
      }
    }
    const roomCount = (rooms || []).length;
    if (roomCount > 0) {
      const occMap = new Map();
      for (const b of (bookings || [])) {
        if (b.status !== "confirmed") continue;
        let cur = new Date(b.checkIn + "T00:00:00");
        const end = new Date(b.checkOut + "T00:00:00");
        while (cur < end) {
          const key = toDateKey(cur);
          occMap.set(key, (occMap.get(key) || 0) + 1);
          cur.setDate(cur.getDate() + 1);
        }
      }
      for (const [key, count] of occMap) {
        if (count >= roomCount) ck.set(key, "blocked-date");
      }
    }
    return { blockedClasses: ck, existingCheckin: ci, existingCheckout: co };
  }, [bookings, availability]);

  const dayCellClassNames = (arg) => {
    const dayKey = toDateKey(arg.date);
    const { checkIn, checkOut } = bookingForm;
    const classes = [];
    if (blockedClasses.has(dayKey)) classes.push("blocked-date");
    else if (existingCheckin.has(dayKey) && existingCheckout.has(dayKey)) classes.push("turnover-date");
    else if (existingCheckin.has(dayKey)) classes.push("existing-booking-checkin");
    else if (existingCheckout.has(dayKey)) classes.push("date-checkout-only");
    if (checkIn && dayKey === checkIn) classes.push("selected-checkin");
    if (checkIn && checkOut && dayKey === checkOut) classes.push("selected-checkout");
    if (checkIn && checkOut && dayKey > checkIn && dayKey < checkOut) classes.push("selected-range");
    return classes;
  };

  const displayDate = focusedDate || bookingForm.checkIn || bookingForm.checkOut;
  const displayDayNumber = displayDate ? displayDate.slice(8, 10) : "--";
  const displayMonthYear = displayDate
    ? new Date(`${displayDate}T00:00:00`).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Select a date";
  const displayLabel = bookingForm.checkIn && bookingForm.checkOut
    ? "Stay selected"
    : bookingForm.checkIn ? "Waiting for check-out" : "Pick your dates";

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
                  events={[]}
                  dateClick={onCalendarDateClick}
                  dayCellClassNames={dayCellClassNames}
                  height="auto"
                  contentHeight="auto"
                  fixedWeekCount={false}
                  dayMaxEventRows={2}
                  handleWindowResize={true}
                  validRange={{ start: new Date() }}
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

      <WhatsIncluded />

      <div id="photos" style={{ background: "#ffffff" }}>
        <GalleryCarousel />
      </div>

      <WhyCreekView />

      <Location />
    </section>
  );
}
