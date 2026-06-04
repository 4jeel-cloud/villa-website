import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

const COLLECTION = "calendarEvents";

export async function fetchCalendarEvents() {
  try {
    const snap = await getDocs(collection(db, COLLECTION));
    const events = [];
    snap.forEach(d => events.push({ id: d.id, ...d.data() }));
    return events;
  } catch (err) {
    console.error("[calendarDb] fetchCalendarEvents failed:", err.message);
    return [];
  }
}

export function subscribeCalendarEvents(onData, onError) {
  return onSnapshot(
    collection(db, COLLECTION),
    (snap) => {
      const events = [];
      snap.forEach(d => events.push({ id: d.id, ...d.data() }));
      onData(events);
    },
    (err) => {
      console.error("[calendarDb] subscribe failed:", err.message);
      if (onError) onError(err);
    }
  );
}
