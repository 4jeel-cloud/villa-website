import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

const CACHE_DOC = "availabilityCache";

export async function saveAvailabilityCache(availability) {
  try {
    await setDoc(doc(db, CACHE_DOC, "data"), {
      availability,
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[availabilityCache] save error:", e);
  }
}

export async function loadAvailabilityCache() {
  try {
    const snap = await getDoc(doc(db, CACHE_DOC, "data"));
    if (snap.exists()) return snap.data().availability || [];
    return null;
  } catch (e) {
    console.error("[availabilityCache] load error:", e);
    return null;
  }
}
