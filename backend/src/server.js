const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
dotenv.config();

const crypto = require("crypto");
const Razorpay = require("razorpay");
const store = require("./data/store");
const { sendBookingEmail } = require("./services/integrations");

const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: CORS_ORIGIN }));

app.use(express.json({ limit: "100kb" }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", apiLimiter);
app.use("/admin/", adminLimiter);

const MANAGER_EMAIL = process.env.MANAGER_EMAIL || "manager@homestay.local";
const PORT = process.env.PORT || 4000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || "";
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s+\-()]{7,20}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const VALID_GUEST_TYPES = new Set(["Family", "Bachelor"]);

function sanitize(str) {
  if (typeof str !== "string") return str;
  return str.replace(/[<>&"']/g, (c) => ({
    "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#x27;"
  }[c]));
}

async function verifyFirebaseToken(idToken) {
  if (!FIREBASE_API_KEY || !idToken) return null;
  try {
    const url = `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getAccountInfo?key=${FIREBASE_API_KEY}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.log(`[verifyFirebaseToken] Google API returned ${res.status}: ${text.slice(0, 200)}`);
      return null;
    }
    const data = await res.json();
    return data.users?.[0] || null;
  } catch (err) {
    console.log(`[verifyFirebaseToken] fetch error: ${err.message}`);
    return null;
  }
}

async function requireAdmin(req, res, next) {
  if (!ADMIN_TOKEN) {
    return res.status(500).json({ message: "Server misconfigured: authentication not set up." });
  }
  const auth = req.headers["authorization"] || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) {
    console.log("[requireAdmin] No token provided");
    return res.status(401).json({ message: "Unauthorized." });
  }
  if (token === ADMIN_TOKEN) {
    console.log("[requireAdmin] Matched ADMIN_TOKEN");
    return next();
  }

  console.log(`[requireAdmin] Token prefix: ${token.slice(0, 20)}... (does not match ADMIN_TOKEN)`);
  const firebaseUser = await verifyFirebaseToken(token);
  if (firebaseUser) {
    console.log(`[requireAdmin] Firebase verified: ${firebaseUser.email || firebaseUser.localId}`);
    return next();
  }

  console.log("[requireAdmin] Firebase verification FAILED");
  return res.status(401).json({ message: "Unauthorized." });
}

let razorpay = null;
if (process.env.RAZORPAY_KEY_ID) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

app.get("/health", (_, res) => {
  res.json({ ok: true });
});

app.get("/rooms", async (_, res) => {
  const rooms = await store.getRooms();
  res.json(rooms);
});

app.get("/availability", async (_, res) => {
  const events = await store.getAvailabilityEvents();
  res.json(events);
});

app.get("/bookings", requireAdmin, async (_, res) => {
  const data = await store.getBookings();
  res.json(data);
});

app.post("/bookings", async (req, res) => {
  let { roomId, checkIn, checkOut, guestName, guestEmail, guestPhone, guests, guestType, createdBy = "guest" } = req.body;

  guestName = sanitize(guestName);
  guestEmail = sanitize(guestEmail);
  guestPhone = sanitize(guestPhone);
  guestType = sanitize(guestType);
  roomId = sanitize(roomId);

  if (!roomId || !checkIn || !checkOut || !guestName || !guestEmail || !guestPhone) {
    return res.status(400).json({ message: "Missing required booking fields." });
  }
  if (!EMAIL_RE.test(guestEmail)) {
    return res.status(400).json({ message: "Invalid email format." });
  }
  if (!PHONE_RE.test(guestPhone)) {
    return res.status(400).json({ message: "Invalid phone number format." });
  }
  if (!DATE_RE.test(checkIn) || !DATE_RE.test(checkOut)) {
    return res.status(400).json({ message: "Dates must be in YYYY-MM-DD format." });
  }
  if (checkIn >= checkOut) {
    return res.status(400).json({ message: "Check-out must be after check-in." });
  }
  if (guestType && !VALID_GUEST_TYPES.has(guestType)) {
    return res.status(400).json({ message: "Guest type must be Family or Bachelor." });
  }
  if (guests && (isNaN(guests) || Number(guests) < 1)) {
    return res.status(400).json({ message: "Number of guests must be at least 1." });
  }
  if (!(await store.roomExists(roomId))) {
    return res.status(404).json({ message: "Room not found." });
  }

  if (req.body.razorpayPaymentId) {
    const expectedSig = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${req.body.razorpayOrderId}|${req.body.razorpayPaymentId}`)
      .digest("hex");
    if (expectedSig !== req.body.razorpaySignature) {
      return res.status(400).json({ message: "Payment verification failed." });
    }
  }

  if (!(await store.isRoomAvailable(roomId, checkIn, checkOut))) {
    return res.status(409).json({ message: "Room is already booked or blocked in selected dates." });
  }

  try {
    const booking = await store.createBooking({
      roomId, checkIn, checkOut, guestName, guestEmail, guestPhone, guests, guestType, createdBy,
      razorpayOrderId: req.body.razorpayOrderId,
      razorpayPaymentId: req.body.razorpayPaymentId,
    });

    await sendBookingEmail({
      to: guestEmail,
      subject: `Your stay at Creek View Villa is confirmed`,
      text: `Hi ${guestName},

Thank you for booking with us. Your reservation is confirmed.

Room: ${booking.roomName}
Check-in:  ${checkIn}
Check-out: ${checkOut}
Guests:    ${guests || "—"}

If you have any questions before your stay, just reply to this email or call us directly.

Looking forward to hosting you.

Creek View Villa
Padinjarathara, Wayanad, Kerala
`,
    });
    await sendBookingEmail({
      to: MANAGER_EMAIL,
      subject: "New Booking Alert – Creek View Villa",
      text: `New booking from ${guestName} for ${booking.roomName}.\nCheck-in: ${checkIn}\nCheck-out: ${checkOut}\n`,
    });

    return res.status(201).json(booking);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

app.post("/api/create-razorpay-order", async (req, res) => {
  if (!razorpay) return res.status(400).json({ message: "Razorpay not configured." });

  const { roomId, checkIn, checkOut } = req.body;
  const room = await store.getRoom(roomId);
  if (!room) return res.status(404).json({ message: "Room not found." });

  const nights = Math.max(1, Math.ceil(
    (new Date(checkOut + "T00:00:00") - new Date(checkIn + "T00:00:00")) / (1000 * 60 * 60 * 24)
  ));
  const amount = nights * room.basePrice * 100;

  try {
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `booking_${Date.now()}`,
      notes: { roomId, checkIn, checkOut },
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Razorpay order creation failed.", error: err.message });
  }
});

app.patch("/admin/bookings/:id/cancel", requireAdmin, async (req, res) => {
  const booking = await store.cancelBooking(req.params.id, {
    reason: req.body.reason || "Cancelled from admin dashboard",
    refundStatus: req.body.refundStatus || "pending",
    cancelledBy: "admin",
  });
  if (!booking) return res.status(404).json({ message: "Booking not found." });
  await sendBookingEmail({
    to: booking.guestEmail,
    subject: "Booking Cancelled – Creek View Villa",
    text: `Hi ${booking.guestName}, your booking for ${booking.roomName} was cancelled.`,
  });

  return res.json({
    id: booking.id,
    status: booking.status,
    cancelledAt: booking.cancelledAt,
    cancellationReason: booking.cancellationReason,
  });
});

app.patch("/admin/rooms/:id/price", requireAdmin, async (req, res) => {
  if (!req.body.basePrice || Number(req.body.basePrice) <= 0) {
    return res.status(400).json({ message: "basePrice must be greater than 0." });
  }
  const result = await store.updateRoomPrice(req.params.id, Number(req.body.basePrice));
  if (!result) return res.status(404).json({ message: "Room not found." });
  return res.json({ id: result.id, basePrice: result.basePrice });
});

app.patch("/admin/rooms/:id/images", requireAdmin, async (req, res) => {
  if (!Array.isArray(req.body.images) || req.body.images.length === 0) {
    return res.status(400).json({ message: "Provide a non-empty images array." });
  }
  const result = await store.updateRoomImages(req.params.id, req.body.images);
  if (!result) return res.status(404).json({ message: "Room not found." });
  return res.json({ id: result.id, images: result.images });
});

app.post("/admin/blocks", requireAdmin, async (req, res) => {
  const { roomId, startDate, endDate, reason } = req.body;
  if (!roomId || !startDate || !endDate) {
    return res.status(400).json({ message: "Missing roomId/startDate/endDate." });
  }
  if (!(await store.roomExists(roomId))) {
    return res.status(404).json({ message: "Room not found." });
  }
  if (!(await store.isRoomAvailable(roomId, startDate, endDate))) {
    return res.status(409).json({ message: "Room already unavailable in selected dates." });
  }
  try {
    const block = await store.createBlockedDate({ roomId, startDate, endDate, reason });
    return res.status(201).json(block);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
