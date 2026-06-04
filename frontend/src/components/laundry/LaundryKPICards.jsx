export default function LaundryKPICards({ kpi }) {
  const cards = [
    { label: "Total Items", val: kpi.total, sub: "All categories", cls: "#0f172a" },
    { label: "Ready to Use", val: kpi.ready, sub: "Clean & available", cls: "#16a34a" },
    { label: "In Laundry", val: kpi.laundry, sub: "Currently washing", cls: "#d4a843" },
    { label: "Lost / Damaged", val: kpi.lost, sub: "Written off", cls: "#e05252" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
      {cards.map((k) => (
        <div key={k.label} className="lt-kpi" style={{
          background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb",
          padding: "14px 16px", transition: "all .2s", cursor: "default",
        }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: "#64748b", marginBottom: 6 }}>{k.label}</div>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 28, fontWeight: 700, color: k.cls, lineHeight: 1 }}>{k.val}</div>
          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>{k.sub}</div>
        </div>
      ))}
    </div>
  );
}
