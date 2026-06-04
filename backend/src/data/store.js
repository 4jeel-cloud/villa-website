const crypto = require("crypto");
const firestoreDb = require("./firestoreDb");

const BOOKED_SUFFIX = " (Booked)";
const BLOCKED_SUFFIX = " (Blocked)";

// ===== Default rooms (fallback when Firestore + Sheets are unavailable) =====
const DEFAULT_ROOMS = [


  {
    id: "r1",
    name: "4 Rooms",
    description: "Spacious 4-room villa perfect for large families and groups.",
    basePrice: 12000,
    capacity: 16,
    images: ["/carousel/DSC01117.webp", "/carousel/DSC01115.webp"],
  },
  {
    id: "r2",
    name: "2 Rooms",
    description: "Cozy 2-room stay ideal for couples and small families.",
    basePrice: 6000,
    capacity: 8,
    images: ["/carousel/DSC01077.webp", "/carousel/IMG_0969.webp"],
  },
];

let rooms = DEFAULT_ROOMS.map((r) => ({ ...r }));
let bookings = [];
let blockedDates = [];

// ===== Apps Script client (token-authenticated) =====
function getScriptUrl() {
  return process.env.APPS_SCRIPT_URL;
}
function getScriptToken() {
  return process.env.APPS_SCRIPT_TOKEN || "";
}
function hasScript() {
  return !!(getScriptUrl() && getScriptToken());
}

async function scriptGet(action) {
  const token = getScriptToken();
  const url = `${getScriptUrl()}?action=${encodeURIComponent(action)}&token=${encodeURIComponent(token)}`;
  const res = await fetch(url);
  const json = await res.json();
  if (json && json.error === "Unauthorized") throw new Error("[Sheets] Unauthorized — check APPS_SCRIPT_TOKEN");
  return json;
}

async function scriptPost(payload) {
  const url = getScriptUrl();
  const body = { ...payload, token: getScriptToken() };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  console.log("[Sheets] POST", payload.action, "\u2192", res.status, text.slice(0, 400));
  if (!res.ok) throw new Error(`Sheets API returned ${res.status}: ${text.slice(0, 200)}`);
  let json;
  try {
    json = JSON.parse(text);
  } catch (parseErr) {
    throw new Error(`Non-JSON response from sheets: ${text.slice(0, 200)} (parse error: ${parseErr.message})`, { cause: parseErr });
  }
  if (json && json.error === "Unauthorized") throw new Error("[Sheets] Unauthorized — check APPS_SCRIPT_TOKEN");
  return json;
}

// ===== Normalizers =====
function normalizeRoomFromScript(r) {
  return {
    id: r.id || "",
    name: r.name || "",
    description: r.description || "",
    basePrice: Number(r.basePrice) > 0 ? Number(r.basePrice) : 12000,
    capacity: Number(r.capacity) > 0 ? Number(r.capacity) : 1,
    images: r.images
      ? String(r.images).split(",").map((s) => s.trim()).filter(Boolean)
      : [],
  };
}

