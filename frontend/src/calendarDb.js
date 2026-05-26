import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

const COLLECTION = "calendarEvents";

export async function fetchCalendarEvents() {
  const snap = await getDocs(collection(db, COLLECTION));
  const events = [];
  snap.forEach(d => events.push({ id: d.id, ...d.data() }));
  return events;
}
