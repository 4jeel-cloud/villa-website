const admin = require("firebase-admin");

let firestore = null;

function isConnected() {
  return !!firestore;
}

async function connect() {
  if (admin.apps.length > 0) {
    firestore = admin.firestore();
    return;
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!serviceAccountJson && !keyFile) {
    console.log("[Firestore] Neither FIREBASE_SERVICE_ACCOUNT nor GOOGLE_APPLICATION_CREDENTIALS set — Firestore disabled");
    return;
  }

  try {
    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
    } else {
      // Uses GOOGLE_APPLICATION_CREDENTIALS env var (Render Secret Files)
      admin.initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID });
    }
    firestore = admin.firestore();
    // Test connection
    await firestore.collection("rooms").limit(1).get();
    console.log("[Firestore] Connected");
  } catch (err) {
    console.error("[Firestore] Connection failed:", err.message);
    firestore = null;
  }
}

// ===== Rooms =====

async function loadRooms() {
  if (!isConnected()) return null;
  const snap = await firestore.collection("rooms").get();
  return snap.docs.map(d => d.data());
}

async function upsertRoom(room) {
  if (!isConnected()) return;
  await firestore.collection("rooms").doc(room.id).set(room, { merge: true });
}

async function updateRoomPriceDb(roomId, basePrice) {
  if (!isConnected()) return;
  await firestore.collection("rooms").doc(roomId).update({ basePrice });
}

async function updateRoomImagesDb(roomId, images) {
  if (!isConnected()) return;
  await firestore.collection("rooms").doc(roomId).update({ images });
}

// ===== Bookings =====

async function loadBookings() {
  if (!isConnected()) return null;
  const snap = await firestore.collection("bookings")
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map(d => d.data());
}

async function insertBooking(booking) {
  if (!isConnected()) return;
  await firestore.collection("bookings").doc(booking.id).set(booking, { merge: true });
}

async function cancelBookingDb(bookingId, data) {
  if (!isConnected()) return;
  await firestore.collection("bookings").doc(bookingId).update({
    status: "cancelled",
    cancelledAt: new Date().toISOString(),
    cancelledBy: data.cancelledBy || "admin",
    cancellationReason: data.reason || "Cancelled by admin",
    refundStatus: data.refundStatus || "pending",
  });
}

// ===== Blocked Dates =====

async function loadBlockedDates() {
  if (!isConnected()) return null;
  const snap = await firestore.collection("blocked_dates").get();
  return snap.docs.map(d => d.data());
}

async function insertBlockedDate(block) {
  if (!isConnected()) return;
  await firestore.collection("blocked_dates").doc(block.id).set(block, { merge: true });
}

// ===== Calendar Events (for frontend calendar) =====

async function syncCalendarEvents(events) {
  if (!isConnected()) return;
  const batch = firestore.batch();
  const existing = await firestore.collection("calendarEvents").get();
  existing.forEach(d => batch.delete(d.ref));
  for (const evt of events) {
    const ref = firestore.collection("calendarEvents").doc(evt.id || String(Math.random()));
    batch.set(ref, {
      start: evt.start,
      end: evt.end,
      title: evt.title,
      color: evt.color || "#ef4444",
      guestName: evt.guestName || null,
      roomName: evt.roomName || null,
      status: evt.status || "confirmed",
    });
  }
  await batch.commit();
}

async function shutdown() {
  // firebase-admin doesn't need explicit disconnect in most environments
}

module.exports = {
  connect, isConnected, shutdown,
  loadRooms, upsertRoom, updateRoomPriceDb, updateRoomImagesDb,
  loadBookings, insertBooking, cancelBookingDb,
  loadBlockedDates, insertBlockedDate,
  syncCalendarEvents,
};
