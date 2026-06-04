import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

const LAUNDRY_DOC = "laundry";

export async function saveLaundryData(stock, alerts, activity) {
  try {
    await setDoc(doc(db, LAUNDRY_DOC, "data"), {
      stock,
      alerts,
      activity,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (e) {
    console.error("[laundryDb] save error:", e);
  }
}

export async function loadLaundryData() {
  try {
    const snap = await getDoc(doc(db, LAUNDRY_DOC, "data"));
    if (snap.exists()) {
      return { data: snap.data(), error: null };
    }
    return { data: null, empty: true };
  } catch (e) {
    console.error("[laundryDb] load error:", e);
    return { data: null, error: e };
  }
}
