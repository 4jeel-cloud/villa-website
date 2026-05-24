import { useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { toDateKey } from "../utils";
import AdminDashboard from "./AdminDashboard";

export default function AdminPage({
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
  const adminCalendarEvents = bookings
    .filter((b) => b.status === "confirmed")
    .map((booking) => ({
      title: booking.guestName,
      start: booking.checkIn,
      end: booking.checkOut,
      classNames: ["admin-booking-event"]
    }));

  const { existingCheckin, existingCheckout, blockedClasses } = useMemo(() => {
    const ci = new Set(), co = new Set(), bk = new Map();
    for (const b of (bookings || [])) {
      if (b.status !== "confirmed") continue;
      const sk = b.checkIn, ek = b.checkOut;
      ci.add(sk); co.add(ek);
      let cur = new Date(sk + "T00:00:00");
      const end = new Date(ek + "T00:00:00");
      while (cur < end) {
        const key = toDateKey(cur);
        if (key !== sk && key !== ek) bk.set(key, true);
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
        if (key !== sk && key !== ek && !bk.has(key)) bk.set(key, true);
        cur.setDate(cur.getDate() + 1);
      }
    }
    return { existingCheckin: ci, existingCheckout: co, blockedClasses: bk };
  }, [bookings, availability]);

  const dayCellClassNames = (arg) => {
    const dayKey = toDateKey(arg.date);
    const classes = [];
    if (blockedClasses.has(dayKey)) classes.push("blocked-date");
    else if (existingCheckin.has(dayKey) && !existingCheckout.has(dayKey)) classes.push("existing-booking-checkin");
    else if (existingCheckout.has(dayKey) && !existingCheckin.has(dayKey)) classes.push("date-checkout-only");
    else if (existingCheckin.has(dayKey) && existingCheckout.has(dayKey)) classes.push("existing-booking-checkin");
    if (adminForm.checkIn && dayKey === adminForm.checkIn) classes.push("selected-checkin");
    if (adminForm.checkOut && dayKey === adminForm.checkOut) classes.push("selected-checkout");
    if (adminForm.checkIn && adminForm.checkOut && dayKey > adminForm.checkIn && dayKey < adminForm.checkOut) classes.push("selected-range");
    return classes;
  };

  const handleDateClick = (clickInfo) => {
    const clickedDate = clickInfo.dateStr;
    if (adminForm.checkIn) {
      setSelectedAdminBooking(null);
      onAdminDateClick(clickInfo);
      return;
    }
    const foundBooking = bookings.find(
      (b) => clickedDate >= b.checkIn && clickedDate < b.checkOut && b.status === "confirmed"
    );
    if (foundBooking) {
      setSelectedAdminBooking(foundBooking);
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
      <AdminDashboard bookings={bookings} rooms={rooms} />

      <section className="card">
        <h2>Admin Dashboard</h2>

        <div className="bookingLayout" style={{ maxWidth: "none", margin: "24px 0", padding: 0 }}>
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
        <div className="list" style={{ gridTemplateColumns: "1fr 1fr" }}>
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
