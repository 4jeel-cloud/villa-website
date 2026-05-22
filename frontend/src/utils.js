export function toDateKey(d) {
  const dt = typeof d === "string" ? new Date(d + "T00:00:00") : d;
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}


