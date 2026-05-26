import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

const CACHE_DOC = "bookingCache";

export async function saveBookingCache(bookings) {
  try {
    await setDoc(doc(db, CACHE_DOC, "data"), {
      bookings,
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[bookingCache] save error:", e);
  }
}

export async function loadBookingCache() {
  try {
    const snap = await getDoc(doc(db, CACHE_DOC, "data"));
    if (snap.exists()) return snap.data().bookings || [];
    return null;
  } catch (e) {
    console.error("[bookingCache] load error:", e);
    return null;
  }
}
