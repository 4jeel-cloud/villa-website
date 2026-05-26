import { collection, doc, setDoc, deleteDoc, getDocs, writeBatch } from "firebase/firestore";
import { db } from "./firebase";

const COLLECTION = "calendarEvents";

export async function fetchCalendarEvents() {
  const snap = await getDocs(collection(db, COLLECTION));
  const events = [];
  snap.forEach(d => events.push({ id: d.id, ...d.data() }));
  return events;
}

export async function syncCalendarEvents(events) {
  const existing = await getDocs(collection(db, COLLECTION));
  const batch = writeBatch(db);
  existing.forEach(d => batch.delete(d.ref));
  for (const evt of events) {
    const docId = evt.id || crypto.randomUUID();
    const ref = doc(db, COLLECTION, docId);
    batch.set(ref, {
      start: evt.start || evt.checkIn,
      end: evt.end || evt.checkOut,
      title: evt.title || (evt.roomName ? `${evt.roomName} (Booked)` : "Event"),
      color: evt.color || "#ef4444",
      guestName: evt.guestName || null,
      roomName: evt.roomName || (evt.title ? evt.title.replace(/ \(.*\)$/, "") : null),
      status: evt.status || "confirmed",
      updatedAt: new Date().toISOString(),
    });
  }
  await batch.commit();
}

export async function addCalendarEvent(evt) {
  const docId = evt.id || crypto.randomUUID();
  await setDoc(doc(db, COLLECTION, docId), {
    start: evt.start || evt.checkIn,
    end: evt.end || evt.checkOut,
    title: evt.title || (evt.roomName ? `${evt.roomName} (Booked)` : "Event"),
    color: evt.color || "#ef4444",
    guestName: evt.guestName || null,
    roomName: evt.roomName || (evt.title ? evt.title.replace(/ \(.*\)$/, "") : null),
    status: evt.status || "confirmed",
    updatedAt: new Date().toISOString(),
  });
}

export async function removeCalendarEvent(id) {
  await deleteDoc(doc(db, COLLECTION, id));
}
