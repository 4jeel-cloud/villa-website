const crypto = require("crypto");

// ===== In-memory cache =====
let rooms = [];
let bookings = [];
let blockedDates = [];

// ===== Default rooms (used when sheets aren't configured) =====
const DEFAULT_ROOMS = [
  {
    id: "r1",
    name: "4 Rooms",
    description: "Spacious 4-room villa perfect for large families and groups.",
    basePrice: 5000,
    capacity: 8,
    images: [
      "/carousel/DSC01117.webp",
      "/carousel/DSC01115.webp",
    ],
  },
  {
    id: "r2",
    name: "2 Rooms",
    description: "Cozy 2-room stay ideal for couples and small families.",
    basePrice: 3500,
    capacity: 4,
    images: [
      "/carousel/DSC01077.webp",
      "/carousel/IMG_0969.webp",
    ],
  },
];

// ===== Apps Script web app client =====
function getScriptUrl() {
  return process.env.APPS_SCRIPT_URL;
}

function hasScript() {
  return !!getScriptUrl();
}

async function scriptGet(action) {
  const url = `${getScriptUrl()}?action=${encodeURIComponent(action)}`;
  const res = await fetch(url);
  return res.json();
}

async function scriptPost(payload) {
  const url = getScriptUrl();
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  console.log("[Sheets] POST", payload.action, "→", res.status, text.slice(0, 400));
  if (!res.ok) {
    throw new Error(`Sheets API returned ${res.status}: ${text.slice(0, 200)}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response from sheets: ${text.slice(0, 200)}`);
  }
}

