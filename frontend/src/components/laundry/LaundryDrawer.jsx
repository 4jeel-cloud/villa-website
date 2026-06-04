import { CATEGORIES } from "./constants";
import Stepper from "./Stepper";
import InputField from "./InputField";

export default function LaundryDrawer({
  drawer, onClose,
  drawerCat, setDrawerCat,
  drawerQty, setDrawerQty,
  drawerDmg, setDrawerDmg,
  drawerReady, setDrawerReady,
  drawerLaundry, setDrawerLaundry,
  drawerLost, setDrawerLost,
  drawerNotes, setDrawerNotes,
  drawerService, setDrawerService,
  onConfirm,
}) {
  const title = drawer === "send" ? "Send to Laundry" :
    drawer === "return" ? "Return from Laundry" :
    drawer === "add" ? "Add Stock" :
    drawer === "adjust" ? "Adjust Stock" : "Action";

  const confirmColor = drawer === "send" ? "#d4a843" :
    drawer === "return" ? "#4a7fcb" :
    drawer === "add" ? "#16a34a" : "#e05252";

  const confirmIcon = drawer === "send" ? "send" :
    drawer === "return" ? "arrow-back-up" :
    drawer === "add" ? "plus" : "adjustments";

  const confirmLabel = drawer === "send" ? "Confirm Send" :
    drawer === "return" ? "Confirm Return" :
    drawer === "add" ? "Confirm Add" : "Apply Adjustment";

  return (
    <>
      <div className="lt-dr-overlay" style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 50,
        opacity: drawer ? 1 : 0, pointerEvents: drawer ? "all" : "none",
        transition: "opacity .25s",
      }} onClick={onClose} />
      <div className="lt-dr" style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 360, maxWidth: "95vw",
        background: "#fff", borderLeft: "1px solid #e2e8f0", zIndex: 51,
        transform: drawer ? "none" : "translateX(100%)",
        transition: "transform .3s cubic-bezier(.25,.8,.25,1)",
        display: "flex", flexDirection: "column", boxShadow: "-4px 0 24px rgba(0,0,0,.08)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 18px 14px", borderBottom: "1px solid #e2e8f0", flexShrink: 0,
        }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#06402B" }}>{title}</span>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: 7, border: "1px solid #e2e8f0",
            background: "transparent", cursor: "pointer", color: "#94a3b8", fontSize: 14,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}><i className="ti ti-x" style={{ fontSize: 14 }} /></button>
        </div>
        <div style={{ padding: "16px 18px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 10.5, fontWeight: 600, color: "#64748b", letterSpacing: ".06em", textTransform: "uppercase" }}>Category</label>
            <select value={drawerCat} onChange={(e) => setDrawerCat(e.target.value)} style={{
              fontFamily: "inherit", fontSize: 13, color: "#0f172a",
              background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 8,
              padding: "9px 11px", outline: "none",
            }}>
              {CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          {drawer === "send" && (
            <>
              <Stepper label="Quantity to send" val={drawerQty} min={0} set={setDrawerQty} />
              <InputField label="Laundry service (optional)" val={drawerService} set={setDrawerService} placeholder="e.g. Express Cleaners" />
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 10.5, fontWeight: 600, color: "#64748b", letterSpacing: ".06em", textTransform: "uppercase" }}>Notes</label>
                <textarea value={drawerNotes} onChange={(e) => setDrawerNotes(e.target.value)} placeholder="Any special instructions\u2026" rows={3} style={{
                  fontFamily: "inherit", fontSize: 13, color: "#0f172a",
                  background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 8,
                  padding: "9px 11px", outline: "none", resize: "vertical",
                }} />
              </div>
            </>
          )}

          {drawer === "return" && (
            <>
              <Stepper label="Quantity returned (clean)" val={drawerQty} min={0} set={setDrawerQty} />
              <Stepper label="Damaged in this batch" val={drawerDmg} min={0} set={setDrawerDmg} />
            </>
          )}

          {drawer === "add" && (
            <Stepper label="Quantity to add" val={drawerQty} min={1} set={setDrawerQty} />
          )}

          {drawer === "adjust" && (
            <>
              <InputField label="Set Ready count" val={drawerReady} set={setDrawerReady} placeholder="New count" type="number" />
              <InputField label="Set In Laundry count" val={drawerLaundry} set={setDrawerLaundry} placeholder="New count" type="number" />
              <InputField label="Set Lost/Damaged count" val={drawerLost} set={setDrawerLost} placeholder="New count" type="number" />
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 10.5, fontWeight: 600, color: "#64748b", letterSpacing: ".06em", textTransform: "uppercase" }}>Reason</label>
                <textarea value={drawerNotes} onChange={(e) => setDrawerNotes(e.target.value)} placeholder="Manual correction, recount, etc." rows={2} style={{
                  fontFamily: "inherit", fontSize: 13, color: "#0f172a",
                  background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 8,
                  padding: "9px 11px", outline: "none", resize: "vertical",
                }} />
              </div>
            </>
          )}
        </div>
        <div style={{ padding: "12px 18px", borderTop: "1px solid #e2e8f0", flexShrink: 0 }}>
          <button onClick={onConfirm} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            width: "100%", padding: "10px 16px", borderRadius: 8,
            fontSize: 12.5, fontWeight: 600, fontFamily: "inherit",
            border: "none", cursor: "pointer", color: "#fff",
            background: confirmColor,
          }}>
            <i className={`ti ti-${confirmIcon}`} style={{ fontSize: 14 }} />
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}
