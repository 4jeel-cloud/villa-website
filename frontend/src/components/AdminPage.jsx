import { useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { toDateKey, formatDate } from "../utils";
import AdminDashboard from "./AdminDashboard";
import LaundryTracker from "./LaundryTracker";

const SIDEBAR_ITEMS = [
  { key: "dashboard", label: "Dashboard",      icon: "layout-dashboard" },
  { key: "bookings",  label: "Bookings",       icon: "calendar-check"   },
  { key: "room",      label: "Room Update",    icon: "currency-rupee"   },
  { key: "laundry",   label: "Laundry Tracker",icon: "clipboard-list"   },
  { key: "profile",   label: "Profile",        icon: "user-circle"      },
  { key: "home",      label: "Home",           icon: "home"             },
];

export default function AdminPage({
  rooms, bookings, bookingsLoading, bookingsFetchError, adminForm, roomOptions, roomSettings, availability, adminEmail, adminProfile,
  onAdminDateClick, onAdminFormChange, onAdminBooking, onCancel,
  onRoomSettingsChange, onRoomUpdate, onAdminProfileChange, onLogout, onRetryFetchBookings,
}) {
  const [selectedAdminBooking, setSelectedAdminBooking] = useState(null);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const adminCalendarEvents = useMemo(() => {
    const bookingEvents = bookings
      .filter((b) => b.status === "confirmed")
      .map((booking) => ({
        title: booking.guestName,
        start: booking.checkIn,
        end: booking.checkOut,
        classNames: ["admin-booking-event"]
      }));
    const blockedEvents = (availability || [])
      .filter(evt => evt.color === "#f59e0b")
      .map(evt => ({
        title: evt.title,
        start: evt.start,
        end: evt.end,
        color: "#f59e0b",
        classNames: ["admin-blocked-event"]
      }));
    return [...bookingEvents, ...blockedEvents];
  }, [bookings, availability]);

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
        if (key !== sk && key !== ek) bk.set(key, true);
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
        if (count >= roomCount) bk.set(key, true);
      }
    }
    return { existingCheckin: ci, existingCheckout: co, blockedClasses: bk };
  }, [bookings, availability]);

  const dayCellClassNames = (arg) => {
    const dayKey = toDateKey(arg.date);
    const classes = [];
    if (blockedClasses.has(dayKey)) classes.push("blocked-date");
    else if (existingCheckin.has(dayKey) && existingCheckout.has(dayKey)) classes.push("blocked-date");
    else if (existingCheckin.has(dayKey)) classes.push("existing-booking-checkin");
    else if (existingCheckout.has(dayKey)) classes.push("date-checkout-only");
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
        month: "long", year: "numeric"
      })
    : "Select a date";

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        if (bookingsLoading) {
          return (
            <section className="adminSection card" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
              <p style={{ color: "#94a3b8", fontSize: 14 }}>Loading dashboard data…</p>
            </section>
          );
        }
        return (
          <>
            {bookingsFetchError && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ margin: 0, color: "#991b1b", fontSize: 13 }}>Could not load bookings from server.</p>
                {onRetryFetchBookings && (
                  <button type="button" onClick={onRetryFetchBookings} style={{ background: "#06402B", border: "none", color: "#fff", padding: "6px 16px", borderRadius: 6, cursor: "pointer", fontSize: 12, whiteSpace: "nowrap" }}>Retry</button>
                )}
              </div>
            )}
            <AdminDashboard bookings={bookings} rooms={rooms} />
          </>
        );

      case "bookings":
        return (
          <section className="adminSection card">
            <h2>Bookings</h2>
            <div className="bookingLayout" style={{ maxWidth: "none" }}>
              <div className="bookingCalendar">
                <div className="calendarCard">
                  <h2 className="calendarTitle">{displayMonthYear}</h2>
                  <p className="calendarSubtitle">
                    {bookingsLoading
                      ? "Loading bookings…"
                      : selectedAdminBooking
                      ? "Booking found — review or cancel below."
                      : "Click a booked date to manage, or a free date to create a booking."}
                  </p>
                  <div className="calendarWrap">
                    {bookingsLoading ? (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
                        <p style={{ color: "#94a3b8", fontSize: 14 }}>Loading bookings…</p>
                      </div>
                    ) : bookingsFetchError ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 200, gap: 12 }}>
                        <p style={{ color: "#ef4444", fontSize: 14 }}>Failed to load bookings.</p>
                        {onRetryFetchBookings && (
                          <button
                            type="button"
                            onClick={onRetryFetchBookings}
                            style={{ background: "#06402B", border: "none", color: "#fff", padding: "8px 20px", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
                          >
                            Retry
                          </button>
                        )}
                      </div>
                    ) : (
                    <FullCalendar
                      plugins={[dayGridPlugin, interactionPlugin]}
                      initialView="dayGridMonth"
                      events={adminCalendarEvents}
                      dateClick={handleDateClick}
                      eventClick={(info) => {
                        info.jsEvent.preventDefault();
                        const start = info.event.startStr;
                        const found = bookings.find(
                          (b) => start >= b.checkIn && start < b.checkOut && b.status === "confirmed"
                        );
                        if (found) setSelectedAdminBooking(found);
                      }}
                      dayCellClassNames={dayCellClassNames}
                      height="auto"
                      contentHeight="auto"
                      fixedWeekCount={false}
                      dayMaxEventRows={2}
                      handleWindowResize={true}
                      validRange={{ start: new Date() }}
                    />
                    )}
                  </div>
                  <aside className="calendarSide">
                    <p className="calendarSideLabel">{selectedAdminBooking ? "Booking" : "Selected Date"}</p>
                    <h3 className="calendarSideDay">{displayDayNumber}</h3>
                    <p className="calendarSideText">
                      {selectedAdminBooking
                        ? `${selectedAdminBooking.guestName} · ${selectedAdminBooking.roomName}`
                        : displayDate                         ? `Free on ${formatDate(displayDate)}` : "Click a date to begin."}
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
                          <input className="formInput" value={formatDate(selectedAdminBooking.checkIn)} readOnly />
                        </div>
                        <div className="formField">
                          <label className="formLabel">Check-out</label>
                          <input className="formInput" value={formatDate(selectedAdminBooking.checkOut)} readOnly />
                        </div>
                      </div>
                      <div className="formField">
                        <label className="formLabel">Payment</label>
                        <input className="formInput" value={selectedAdminBooking.paymentStatus || "—"} readOnly />
                      </div>
                      <div className="formRow" style={{ marginTop: 4 }}>
                        <button className="formSubmit" type="button" style={{ background: "#94a3b8" }}
                          onClick={() => setSelectedAdminBooking(null)}>← Back</button>
                        <button className="formSubmit" type="button" style={{ background: "#ef4444" }}
                          onClick={() => { onCancel(selectedAdminBooking.id); setSelectedAdminBooking(null); }}>Confirm Cancel</button>
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
                          <input className="formInput" value={formatDate(adminForm.checkIn) || adminForm.checkIn} placeholder="Click date on calendar" readOnly />
                        </div>
                        <div className="formField">
                          <label className="formLabel">Check-out</label>
                          <input className="formInput" value={formatDate(adminForm.checkOut) || adminForm.checkOut} placeholder="Click date on calendar" readOnly />
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
          </section>
        );

      case "room":
        return (
          <section className="adminSection card">
            <h2>Update Rooms</h2>
            <div className="list" style={{ gridTemplateColumns: "1fr 1fr" }}>
              {rooms.map((room) => (
                <div className="listItem" key={room.id}>
                  <p><strong>{room.name}</strong> — ₹{(roomSettings[room.id]?.basePrice ?? room.basePrice).toLocaleString("en-IN")}/night</p>
                  <div className="formRow">
                    <div className="formField">
                      <label className="formLabel">Price per night (₹)</label>
                      <input className="formInput" type="number"
                        value={roomSettings[room.id]?.basePrice ?? room.basePrice}
                        onChange={(e) => onRoomSettingsChange(room.id, { basePrice: e.target.value })} />
                    </div>
                  </div>
                  <div className="roomImgPreview">
                    {(roomSettings[room.id]?.imagesInput ?? room.images.join(", "))
                      .split(",").map((s) => s.trim()).filter(Boolean)
                      .map((src, i) => (
                        <img key={i} src={src} alt="" style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 6, border: "1px solid #e5e7eb" }} />
                      ))}
                  </div>
                  <div className="formField">
                    <label className="formLabel">Image paths (comma separated)</label>
                    <textarea className="formInput" rows={3}
                      placeholder="/carousel/DSC01117.webp, /carousel/DSC01115.webp"
                      value={roomSettings[room.id]?.imagesInput ?? room.images.join(", ")}
                      onChange={(e) => onRoomSettingsChange(room.id, { imagesInput: e.target.value })} />
                  </div>
                  <button className="formSubmit" type="button" onClick={() => onRoomUpdate(room.id)}>
                    Save Changes
                  </button>
                </div>
              ))}
            </div>
          </section>
        );

      case "laundry":
        return (
          <section className="adminSection" style={{ background: "transparent", padding: 0, boxShadow: "none" }}>
            <LaundryTracker />
          </section>
        );

      case "profile":
        return (
          <section className="adminSection card">
            <h2>Admin Profile</h2>
            <div className="form" style={{ maxWidth: 480 }}>
              <div className="formField">
                <label className="formLabel">Full Name</label>
                <input className="formInput" placeholder="e.g. Villa Manager"
                  value={adminProfile.name} onChange={(e) => onAdminProfileChange({ name: e.target.value })} />
              </div>
              <div className="formField">
                <label className="formLabel">Phone Number</label>
                <input className="formInput" placeholder="e.g. +91 98765 43210"
                  value={adminProfile.phone} onChange={(e) => onAdminProfileChange({ phone: e.target.value })} />
              </div>
              <div className="formField">
                <label className="formLabel">Email</label>
                <input className="formInput" type="email" placeholder="e.g. admin@creekview.com"
                  value={adminProfile.email} onChange={(e) => onAdminProfileChange({ email: e.target.value })} />
              </div>
              <div className="formField">
                <label className="formLabel">Address</label>
                <textarea className="formInput" rows={3} placeholder="e.g. Creek View Villa, Wayanad, Kerala"
                  value={adminProfile.address} onChange={(e) => onAdminProfileChange({ address: e.target.value })} />
              </div>
              <div className="formRow" style={{ alignItems: "center", gap: 12 }}>
                <button className="formSubmit" type="button" onClick={() => alert("Profile saved!")}>Save</button>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="adminLayout">
      <aside className={`adminSidebar${sidebarCollapsed ? " collapsed" : ""}`}>
        <div className="adminSidebarHeader">
          {!sidebarCollapsed && <span className="adminSidebarBrand">Admin</span>}
          <button className="adminSidebarToggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} title={sidebarCollapsed ? "Expand" : "Collapse"}>
            <i className={`ti ti-chevron-${sidebarCollapsed ? "right" : "left"}`} />
          </button>
        </div>
        <nav className="adminSidebarNav">
          {SIDEBAR_ITEMS.map(({ key, label, icon }) => (
            <button
              key={key}
              className={`adminSidebarItem${activeSection === key ? " active" : ""}`}
              onClick={() => key === "home" ? window.location.href = "/#hero" : setActiveSection(key)}
              title={sidebarCollapsed ? label : undefined}
            >
              <i className={`ti ti-${icon}`} />
              {!sidebarCollapsed && <span>{label}</span>}
            </button>
          ))}
        </nav>
        {!sidebarCollapsed && (
          <button className="adminSidebarLogout" onClick={onLogout}>
            <i className="ti ti-logout" />
            <span>Logout</span>
          </button>
        )}
      </aside>
      <main className="adminContent">
        <div className="adminContentInner">
          {renderContent()}
        </div>
      </main>
      <nav className="adminMobileNav">
        {SIDEBAR_ITEMS.slice(0, 5).map(({ key, label, icon }) => (
          <button
            key={key}
            className={`adminMobileNavItem${activeSection === key ? " active" : ""}`}
            onClick={() => key === "home" ? window.location.href = "/#hero" : setActiveSection(key)}
          >
            <i className={`ti ti-${icon}`} />
            <span>{label}</span>
          </button>
        ))}
        <button className="adminMobileNavItem adminMobileNavLogout" onClick={onLogout}>
          <i className="ti ti-logout" />
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
}