// ===== Load all data from Apps Script into memory =====
async function loadFromScript() {
  try {
    // Initialize sheets (creates tabs + seeds rooms if needed)
    await scriptGet("initSheets");

    const [roomsData, bookingsData, blocksData] = await Promise.all([
      scriptGet("getRooms"),
      scriptGet("getBookings"),
      scriptGet("getBlocks"),
    ]);

    if (Array.isArray(roomsData) && roomsData.length > 0) {
      const sheetRooms = roomsData.map(normalizeRoomFromScript).filter((r) => r.id && r.name);
      // Merge: use sheet data for known IDs, fill in any missing defaults
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

    console.log(
      `[Sheets] Loaded ${rooms.length} rooms, ${bookings.length} bookings, ${blockedDates.length} blocks`
    );
  } catch (err) {
    console.error("[Sheets] Failed to load from Apps Script:", err.message);
    console.log("[Sheets] Falling back to in-memory defaults");
    rooms = DEFAULT_ROOMS.map((r) => ({ ...r }));
    bookings = [];
    blockedDates = [];
  }
}

function normalizeRoomFromScript(r) {
  return {
    id: r.id || "",
    name: r.name || "",
    description: r.description || "",
    basePrice: Number(r.basePrice) || 3500,
    capacity: Number(r.capacity) || 1,
    images: r.images
      ? String(r.images)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
  };
}

function toDateString(val) {
  if (!val) return "";
  const s = String(val);
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // ISO timestamp or any parseable date — extract date part in local time
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeBookingFromScript(r) {
  const g = function (keys) {
    for (const k of keys) {
      if (r[k] !== undefined && r[k] !== "") return r[k];
    }
    return "";
  };
  return {
    id: g(["bookingId", "Timestamp"]),
    roomId: g(["roomId"]),
    roomName: g(["Room type", "roomName"]),
    checkIn: toDateString(g(["Check-in date", "checkIn"])),
    checkOut: toDateString(g(["Check-out date", "checkOut"])),
    guestName: g(["Full name", "guestName"]),
    guestEmail: g(["Email", "guestEmail"]),
    guestPhone: g(["Phone number", "guestPhone"]),
    guests: g(["Number of guests", "guests"]),
    guestType: g(["Guest type", "guestType"]),
    status: g(["status"]) || "confirmed",
    createdBy: g(["createdBy"]) || "guest",
    paymentStatus: g(["Amount received", "paymentStatus"]) || "pending",
    createdAt: g(["Timestamp", "createdAt"]),
    cancelledAt: null,
    cancelledBy: null,
    cancellationReason: null,
    refundStatus: null,
  };
}

// ===== Public API =====

async function getRooms() {
  return rooms;
}

async function getRoom(roomId) {
  return rooms.find((r) => r.id === roomId) || null;
}

async function getBookings() {
  return bookings;
}

async function roomExists(roomId) {
  return rooms.some((r) => r.id === roomId);
}

function datesOverlap(startA, endA, startB, endB) {
  // Dates are already YYYY-MM-DD — lexicographic comparison works correctly
  return startA < endB && startB < endA;
}

function isRoomAvailable(roomId, checkIn, checkOut, ignoreBookingId = null) {
  const clashWithBooking = bookings.some((b) => {
    if (b.id === ignoreBookingId || b.status !== "confirmed") return false;
    return b.roomId === roomId && datesOverlap(checkIn, checkOut, b.checkIn, b.checkOut);
  });
  const clashWithBlocks = blockedDates.some((b) => {
    return b.roomId === roomId && datesOverlap(checkIn, checkOut, b.startDate, b.endDate);
  });
  return !clashWithBooking && !clashWithBlocks;
}

async function getAvailabilityEvents() {
  const bookedEvents = bookings
    .filter((b) => b.status === "confirmed")
    .map((b) => ({
      id: b.id,
      title: `${b.roomName} (Booked)`,
      start: b.checkIn,
      end: b.checkOut,
      color: "#ef4444",
    }));
  const blockedEvents = blockedDates.map((b) => ({
    id: b.id,
    title: `${b.roomName} (Blocked)`,
    start: b.startDate,
    end: b.endDate,
    color: "#f59e0b",
  }));
  return [...bookedEvents, ...blockedEvents];
}

async function createBooking(data) {
  const room = rooms.find((r) => r.id === data.roomId);
  if (!room) throw new Error("Room not found");

  if (!isRoomAvailable(data.roomId, data.checkIn, data.checkOut)) {
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
    paymentStatus:
      data.createdBy === "admin"
        ? "manual"
        : data.razorpayPaymentId
          ? "paid"
          : "unpaid",
    createdAt: new Date().toISOString(),
    cancelledAt: null,
    cancelledBy: null,
    cancellationReason: null,
    refundStatus: null,
  };

  bookings.push(booking);

  if (hasScript()) {
    try {
      // Calculate amount: nights × room price
      const checkInDate = new Date(booking.checkIn + "T00:00:00");
      const checkOutDate = new Date(booking.checkOut + "T00:00:00");
      const nights = Math.max(1, Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)));
      const amount = data.razorpayPaymentId
        ? nights * room.basePrice
        : data.amount
          ? Number(data.amount)
          : "Pending";

      const payload = {
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
      };

      console.log("[Sheets] appendBooking payload:", JSON.stringify(payload));
      await scriptPost(payload);
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

  if (hasScript()) {
    try {
      await scriptPost({
        action: "updateRoom",
        id: roomId,
        basePrice: basePrice,
      });
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

  if (hasScript()) {
    try {
      await scriptPost({
        action: "updateRoom",
        id: roomId,
        images: images.join(", "),
      });
    } catch (err) {
      console.error("[Sheets] Failed to sync room images:", err.message);
    }
  }

  return room;
}

// ===== Merge helper: keeps in-memory items + picks up sheet additions =====
function mergeById(existing, incoming, idKey, normalizeFn) {
  if (!Array.isArray(incoming) || incoming.length === 0) return;
  const existingIds = new Set(existing.map((item) => item[idKey]));
  for (const raw of incoming) {
    const normalized = normalizeFn(raw);
    if (!normalized || !normalized[idKey]) continue;
    if (!existingIds.has(normalized[idKey])) {
      existing.push(normalized);
      existingIds.add(normalized[idKey]);
    } else {
      const idx = existing.findIndex((item) => item[idKey] === normalized[idKey]);
      if (idx !== -1) existing[idx] = normalized;
    }
  }
}

// ===== Periodic re-sync from sheets (catches manual edits) =====
// Uses merge so in-memory items that failed to sync to sheets are NOT lost
let syncInterval = null;
function startPeriodicSync() {
  if (!hasScript()) return;
  syncInterval = setInterval(async () => {
    try {
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
      }

      const newBookings = Array.isArray(bookingsData)
        ? bookingsData.filter((b) => b.bookingId || b.Timestamp || b["Full name"])
        : [];
      mergeById(bookings, newBookings, "id", normalizeBookingFromScript);

      const newBlocks = Array.isArray(blocksData) ? blocksData.filter((b) => b.id) : [];
      mergeById(blockedDates, newBlocks, "id", (b) => ({
        id: b.id,
        roomId: b.roomId || "",
        roomName: b.roomName || "",
        startDate: b.startDate || "",
        endDate: b.endDate || "",
        reason: b.reason || "",
      }));
    } catch (err) {
      // Silently fail on re-sync
    }
  }, 8000);
}

// ===== Initialize =====
async function init() {
  rooms = DEFAULT_ROOMS.map((r) => ({ ...r }));
  if (hasScript()) {
    console.log("[Store] Using Apps Script web app:", getScriptUrl());
    await loadFromScript();
    startPeriodicSync();
  } else {
    console.log(
      "[Store] APPS_SCRIPT_URL not set — using in-memory only (data lost on restart)"
    );
  }
}

init();

process.on("exit", () => {
  if (syncInterval) clearInterval(syncInterval);
});
process.on("SIGINT", () => process.exit());
process.on("SIGTERM", () => process.exit());

module.exports = {
  getRooms,
  getRoom,
  getBookings,
  roomExists,
  isRoomAvailable,
  getAvailabilityEvents,
  createBooking,
  cancelBooking,
  createBlockedDate,
  updateRoomPrice,
  updateRoomImages,
};