function toDateString(val) {
  if (!val) return "";
  const s = String(val);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function normalizeBookingFromScript(r) {
  const g = (...keys) => {
    for (const k of keys) {
      if (r[k] !== undefined && r[k] !== "") return r[k];
    }
    return "";
  };
  return {
    id: g("bookingId", "Timestamp"),
    roomId: g("roomId"),
    roomName: g("Room type", "roomName"),
    checkIn: toDateString(g("Check-in date", "checkIn")),
    checkOut: toDateString(g("Check-out date", "checkOut")),
    guestName: g("Full name", "guestName"),
    guestEmail: g("Email", "guestEmail"),
    guestPhone: g("Phone number", "guestPhone"),
    guests: g("Number of guests", "guests"),
    guestType: g("Guest type", "guestType"),
    status: g("status") || "confirmed",
    createdBy: g("createdBy") || "guest",
    paymentStatus: g("Amount received", "paymentStatus") || "pending",
    createdAt: g("Timestamp", "createdAt"),
    cancelledAt: null,
    cancelledBy: null,
    cancellationReason: null,
    refundStatus: null,
  };
}

// ===== Load all data from Apps Script into memory =====
async function loadFromScript() {
  try {
    await scriptGet("initSheets");
    const [roomsData, bookingsData, blocksData] = await Promise.all([
      scriptGet("getRooms"),
      scriptGet("getBookings"),
      scriptGet("getBlocks"),
    ]);

    if (Array.isArray(roomsData) && roomsData.length > 0) {
      const sheetRooms = roomsData.map(normalizeRoomFromScript).filter((r) => r.id && r.name);
      const sheetIds = new Set(sheetRooms.map((r) => r.id));
      const missing = DEFAULT_ROOMS.filter((r) => !sheetIds.has(r.id)).map((r) => ({ ...r }));
      rooms = [...sheetRooms, ...missing];
    } else {
      rooms = DEFAULT_ROOMS.map((r) => ({ ...r }));
    }

    bookings = Array.isArray(bookingsData)
      ? bookingsData.filter((b) => b.bookingId || b.Timestamp || b["Full name"]).map(normalizeBookingFromScript)
      : [];

    blockedDates = Array.isArray(blocksData)
      ? blocksData.filter((b) => b.id).map((b) => ({
          id: b.id,
          roomId: b.roomId || "",
          roomName: b.roomName || "",
          startDate: b.startDate || "",
          endDate: b.endDate || "",
          reason: b.reason || "",
        }))
      : [];

    console.log(`[Sheets] Loaded ${rooms.length} rooms, ${bookings.length} bookings, ${blockedDates.length} blocks`);
  } catch (err) {
    console.error("[Sheets] Failed to load:", err.message);
    rooms = DEFAULT_ROOMS.map((r) => ({ ...r }));
    bookings = [];
    blockedDates = [];
  }
}

// ===== Sync memory → Firestore + calendar events (called on every change) =====
async function syncToFirestore() {
  if (!firestoreDb.isConnected()) return;
  try {
    for (const room of rooms) {
      try {
        await firestoreDb.upsertRoom(room);
      } catch (err) {
        console.error("[Firestore] upsertRoom failed for", room.id, "—", err.message);
      }
    }
    const events = getAvailabilityEventsSync();
    try {
      await firestoreDb.syncCalendarEvents(events);
    } catch (err) {
      console.error("[Firestore] syncCalendarEvents failed —", err.message);
    }
  } catch (err) {
    console.error("[Store] syncToFirestore error:", err.message);
  }
}

// ===== Public API =====

async function getRooms() { return rooms; }
async function getRoom(roomId) { return rooms.find((r) => r.id === roomId) || null; }
async function getBookings() { return bookings; }
async function roomExists(roomId) { return rooms.some((r) => r.id === roomId); }

function datesOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

async function isRoomAvailable(roomId, checkIn, checkOut, ignoreBookingId = null) {
  const clashBooking = bookings.some((b) => {
    if (b.id === ignoreBookingId || b.status !== "confirmed") return false;
    return b.roomId === roomId && datesOverlap(checkIn, checkOut, b.checkIn, b.checkOut);
  });
  if (clashBooking) return false;

  const clashBlocks = blockedDates.some((b) =>
    b.roomId === roomId && datesOverlap(checkIn, checkOut, b.startDate, b.endDate)
  );
  if (clashBlocks) return false;

  // Firestore cross-instance check
  try {
    const fsOverlap = await firestoreDb.hasOverlappingBooking(roomId, checkIn, checkOut, ignoreBookingId);
    if (fsOverlap) return false;
  } catch { /* trust in-memory if Firestore unavailable */ }

  return true;
}

function getAvailabilityEventsSync() {
  const booked = bookings
    .filter((b) => b.status === "confirmed")
    .map((b) => ({
      id: b.id,
      title: `${b.roomName}${BOOKED_SUFFIX}`,
      start: b.checkIn,
      end: b.checkOut,
      color: "#ef4444",
      guestName: b.guestName,
      roomName: b.roomName,
      status: b.status,
    }));
  const blocked = blockedDates.map((b) => ({
    id: b.id,
    title: `${b.roomName}${BLOCKED_SUFFIX}`,
    start: b.startDate,
    end: b.endDate,
    color: "#f59e0b",
    roomName: b.roomName,
    status: "blocked",
  }));
  return [...booked, ...blocked];
}

async function getAvailabilityEvents() {
  return getAvailabilityEventsSync();
}

async function createBooking(data) {
  const room = rooms.find((r) => r.id === data.roomId);
  if (!room) throw new Error("Room not found");
  if (!(await isRoomAvailable(data.roomId, data.checkIn, data.checkOut))) {
    throw new Error("Room is already booked or blocked in selected dates.");
  }

  const booking = {
    id: crypto.randomUUID(),
    roomId: data.roomId,
    roomName: room.name,
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    guestName: data.guestName,
    guestEmail: data.guestEmail,
    guestPhone: data.guestPhone,
    guests: data.guests || "",
    guestType: data.guestType || "",
    status: "confirmed",
    createdBy: data.createdBy || "guest",
    paymentStatus: data.createdBy === "admin" ? "manual" : data.razorpayPaymentId ? "paid" : "unpaid",
    createdAt: new Date().toISOString(),
    cancelledAt: null,
    cancelledBy: null,
    cancellationReason: null,
    refundStatus: null,
  };

  bookings.push(booking);

  // Persist to Firestore — awaited so failures are caught and logged, not silently lost
  try {
    await firestoreDb.insertBooking(booking);
    await syncToFirestore();
  } catch (err) {
    console.error("[Firestore] insertBooking:", err.message);
  }

  // Sync to Google Sheets
  if (hasScript()) {
    try {
      const ci = new Date(booking.checkIn + "T00:00:00");
      const co = new Date(booking.checkOut + "T00:00:00");
      const nights = Math.max(1, Math.ceil((co - ci) / 86400000));
      const amount = data.razorpayPaymentId
        ? nights * room.basePrice
        : data.amount ? Number(data.amount) : "Pending";

      await scriptPost({
        action: "appendBooking",
        bookingId: booking.id,
        guestName: booking.guestName,
        guestPhone: booking.guestPhone,
        guestEmail: booking.guestEmail,
        guests: booking.guests,
        guestType: booking.guestType,
        roomName: booking.roomName,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        status: booking.status,
        roomId: booking.roomId,
        createdBy: booking.createdBy,
        paymentStatus: booking.paymentStatus,
        razorpayOrderId: data.razorpayOrderId || "",
        razorpayPaymentId: data.razorpayPaymentId || "",
        createdAt: booking.createdAt,
        amount,
      });
    } catch (err) {
      console.error("[Sheets] Failed to sync booking:", err.message);
    }
  }

  return {
    id: booking.id,
    roomId: booking.roomId,
    roomName: booking.roomName,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    guestName: booking.guestName,
    guestEmail: booking.guestEmail,
    guestPhone: booking.guestPhone,
    guests: booking.guests,
    guestType: booking.guestType,
    status: booking.status,
    createdBy: booking.createdBy,
    paymentStatus: booking.paymentStatus,
  };
}

async function cancelBooking(bookingId, data) {
  const idx = bookings.findIndex((b) => b.id === bookingId);
  if (idx === -1) return null;

  const booking = bookings[idx];
  if (booking.status === "cancelled") return booking;

  booking.status = "cancelled";
  booking.cancelledAt = new Date().toISOString();
  booking.cancelledBy = data.cancelledBy || "admin";
  booking.cancellationReason = data.reason || "Cancelled by admin";
  booking.refundStatus = data.refundStatus || "pending";

  // Persist to Firestore — awaited so failures are caught and logged, not silently lost
  try {
    await firestoreDb.cancelBookingDb(bookingId, data);
    await syncToFirestore();
  } catch (err) {
    console.error("[Firestore] cancelBookingDb:", err.message);
  }

  if (hasScript()) {
    try {
      await scriptPost({
        action: "cancelBooking",
        bookingId: booking.id,
        status: booking.status,
        cancelledAt: booking.cancelledAt,
        cancelledBy: booking.cancelledBy,
        cancellationReason: booking.cancellationReason,
        refundStatus: booking.refundStatus,
      });
    } catch (err) {
      console.error("[Sheets] Failed to sync cancellation:", err.message);
    }
  }

  return booking;
}

async function createBlockedDate(data) {
  const room = rooms.find((r) => r.id === data.roomId);
  if (!room) throw new Error("Room not found");

  const block = {
    id: crypto.randomUUID(),
    roomId: data.roomId,
    roomName: room.name,
    startDate: data.startDate,
    endDate: data.endDate,
    reason: data.reason || "Blocked by admin",
  };

  blockedDates.push(block);

  // Persist to Firestore — awaited
  try {
    await firestoreDb.insertBlockedDate(block);
    await syncToFirestore();
  } catch (err) {
    console.error("[Firestore] insertBlockedDate:", err.message);
  }

  if (hasScript()) {
    try {
      await scriptPost({
        action: "appendBlock",
        id: block.id,
        roomId: block.roomId,
        roomName: block.roomName,
        startDate: block.startDate,
        endDate: block.endDate,
        reason: block.reason,
      });
    } catch (err) {
      console.error("[Sheets] Failed to sync block:", err.message);
    }
  }

  return block;
}

async function updateRoomPrice(roomId, basePrice) {
  const room = rooms.find((r) => r.id === roomId);
  if (!room) return null;
  room.basePrice = basePrice;

  // Persist to Firestore — awaited
  try {
    await firestoreDb.updateRoomPriceDb(roomId, basePrice);
    await syncToFirestore();
  } catch (err) {
    console.error("[Firestore] updateRoomPriceDb:", err.message);
  }

  if (hasScript()) {
    try {
      await scriptPost({ action: "updateRoom", id: roomId, basePrice });
    } catch (err) {
      console.error("[Sheets] Failed to sync room price:", err.message);
    }
  }

  return room;
}

async function updateRoomImages(roomId, images) {
  const room = rooms.find((r) => r.id === roomId);
  if (!room) return null;
  room.images = images;

  // Persist to Firestore — awaited
  try {
    await firestoreDb.updateRoomImagesDb(roomId, images);
    await syncToFirestore();
  } catch (err) {
    console.error("[Firestore] updateRoomImagesDb:", err.message);
  }

  if (hasScript()) {
    try {
      await scriptPost({ action: "updateRoom", id: roomId, images: images.join(", ") });
    } catch (err) {
      console.error("[Sheets] Failed to sync room images:", err.message);
    }
  }

  return room;
}

// ===== Initialize =====
async function init() {
  rooms = DEFAULT_ROOMS.map((r) => ({ ...r }));

  // 1. Load from Firestore (primary source of truth after first deploy)
  await firestoreDb.connect();
  const [fsRooms, fsBookings, fsBlocks] = await Promise.all([
    firestoreDb.loadRooms(),
    firestoreDb.loadBookings(),
    firestoreDb.loadBlockedDates(),
  ]);

  if (fsRooms?.length) rooms = fsRooms;
  if (fsBookings?.length) bookings = fsBookings;
  if (fsBlocks?.length) blockedDates = fsBlocks;
  console.log(`[Store] Loaded from Firestore: ${rooms.length} rooms, ${bookings.length} bookings, ${blockedDates.length} blocks`);

  // 2. If Sheets configured and Firestore is empty (first run), seed from Sheets
  if (hasScript()) {
    const needsSeed = !fsRooms?.length || !fsBookings?.length;
    if (needsSeed) {
      console.log("[Store] Firestore collections empty — seeding from Google Sheets");
      await loadFromScript();
      await syncToFirestore();
      console.log("[Store] Firestore seeded from Sheets");
    }
  }

  // 3. Always sync calendar events so the frontend cache is fresh
  if (firestoreDb.isConnected()) {
    await syncToFirestore();
    console.log("[Store] Calendar events synced to Firestore");
  }
}

function reset() {
  rooms = DEFAULT_ROOMS.map((r) => ({ ...r }));
  bookings = [];
  blockedDates = [];
}

const defaultStore = {
  init, getRooms, getRoom, getBookings, roomExists,
  isRoomAvailable, getAvailabilityEvents,
  createBooking, cancelBooking, createBlockedDate,
  updateRoomPrice, updateRoomImages,
  reset,
};

async function gracefulShutdown(signal) {
  console.log(`[Store] Received ${signal}, shutting down gracefully...`);
  await firestoreDb.shutdown();
  process.exit(0);
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

module.exports = defaultStore;
