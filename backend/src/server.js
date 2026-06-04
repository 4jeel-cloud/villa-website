const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
dotenv.config();

const crypto = require("crypto");
const Razorpay = require("razorpay");
const store = require("./data/store");
const admin = require("firebase-admin");
const { sendBookingEmail } = require("./services/integrations");
const emailTemplates = require("./services/emailTemplates");
const { handleValidation, bookingRules, dateRangeRules, blockRules, emailRule, cancelRules, priceRules, imageRules } = require("./validators");

const app = express();

// Correlation ID — every request gets a unique traceable ID
app.use((req, _, next) => {
  req.requestId = crypto.randomUUID();
  next();
});

app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://checkout.razorpay.com"],
      styleSrc: ["'self'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com", "'unsafe-inline'"],
      fontSrc: ["'self'", "https://cdn.jsdelivr.net", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "https://firestore.googleapis.com"],
      frameSrc: ["'self'", "https://checkout.razorpay.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
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

const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

const resetEmailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", apiLimiter);
app.use("/admin/", adminLimiter);
// Public data endpoints also get the API rate limiter
app.use("/rooms", apiLimiter);
app.use("/availability", apiLimiter);
app.use("/bookings", apiLimiter);

const MANAGER_EMAILS = (process.env.MANAGER_EMAIL || "manager@homestay.local")
  .split(",").map((s) => s.trim()).filter(Boolean);
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
const PORT = process.env.PORT || 4000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";

// Firebase Admin is initialized by firestoreDb.js during store.init() which runs
// synchronously via require('./data/store') above. By the time this code executes,
// admin.apps[0] is already set. We just check and flag it for the reset-email route.
let firebaseAdminInitialized = admin.apps.length > 0;
if (!firebaseAdminInitialized) {
  // Fallback: store may not have connected yet (e.g. Firestore disabled) — try ourselves
  try {
    const saPath = __dirname + "/../service-account.json";
    if (require("fs").existsSync(saPath)) {
      admin.initializeApp({ credential: admin.credential.cert(require(saPath)) });
      firebaseAdminInitialized = true;
      console.log("[Firebase Admin] Initialized with service account (fallback).");
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
      });
      firebaseAdminInitialized = true;
      console.log("[Firebase Admin] Initialized with env var (fallback).");
    } else {
      console.log("[Firebase Admin] No credentials found — password reset disabled.");
    }
  } catch (e) {
    console.log("[Firebase Admin] Init failed:", e.message);
  }
} else {
  console.log("[Firebase Admin] Already initialized by store — reusing.");
}

// Async route handler wrapper — eliminates try/catch boilerplate
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

// Centralized error handler middleware
function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  console.error(`[${req.requestId}] ${err.message}`);
  res.status(status).json({ message: err.message || "Internal server error." });
}

