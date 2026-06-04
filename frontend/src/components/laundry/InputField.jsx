export default function InputField({ label, val, set, placeholder, type = "text" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 10.5, fontWeight: 600, color: "#64748b", letterSpacing: ".06em", textTransform: "uppercase" }}>{label}</label>
      <input type={type} min="0" placeholder={placeholder} value={val} onChange={(e) => set(e.target.value)} style={{
        fontFamily: "inherit", fontSize: 13, color: "#0f172a",
        background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 8,
        padding: "9px 11px", outline: "none",
      }} />
    </div>
  );
}
