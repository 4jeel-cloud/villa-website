const actIconMap = {
  up: "arrow-up",
  down: "arrow-down",
  warn: "alert-triangle",
  add: "plus",
};

export default function ActivityFeed({ activity }) {
  if (activity.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 20, color: "#94a3b8", fontSize: 12 }}>No activity yet.</div>
    );
  }

  const groups = {};
  activity.forEach((a) => {
    const g = a.time || "Today";
    if (!groups[g]) groups[g] = [];
    groups[g].push(a);
  });

  const clsMap = { up: "#16a34a", down: "#4a7fcb", warn: "#d4a843", add: "#16a34a" };
  const bgMap = { up: "#f0fdf4", down: "#eff6ff", warn: "#fefce8", add: "#f0fdf4" };

  return (
    <div style={{ padding: "10px 14px", maxHeight: 380, overflowY: "auto" }}>
      {Object.entries(groups).map(([date, items]) => (
        <div key={date}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "#64748b", marginBottom: 8, marginTop: 12 }}>{date}</div>
          {items.map((a, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 0",
              borderBottom: "1px solid #f1f5f9",
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%", display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: 11,
                flexShrink: 0, marginTop: 1,
                background: bgMap[a.type] || "#f8fafc",
                color: clsMap[a.type] || "#64748b",
              }}><i className={`ti ti-${actIconMap[a.type] || "circle"}`} style={{ fontSize: 12 }} /></div>
              <div style={{ fontSize: 12, color: "#334155", lineHeight: 1.45, flex: 1 }}>
                {a.text}
                <span style={{ color: "#94a3b8", fontSize: 10.5, display: "block", marginTop: 1 }}>
                  {new Date(a.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
