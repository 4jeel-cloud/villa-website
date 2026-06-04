export default function LaundryFab({ fabOpen, onToggle, onAction }) {
  const items = [
    { label: "Send to Laundry", icon: "send", cls: "#d4a843", type: "send" },
    { label: "Return from Laundry", icon: "arrow-back-up", cls: "#4a7fcb", type: "return" },
    { label: "Add Stock", icon: "plus", cls: "#16a34a", type: "add" },
    { label: "Adjust Stock", icon: "adjustments", cls: "#e05252", type: "adjust" },
  ];

  return (
    <div style={{ position: "fixed", bottom: 80, right: 24, zIndex: 40, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
      <div style={{
        display: "flex", flexDirection: "column", gap: 5, alignItems: "flex-end",
        transition: "opacity .25s,transform .25s", opacity: fabOpen ? 1 : 0,
        pointerEvents: fabOpen ? "all" : "none", transform: fabOpen ? "none" : "translateY(10px)",
      }}>
        {items.map((f) => (
          <button key={f.type} className="lt-fab-item" onClick={() => onAction(f.type)} style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#fff", border: "1px solid #e2e8f0",
            color: "#0f172a", fontSize: 12.5, fontWeight: 500,
            padding: "8px 14px 8px 10px", borderRadius: 24, cursor: "pointer",
            transition: "all .18s", boxShadow: "0 4px 16px rgba(0,0,0,.1)",
            whiteSpace: "nowrap", fontFamily: "inherit",
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%", display: "flex",
              alignItems: "center", justifyContent: "center",
              background: f.cls + "18", color: f.cls,
            }}><i className={`ti ti-${f.icon}`} style={{ fontSize: 12 }} /></div>
            {f.label}
          </button>
        ))}
      </div>
      <button onClick={onToggle} style={{
        width: 48, height: 48, borderRadius: "50%", background: "#06402B", border: "none",
        cursor: "pointer", color: "#fff", fontSize: 22, display: "flex", alignItems: "center",
        justifyContent: "center", boxShadow: "0 6px 20px rgba(6,64,43,.3)",
        transition: "transform .25s cubic-bezier(.34,1.56,.64,1)",
        transform: fabOpen ? "rotate(45deg)" : "none",
      }}><i className="ti ti-plus" style={{ fontSize: 20 }} /></button>
    </div>
  );
}
