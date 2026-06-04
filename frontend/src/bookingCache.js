/**
 * bookingCache — READ ONLY via client SDK.
 *
 * The bookingCache Firestore document is written exclusively by the backend
 * (server.js → store.js → firestoreDb.js) using the Firebase Admin SDK with
 * service-account credentials. Writing from the client would bypass backend
 * authentication entirely, so saveBookingCache has been removed.
 *
 * The cache is used to render the admin booking list instantly on page load
 * before the authenticated API response arrives.
 */
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

const CACHE_DOC = "bookingCache";

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
