import { useState } from "react";
import { CATEGORIES } from "./constants";

export default function InventoryChart({ kpi, stock }) {
  const [chartTab, setChartTab] = useState("status");
  const globalMax = Math.max(1, kpi.total);

  const invItems = CATEGORIES.map((c) => {
    const d = stock[c.name] || { total: 0, clean: 0, atLaundry: 0, lost: 0 };
    return { ...c, ...d };
  });

  const rows = chartTab === "status"
    ? [
        { label: "Ready to Use", val: kpi.ready, cls: "#16a34a" },
        { label: "In Laundry", val: kpi.laundry, cls: "#d4a843" },
        { label: "Lost / Damaged", val: kpi.lost, cls: "#e05252" },
      ]
    : invItems.map((c, i) => ({
        label: c.name,
        val: c.total,
        cls: ["#16a34a", "#d4a843", "#e05252", "#4a7fcb", "#06402B", "#d4a843"][i % 6],
      }));

  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "16px 18px", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#06402B" }}>Inventory Overview</span>
        <div style={{ display: "flex", gap: 3, background: "#f1f5f9", borderRadius: 8, padding: 3 }}>
          {["status", "category"].map((t) => (
            <button key={t} onClick={() => setChartTab(t)} style={{
              fontSize: 11, fontWeight: 500, padding: "4px 12px", borderRadius: 6, border: "none",
              cursor: "pointer", color: chartTab === t ? "#fff" : "#64748b",
              background: chartTab === t ? "#06402B" : "transparent",
              transition: "all .15s", fontFamily: "inherit",
            }}>{t === "status" ? "Status View" : "Category View"}</button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.map((r) => (
          <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: "#475569", minWidth: 110, fontWeight: 500 }}>{r.label}</span>
            <div style={{ flex: 1, height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 4, width: Math.round(r.val / globalMax * 100) + "%", background: r.cls, transition: "width .6s cubic-bezier(.25,.8,.25,1)" }} />
            </div>
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#0f172a", minWidth: 28, textAlign: "right", fontWeight: 500 }}>{r.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