function sanitize(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/[<>&"']/g, (c) => ({
      "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#x27;"
    }[c]))
    .replace(/\\/g, "&#x5c;")
    .replace(/`/g, "&#x60;");
}

const MAX_STR_LEN = 500;
const MAX_REASON_LEN = 1000;

function truncate(str, max) {
  if (typeof str !== "string") return str;
  return str.slice(0, max);
}

async function verifyFirebaseToken(idToken) {
  if (!idToken) return null;
  // Use Firebase Admin SDK — much more reliable than the deprecated REST endpoint
  if (!firebaseAdminInitialized || admin.apps.length === 0) return null;
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    if (!decoded) return null;
    const userEmail = (decoded.email || "").toLowerCase();
    if (ADMIN_EMAILS.length > 0 && (!userEmail || !ADMIN_EMAILS.includes(userEmail))) {
      console.log(`[verifyFirebaseToken] Email ${userEmail} not in ADMIN_EMAILS`);
      return null;
    }
    return decoded;
  } catch (err) {
    console.log(`[verifyFirebaseToken] error: ${err.message}`);
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

  console.log("[requireAdmin] Token does not match ADMIN_TOKEN, trying Firebase...");
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

// Fire-and-forget email helper — logs errors but never blocks the response
function sendEmailSafe(opts) {
  sendBookingEmail(opts).catch((err) => console.error("[Email] Send failed:", err.message));
}

app.get("/health", (_, res) => {
  res.json({ ok: true });
});

app.get("/rooms", asyncHandler(async (req, res) => {
  const rooms = await store.getRooms();
  res.json(rooms);
}));

app.get("/availability", asyncHandler(async (req, res) => {
  const events = await store.getAvailabilityEvents();
  res.json(events);
}));

app.get("/bookings", requireAdmin, asyncHandler(async (req, res) => {
  const data = await store.getBookings();
  res.json(data);
}));

app.post("/bookings", bookingLimiter, bookingRules, handleValidation, asyncHandler(async (req, res) => {
  let { roomId, guestName, guestEmail, guestPhone, guestType, createdBy = "guest" } = req.body;
  const { checkIn, checkOut } = req.body;
  let { guests } = req.body;
  if (guests !== undefined && guests !== "") guests = Number(guests);

  guestName = truncate(sanitize(guestName), MAX_STR_LEN);
  guestEmail = truncate(sanitize(guestEmail), MAX_STR_LEN);
  guestPhone = truncate(sanitize(guestPhone), MAX_STR_LEN);
  guestType = sanitize(guestType);
  roomId = sanitize(roomId);
  createdBy = sanitize(createdBy);

  if (checkIn >= checkOut) {
    return res.status(400).json({ message: "Check-out must be after check-in." });
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

  const booking = await store.createBooking({
    roomId, checkIn, checkOut, guestName, guestEmail, guestPhone, guests, guestType, createdBy,
    razorpayOrderId: req.body.razorpayOrderId,
    razorpayPaymentId: req.body.razorpayPaymentId,
  });

  sendEmailSafe({
    to: guestEmail,
    subject: "Your stay at Creek View Villa is confirmed",
    html: emailTemplates.confirmationEmail({
      name: guestName, room: booking.roomName, checkin: checkIn, checkout: checkOut,
      nights: Math.max(1, Math.ceil((new Date(checkOut + "T00:00:00") - new Date(checkIn + "T00:00:00")) / 86400000)),
      guests, phone: guestPhone,
    }),
  });
  for (const email of MANAGER_EMAILS) {
    sendEmailSafe({
      to: email,
      subject: "New Booking Alert \u2013 Creek View Villa",
      html: emailTemplates.managerAlert({ guestName, roomName: booking.roomName, checkIn, checkOut }),
    });
  }

  return res.status(201).json(booking);
}));

app.post("/api/create-razorpay-order", dateRangeRules, handleValidation, asyncHandler(async (req, res) => {
  if (!razorpay) return res.status(400).json({ message: "Razorpay not configured." });

  let { roomId } = req.body;
  const { checkIn, checkOut } = req.body;
  roomId = sanitize(roomId);

  if (checkIn >= checkOut) {
    return res.status(400).json({ message: "Check-out must be after check-in." });
  }

  const room = await store.getRoom(roomId);
  if (!room) return res.status(404).json({ message: "Room not found." });

  const nights = Math.max(1, Math.ceil(
    (new Date(checkOut + "T00:00:00") - new Date(checkIn + "T00:00:00")) / (1000 * 60 * 60 * 24)
  ));
  const amount = nights * room.basePrice * 100;

  const order = await razorpay.orders.create({
    amount,
    currency: "INR",
    receipt: `booking_${Date.now()}`,
    notes: { roomId, checkIn, checkOut },
  });
  res.json(order);
}));

app.patch("/admin/bookings/:id/cancel", requireAdmin, cancelRules, handleValidation, asyncHandler(async (req, res) => {
  const reason = truncate(sanitize(req.body.reason || "Cancelled from admin dashboard"), MAX_REASON_LEN);
  const refundStatus = sanitize(req.body.refundStatus || "pending");
  const booking = await store.cancelBooking(req.params.id, {
    reason,
    refundStatus,
    cancelledBy: "admin",
  });
  if (!booking) return res.status(404).json({ message: "Booking not found." });
  sendEmailSafe({
    to: booking.guestEmail,
    subject: "Booking Cancelled \u2013 Creek View Villa",
    html: emailTemplates.cancellationEmail({ name: booking.guestName, room: booking.roomName, checkin: booking.checkIn, checkout: booking.checkOut }),
  });
  for (const email of MANAGER_EMAILS) {
    sendEmailSafe({
      to: email,
      subject: "Booking Cancelled \u2013 Creek View Villa",
      html: emailTemplates.managerAlert({ guestName: booking.guestName, roomName: booking.roomName, checkIn: booking.checkIn, checkOut: booking.checkOut }),
    });
  }
  return res.json({
    id: booking.id,
    status: booking.status,
    cancelledAt: booking.cancelledAt,
    cancellationReason: booking.cancellationReason,
  });
}));

app.patch("/admin/rooms/:id/price", requireAdmin, priceRules, handleValidation, asyncHandler(async (req, res) => {
  const result = await store.updateRoomPrice(req.params.id, Number(req.body.basePrice));
  if (!result) return res.status(404).json({ message: "Room not found." });
  return res.json({ id: result.id, basePrice: result.basePrice });
}));

app.patch("/admin/rooms/:id/images", requireAdmin, imageRules, handleValidation, asyncHandler(async (req, res) => {
  const images = req.body.images.map((url) => {
    const s = sanitize(String(url));
    if (!/^[a-z0-9\-._~:/?#[\]@!$&'()*+,;=%]+$/i.test(s)) return "";
    return s;
  }).filter(Boolean);
  if (images.length === 0) {
    return res.status(400).json({ message: "All image paths were invalid." });
  }
  const result = await store.updateRoomImages(req.params.id, images);
  if (!result) return res.status(404).json({ message: "Room not found." });
  return res.json({ id: result.id, images: result.images });
}));

app.post("/admin/blocks", requireAdmin, blockRules, handleValidation, asyncHandler(async (req, res) => {
  let { roomId, reason } = req.body;
  const { startDate, endDate } = req.body;
  roomId = sanitize(roomId);
  reason = truncate(sanitize(reason || ""), MAX_REASON_LEN);

  if (startDate >= endDate) {
    return res.status(400).json({ message: "End date must be after start date." });
  }
  if (!(await store.roomExists(roomId))) {
    return res.status(404).json({ message: "Room not found." });
  }
  if (!(await store.isRoomAvailable(roomId, startDate, endDate))) {
    return res.status(409).json({ message: "Room already unavailable in selected dates." });
  }
  const block = await store.createBlockedDate({ roomId, startDate, endDate, reason });
  return res.status(201).json(block);
}));

app.post("/api/send-reset-email", resetEmailLimiter, emailRule, handleValidation, asyncHandler(async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();
  if (!firebaseAdminInitialized) {
    return res.status(503).json({ message: "Email service not available." });
  }
  const actionUrl = (process.env.CORS_ORIGIN || "http://localhost:5173") + "/auth/reset-password";
  try {
    const link = await admin.auth().generatePasswordResetLink(email, {
      url: actionUrl,
      handleCodeInApp: true,
    });
    await sendBookingEmail({
      to: email,
      subject: "Reset your password \u2013 Creek View Villa",
      html: emailTemplates.resetPasswordEmail({ link }),
    });
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      return res.json({ message: "If an account exists, a reset email has been sent." });
    }
    throw err;
  }
  return res.json({ message: "Reset email sent." });
}));

// Centralized error handler — must be registered after all routes
app.use(errorHandler);

// Validate required environment variables at startup
const REQUIRED_ENV_VARS = ["ADMIN_TOKEN"];
for (const v of REQUIRED_ENV_VARS) {
  if (!process.env[v]) {
    console.error(`[Server] Missing required env var: ${v}`);
    process.exit(1);
  }
}

async function start() {
  await store.init();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
start().catch((err) => {
  console.error("[Server] Failed to start:", err.message);
  process.exit(1);
});



