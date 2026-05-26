import { useMemo, useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { toDateKey } from "../utils";
import AdminDashboard from "./AdminDashboard";
import { loadLaundryData, saveLaundryData } from "../laundryDb";

const SIDEBAR_ITEMS = [
  { key: "dashboard", label: "Dashboard",      icon: "layout-dashboard" },
  { key: "bookings",  label: "Bookings",       icon: "calendar-check"   },
  { key: "room",      label: "Room Update",    icon: "currency-rupee"   },
  { key: "laundry",   label: "Laundry Tracker",icon: "clipboard-list"   },
  { key: "profile",   label: "Profile",        icon: "user-circle"      },
  { key: "home",      label: "Home",           icon: "home"             },
];

export default function AdminPage({
  rooms, bookings, bookingsLoading, adminForm, roomOptions, roomSettings, availability, adminEmail, adminProfile,
  onAdminDateClick, onAdminFormChange, onAdminBooking, onCancel,
  onRoomSettingsChange, onRoomUpdate, onAdminProfileChange, onLogout,
}) {
  const [selectedAdminBooking, setSelectedAdminBooking] = useState(null);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [laundryAlerts, setLaundryAlerts] = useState([
  ]);
  const [laundryStock, setLaundryStock] = useState([
  ]);
  const [laundryMode, setLaundryMode] = useState("send");
  const [laundryQty, setLaundryQty] = useState({});
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showUpdateStock, setShowUpdateStock] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductUnits, setNewProductUnits] = useState("");
  const [laundryActivity, setLaundryActivity] = useState([
  ]);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    loadLaundryData().then((data) => {
      if (data) {
        if (data.stock?.length) setLaundryStock(data.stock);
        if (data.alerts?.length) setLaundryAlerts(data.alerts);
        if (data.activity?.length) setLaundryActivity(data.activity);
      }
    });
  }, []);

  const saveTimer = useRef(null);
  useEffect(() => {
    if (!loaded.current) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveLaundryData(laundryStock, laundryAlerts, laundryActivity);
    }, 500);
  }, [laundryStock, laundryAlerts, laundryActivity]);

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
    else if (existingCheckin.has(dayKey) && existingCheckout.has(dayKey)) classes.push("turnover-date");
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
        return <AdminDashboard bookings={bookings} rooms={rooms} />;

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
          <section className="adminSection card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ margin: 0 }}>Laundry Tracker</h2>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="formSubmit" type="button" style={{ padding: "6px 14px", fontSize: "0.8rem", background: "#06402B" }}
                  onClick={() => setShowAddProduct(true)}>+ Add New Product</button>
                <button className="formSubmit" type="button" style={{ padding: "6px 14px", fontSize: "0.8rem", background: "#06402B" }}
                  onClick={() => setShowUpdateStock(true)}>Update Stock</button>
              </div>
            </div>

            {showAddProduct && (
              <div className="modalOverlay" onClick={() => { setShowAddProduct(false); setNewProductName(""); setNewProductUnits(""); }}>
                <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                  <h3 style={{ margin: "0 0 16px" }}>Add New Product</h3>
                  <div className="formField">
                    <label className="formLabel">Product Name</label>
                    <input className="formInput" placeholder="e.g. Rugs" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} />
                  </div>
                  <div className="formField">
                    <label className="formLabel">Initial Quantity</label>
                    <input className="formInput" type="number" min="1" placeholder="e.g. 10" value={newProductUnits} onChange={(e) => setNewProductUnits(e.target.value)} />
                  </div>
                  <div className="formRow">
                    <button className="formSubmit" type="button" style={{ background: "#0a6a42" }}
                      onClick={() => {
                        if (!newProductName || !newProductUnits) return;
                        const id = Date.now();
                        const u = parseInt(newProductUnits);
                        setLaundryStock((prev) => [...prev, { id, name: newProductName, total: u, clean: u, atLaundry: 0, inUse: 0 }]);
                        const now = new Date();
                        setLaundryAlerts((prev) => [{ id, text: `New product: ${newProductName} (${u} units)`, time: "just now" }, ...prev].slice(0, 4));
                        setLaundryActivity((prev) => [{ id: Date.now() + 1, date: now.toISOString().slice(0, 10), time: now.toTimeString().slice(0, 5), text: `Purchased new: ${u} ${newProductName}` }, ...prev]);
                        setNewProductName(""); setNewProductUnits(""); setShowAddProduct(false);
                      }}>Add Product</button>
                    <button className="formSubmit" type="button" style={{ background: "#94a3b8" }} onClick={() => { setShowAddProduct(false); setNewProductName(""); setNewProductUnits(""); }}>Cancel</button>
                  </div>
                </div>
              </div>
            )}

            {showUpdateStock && (
              <div className="modalOverlay" onClick={() => setShowUpdateStock(false)}>
                <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                  <h3 style={{ margin: "0 0 16px" }}>Update Stock</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {laundryStock.map((item) => (
                      <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#f9fafb", borderRadius: 8 }}>
                        <span style={{ fontWeight: 500, fontSize: "0.85rem", minWidth: 100 }}>{item.name}</span>
                        {[
                          { label: "Clean", key: "clean" },
                          { label: "Laundry", key: "atLaundry" },
                          { label: "In Use", key: "inUse" },
                        ].map((field) => (
                          <div key={field.key} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <button className="stockArrow" onClick={() => setLaundryStock((prev) => prev.map((p) => p.id === item.id ? { ...p, [field.key]: Math.max(0, p[field.key] - 1) } : p))}>
                              <i className="ti ti-chevron-left" />
                            </button>
                            <div style={{ textAlign: "center", minWidth: 40 }}>
                              <div style={{ fontSize: "0.6rem", color: "#94a3b8", lineHeight: 1 }}>{field.label}</div>
                              <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>{item[field.key]}</span>
                            </div>
                            <button className="stockArrow" onClick={() => setLaundryStock((prev) => prev.map((p) => p.id === item.id ? { ...p, [field.key]: p[field.key] + 1 } : p))}>
                              <i className="ti ti-chevron-right" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <button className="formSubmit" type="button" style={{ background: "#94a3b8", marginTop: 12, width: "100%" }} onClick={() => setShowUpdateStock(false)}>Done</button>
                </div>
              </div>
            )}

            <div className="laundryAlerts">
              {laundryAlerts.map((a, i) => (
                <div style={{ display:'flex', alignItems:'center', gap:4 }} key={a.id}>
                  {i > 0 && <span className="laundryDivider" />}
                  <div className="laundryAlertItem">
                    <i className="ti ti-alert-circle" />
                    <span className="laundryAlertText">{a.text}</span>
                    <span className="laundryAlertTime">{a.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="laundryTable">
              <div className="laundryTableHeader">
                <span>Item</span>
                <span>Total</span>
                <span>Clean</span>
                <span>Laundry</span>
                <span>In Use</span>
              </div>
              {laundryStock.map((item) => (
                <div className="laundryTableRow" key={item.id}>
                  <span style={{ fontWeight: 500 }}>{item.name}</span>
                  <span>{item.total}</span>
                  <span>{item.clean}</span>
                  <span>{item.atLaundry}</span>
                  <span>{item.inUse}</span>
                </div>
              ))}
            </div>

            <div className="laundryBottomGrid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
              <div>
                <h3 style={{ margin: "0 0 8px", fontSize: "0.9rem", color: "#374151" }}>Send / Return</h3>
                <div className="laundryToggle">
                  <button className={`laundryToggleBtn${laundryMode === "send" ? " active" : ""}`} onClick={() => setLaundryMode("send")}>
                    <i className="ti ti-send" /> Send to Cleaner
                  </button>
                  <button className={`laundryToggleBtn${laundryMode === "return" ? " active" : ""}`} onClick={() => setLaundryMode("return")}>
                    <i className="ti ti-arrow-back-up" /> Returned Back
                  </button>
                </div>

                <div className="laundryModeTable">
                  <div className="laundryModeHeader">
                    <span>Item</span>
                    <span>Available</span>
                    <span>Quantity</span>
                    <span>Mode</span>
                  </div>
                  {laundryStock.map((item) => {
                    const qty = laundryQty[item.id] ?? 0;
                    const avail = laundryMode === "send" ? item.clean : item.atLaundry;
                    return (
                      <div className="laundryModeRow" key={item.id}>
                        <span style={{ fontWeight: 500 }}>{item.name}</span>
                        <span>{avail}</span>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                          <button className="stockArrow" onClick={() => setLaundryQty((prev) => ({ ...prev, [item.id]: Math.max(0, (prev[item.id] ?? 0) - 1) }))}>
                            <i className="ti ti-chevron-left" />
                          </button>
                          <span style={{ minWidth: 28, textAlign: "center", fontWeight: 600 }}>{qty}</span>
                          <button className="stockArrow" onClick={() => setLaundryQty((prev) => ({ ...prev, [item.id]: Math.min(avail, (prev[item.id] ?? 0) + 1) }))}>
                            <i className="ti ti-chevron-right" />
                          </button>
                        </div>
                        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: laundryMode === "send" ? "#0a6a42" : "#ca8a04" }}>
                          {laundryMode === "send" ? "Send" : "Return"}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <button className="formSubmit" type="button" style={{ marginTop: 8, width: "100%" }}
                  onClick={() => {
                    const now = new Date();
                    const dateStr = now.toISOString().slice(0, 10);
                    const timeStr = now.toTimeString().slice(0, 5);
                    const newStock = [...laundryStock];
                    const alertItems = [];
                    const logEntries = [];
                    for (const item of newStock) {
                      const qty = laundryQty[item.id] ?? 0;
                      if (qty === 0) continue;
                      if (laundryMode === "send") {
                        if (item.clean < qty) continue;
                        alertItems.push(`${qty} ${item.name} → Laundry`);
                        logEntries.push(`Sent to cleaner: ${qty} ${item.name}`);
                        item.clean -= qty;
                        item.atLaundry += qty;
                      } else {
                        if (item.atLaundry < qty) continue;
                        alertItems.push(`${qty} ${item.name} ← Returned`);
                        logEntries.push(`Returned from cleaner: ${qty} ${item.name}`);
                        item.atLaundry -= qty;
                        item.clean += qty;
                      }
                    }
                    if (alertItems.length) {
                      setLaundryAlerts((prev) => [
                        { id: Date.now(), text: alertItems.join(", "), time: "just now" },
                        ...prev
                      ].slice(0, 4));
                      setLaundryActivity((prev) => [
                        ...logEntries.map((entry) => ({
                          id: Date.now() + Math.random(), date: dateStr, time: timeStr, text: entry
                        })),
                        ...prev
                      ]);
                    }
                    setLaundryStock(newStock);
                    setLaundryQty({});
                  }}>
                  {laundryMode === "send" ? "Send to Cleaner" : "Return to Stock"}
                </button>
              </div>

              <div>
                <h3 style={{ margin: "0 0 8px", fontSize: "0.9rem", color: "#374151" }}>
                  <i className="ti ti-clock" style={{ marginRight: 4 }} /> Activity History
                </h3>
                <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: 8 }}>Recent inventory actions and cleaner updates.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 300, overflowY: "auto" }}>
                  {laundryActivity.length === 0 ? (
                    <p style={{ fontSize: "0.8rem", color: "#cbd5e1", textAlign: "center", padding: 20 }}>No activity yet</p>
                  ) : (
                    laundryActivity.map((a) => (
                      <div key={a.id} style={{ fontSize: "0.8rem", color: "#475569", padding: "6px 10px", background: "#f8fafc", borderRadius: 6, borderLeft: "3px solid #06402B" }}>
                        <span style={{ color: "#94a3b8", fontSize: "0.7rem" }}>{a.date} {a.time}</span>
                        <span style={{ marginLeft: 6 }}>{a.text}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
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
    </div>
  );
}
