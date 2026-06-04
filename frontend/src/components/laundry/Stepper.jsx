export default function Stepper({ label, val, min = 0, set }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 10.5, fontWeight: 600, color: "#64748b", letterSpacing: ".06em", textTransform: "uppercase" }}>{label}</label>
      <div style={{ display: "inline-flex", alignItems: "center", background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 8, overflow: "hidden", alignSelf: "flex-start" }}>
        <button onClick={() => set(Math.max(min, val - 1))} style={{ width: 34, height: 36, border: "none", background: "transparent", cursor: "pointer", color: "#64748b", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}><i className="ti ti-minus" style={{ fontSize: 14 }} /></button>
        <div style={{ width: 1, height: 20, background: "#e2e8f0" }} />
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, fontWeight: 500, color: "#0f172a", minWidth: 44, textAlign: "center" }}>{val}</span>
        <div style={{ width: 1, height: 20, background: "#e2e8f0" }} />
        <button onClick={() => set(val + 1)} style={{ width: 34, height: 36, border: "none", background: "transparent", cursor: "pointer", color: "#64748b", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}><i className="ti ti-plus" style={{ fontSize: 14 }} /></button>
      </div>
    </div>
  );
}
