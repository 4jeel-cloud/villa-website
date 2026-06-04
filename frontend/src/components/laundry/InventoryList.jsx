import { CATEGORIES } from "./constants";

export default function InventoryList({ stock, onOpenDrawer }) {
  const invItems = CATEGORIES.map((c) => {
    const d = stock[c.name] || { total: 0, clean: 0, atLaundry: 0, lost: 0 };
    return { ...c, ...d };
  });

  const btnBase = {
    display: "inline-flex", alignItems: "center", gap: 4,
    fontSize: 11, fontWeight: 600, padding: "6px 12px", borderRadius: 7,
    border: "none", cursor: "pointer", fontFamily: "inherit",
    transition: "all .15s",
  };

  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
      <div style={{
        padding: "12px 14px 10px", borderBottom: "1px solid #e5e7eb",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#06402B" }}>Inventory</span>
        <button onClick={() => onOpenDrawer("add")} style={{
          ...btnBase, background: "#06402B", color: "#fff",
        }}><i className="ti ti-plus" style={{ fontSize: 14 }} /> Add Stock</button>
      </div>
      <div style={{ padding: 10 }}>
        {invItems.map((item) => {
          const id = "linv_" + item.name.replace(/\s/g, "_");
          return (
            <div key={item.name} className="lt-inv-item" id={id} style={{
              borderRadius: 10, border: "1px solid #e5e7eb",
              marginBottom: 6, overflow: "hidden", transition: "all .15s", background: "#fff",
            }}>
              <div className="lt-inv-header" onClick={() => {
                const el = document.getElementById(id);
                el.classList.toggle("open");
              }} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "11px 14px",
                cursor: "pointer", transition: "background .15s",
              }}>
                <i className={`ti ti-${item.icon}`} style={{ fontSize: 16, color: "#06402B", width: 20, textAlign: "center", flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "#0f172a", flex: 1 }}>{item.name}</span>
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "#06402B", fontWeight: 600 }}>{item.total}</span>
                <i className="ti ti-chevron-right" style={{ fontSize: 12, color: "#94a3b8", transition: "transform .2s" }} />
              </div>
              <div className="lt-inv-body" style={{ display: "none", padding: "0 14px 12px", borderTop: "1px solid #e5e7eb" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, margin: "10px 0 8px" }}>
                  {[
                    { label: "Ready", val: item.clean, cls: "#16a34a" },
                    { label: "Laundry", val: item.atLaundry, cls: "#d4a843" },
                    { label: "Lost", val: item.lost, cls: "#e05252" },
                  ].map((f) => (
                    <div key={f.label} className="lt-stat-box" style={{
                      background: "#f8fafc", borderRadius: 8, padding: "8px 10px", border: "1px solid #e5e7eb",
                    }}>
                      <div style={{ fontSize: 9.5, color: "#64748b", letterSpacing: ".06em", textTransform: "uppercase", fontWeight: 500, marginBottom: 3 }}>{f.label}</div>
                      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 16, fontWeight: 500, color: f.cls }}>{f.val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  <button onClick={() => onOpenDrawer("send", item.name)} style={{ ...btnBase, background: "#06402B", color: "#fff" }}>
                    <i className="ti ti-send" style={{ fontSize: 12 }} /> Send
                  </button>
                  <button onClick={() => onOpenDrawer("return", item.name)} style={{ ...btnBase, background: "#f0fdf4", color: "#06402B", border: "1px solid #06402B", padding: "5px 11px" }}>
                    <i className="ti ti-arrow-back-up" style={{ fontSize: 12 }} /> Return
                  </button>
                  <button onClick={() => onOpenDrawer("adjust", item.name)} style={{ ...btnBase, background: "#f8fafc", color: "#64748b" }}>
                    <i className="ti ti-adjustments" style={{ fontSize: 12 }} /> Adjust
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
