export default function LaundryToast({ toasts }) {
  return (
    <div style={{ position: "fixed", bottom: 80, right: 24, zIndex: 60, display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
      {toasts.map((t) => (
        <div key={t.id} className="lt-toast" style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "#fff", color: "#0f172a", fontSize: 13, fontWeight: 500,
          padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0",
          boxShadow: "0 8px 24px rgba(0,0,0,.12)",
          animation: "ltin .25s cubic-bezier(.34,1.56,.64,1) both", maxWidth: 280,
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
            background: t.type === "green" ? "#16a34a" : t.type === "amber" ? "#d4a843" : "#e05252",
          }} />
          {t.msg}
        </div>
      ))}
    </div>
  );
}
