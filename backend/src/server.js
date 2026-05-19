const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const crypto = require("crypto");
const Razorpay = require("razorpay");
const store = require("./data/store");
const { sendBookingEmail } = require("./services/integrations");

const app = express();
app.use(cors());
app.use(express.json());

const MANAGER_EMAIL = process.env.MANAGER_EMAIL || "manager@homestay.local";
const PORT = process.env.PORT || 4000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";

function requireAdmin(req, res, next) {
  if (!ADMIN_TOKEN) {
    // No token configured — warn but allow (dev mode)
    console.warn("[Auth] ADMIN_TOKEN not set — admin routes are unprotected!");
    return next();
  }
  const auth = req.headers["authorization"] || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ message: "Unauthorized." });
  }
  next();
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

app.get("/bookings", async (_, res) => {
  const data = await store.getBookings();
  res.json(data);
});

app.post("/bookings", async (req, res) => {
  const { roomId, checkIn, checkOut, guestName, guestEmail, guestPhone, guests, guestType, createdBy = "guest" } = req.body;

  if (!roomId || !checkIn || !checkOut || !guestName || !guestEmail || !guestPhone) {
    return res.status(400).json({ message: "Missing required booking fields." });
  }
  if (!(await store.roomExists(roomId))) {
    return res.status(404).json({ message: "Room not found." });
  }

  // Verify Razorpay payment if payment data is present
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

// Create Razorpay order
app.post("/api/create-razorpay-order", async (req, res) => {
  if (!razorpay) return res.status(400).json({ message: "Razorpay not configured." });

  const { roomId, checkIn, checkOut } = req.body;
  const room = await store.getRoom(roomId);
  if (!room) return res.status(404).json({ message: "Room not found." });

  const nights = Math.max(1, Math.ceil(
    (new Date(checkOut + "T00:00:00") - new Date(checkIn + "T00:00:00")) / (1000 * 60 * 60 * 24)
  ));
  const amount = nights * room.basePrice * 100; // paise

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
