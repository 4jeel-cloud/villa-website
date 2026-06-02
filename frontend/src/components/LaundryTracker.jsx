import { useState, useEffect, useRef, useMemo } from "react";
import { loadLaundryData, saveLaundryData } from "../laundryDb";

const CATEGORIES = [
  { name: "Bedsheets", icon: "bed" },
  { name: "Towels", icon: "bath" },
  { name: "Pillow Covers", icon: "cube" },
  { name: "Duvet Covers", icon: "box" },
  { name: "Blankets", icon: "package" },
  { name: "Rugs", icon: "layout-grid" },
];

function tot(stock) {
  let t = 0, r = 0, l = 0, lo = 0;
  Object.values(stock).forEach((s) => { t += s.total || 0; r += s.clean || 0; l += s.atLaundry || 0; lo += s.lost || 0; });
  return { total: t, ready: r, laundry: l, lost: lo };
}

const ICON = (name) => `<i class="ti ti-${name}" style="font-size:14px;vertical-align:middle"></i>`;

export default function LaundryTracker() {
  const [stock, setStock] = useState({});
  const [activity, setActivity] = useState([]);
  const [drawer, setDrawer] = useState(null);
  const [drawerCat, setDrawerCat] = useState(CATEGORIES[0].name);
  const [drawerQty, setDrawerQty] = useState(1);
  const [drawerDmg, setDrawerDmg] = useState(0);
  const [drawerReady, setDrawerReady] = useState("");
  const [drawerLaundry, setDrawerLaundry] = useState("");
  const [drawerLost, setDrawerLost] = useState("");
  const [drawerNotes, setDrawerNotes] = useState("");
  const [drawerService, setDrawerService] = useState("");
  const [fabOpen, setFabOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [chartTab, setChartTab] = useState("status");
  const loaded = useRef(false);
  const loadedData = useRef(false);

  useEffect(() => {
    if (loadedData.current) return;
    loadedData.current = true;
    loadLaundryData().then((d) => {
      if (d) {
        let s = d.stock || {};
        if (Array.isArray(s)) {
          const converted = {};
          CATEGORIES.forEach((c) => { converted[c.name] = { total: 0, clean: 0, atLaundry: 0, lost: 0 }; });
          s.forEach((item) => {
            if (item && item.name && converted[item.name] !== undefined) {
              converted[item.name] = {
                total: item.total || 0,
                clean: item.clean || 0,
                atLaundry: item.atLaundry || 0,
                lost: item.lost || 0,
              };
            }
          });
          s = converted;
          saveLaundryData(s, [], d.activity || []);
        }
        setStock(s);
        setActivity(d.activity || []);
        loaded.current = true;
      } else {
        const init = {};
        CATEGORIES.forEach((c) => { init[c.name] = { total: 0, clean: 0, atLaundry: 0, lost: 0 }; });
        setStock(init);
        loaded.current = true;
      }
    });
  }, []);

  const saveTimer = useRef(null);
  useEffect(() => {
    if (!loaded.current) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveLaundryData(stock, [], activity), 500);
  }, [stock, activity]);

  useEffect(() => {
    const h = () => { clearTimeout(saveTimer.current); saveLaundryData(stock, [], activity); };
    window.addEventListener("beforeunload", h);
    return () => { window.removeEventListener("beforeunload", h); clearTimeout(saveTimer.current); };
  }, [stock, activity]);

  const kpi = useMemo(() => tot(stock), [stock]);

  function addAct(type, text) {
    setActivity((prev) => [{ type, text, time: "Today", ts: Date.now() }, ...prev].slice(0, 50));
  }

  function toast(msg, type) {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg, type: type || "green" }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2600);
  }

  function openDr(type, cat) {
    setDrawer(type);
    setDrawerCat(cat || CATEGORIES[0].name);
    setDrawerQty(1);
    setDrawerDmg(0);
    setDrawerReady("");
    setDrawerLaundry("");
    setDrawerLost("");
    setDrawerNotes("");
    setDrawerService("");
    closeFab();
  }

  function closeDr() { setDrawer(null); }

  function doSend() {
    const s = { ...stock };
    const item = { ...(s[drawerCat] || { total: 0, clean: 0, atLaundry: 0, lost: 0 }) };
    const qty = drawerQty;
    if (qty > item.clean) { toast("Not enough ready items", "red"); return; }
    item.clean -= qty;
    item.atLaundry += qty;
    s[drawerCat] = item;
    setStock(s);
    addAct("up", `${qty} ${drawerCat} sent to laundry${drawerService ? " (" + drawerService + ")" : ""}`);
    closeDr();
    toast(`${qty} ${drawerCat} sent to laundry`, "amber");
  }

  function doReturn() {
    const s = { ...stock };
    const item = { ...(s[drawerCat] || { total: 0, clean: 0, atLaundry: 0, lost: 0 }) };
    const qty = drawerQty;
    const dmg = drawerDmg;
    if (qty + dmg > item.atLaundry) { toast("Return + damaged exceeds laundry count", "red"); return; }
    item.atLaundry -= qty + dmg;
    item.clean += qty;
    item.lost += dmg;
    s[drawerCat] = item;
    setStock(s);
    addAct("down", `${qty} ${drawerCat} returned${dmg ? ` \u00B7 ${dmg} damaged` : ""}`);
    if (dmg) addAct("warn", `${dmg} ${drawerCat} marked as damaged`);
    closeDr();
    toast(`${qty} ${drawerCat} returned${dmg ? `, ${dmg} damaged` : ""}`, "green");
  }

  function doAdd() {
    const s = { ...stock };
    const item = { ...(s[drawerCat] || { total: 0, clean: 0, atLaundry: 0, lost: 0 }) };
    const qty = drawerQty;
    item.total += qty;
    item.clean += qty;
    s[drawerCat] = item;
    setStock(s);
    addAct("add", `${qty} ${drawerCat} added to inventory`);
    closeDr();
    toast(`${qty} ${drawerCat} added`, "green");
  }

  function doAdjust() {
    const s = { ...stock };
    const item = { ...(s[drawerCat] || { total: 0, clean: 0, atLaundry: 0, lost: 0 }) };
    if (drawerReady !== "") item.clean = parseInt(drawerReady) || 0;
    if (drawerLaundry !== "") item.atLaundry = parseInt(drawerLaundry) || 0;
    if (drawerLost !== "") item.lost = parseInt(drawerLost) || 0;
    item.total = item.clean + item.atLaundry + item.lost;
    s[drawerCat] = item;
    setStock(s);
    addAct("warn", `Stock adjusted: ${drawerCat}`);
    closeDr();
    toast(`${drawerCat} stock adjusted`, "amber");
  }

  function toggleFab() { setFabOpen((o) => !o); }
  function closeFab() { setFabOpen(false); }

  const globalMax = Math.max(1, kpi.total);

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

  const actIconMap = {
    up: "arrow-up",
    down: "arrow-down",
    warn: "alert-triangle",
    add: "plus",
  };

  return (
    <div>
      <style>{`
        .lt-dr-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 50;
          opacity: 0; pointer-events: none; transition: opacity .25s;
        }
        .lt-dr-overlay.open { opacity: 1; pointer-events: all; }
        .lt-dr {
          position: fixed; top: 0; right: 0; bottom: 0; width: 360px; max-width: 95vw;
          background: #fff; border-left: 1px solid #e2e8f0; z-index: 51;
          transform: translateX(100%); transition: transform .3s cubic-bezier(.25,.8,.25,1);
          display: flex; flex-direction: column; box-shadow: -4px 0 24px rgba(0,0,0,.08);
        }
        .lt-dr.open { transform: none; }
        .lt-toast {
          display: flex; align-items: center; gap: 8px;
          background: #fff; color: #0f172a; font-size: 13px; font-weight: 500;
          padding: 10px 14px; border-radius: 10px; border: 1px solid #e2e8f0;
          box-shadow: 0 8px 24px rgba(0,0,0,.12);
          animation: ltin .25s cubic-bezier(.34,1.56,.64,1) both; max-width: 280px;
        }
        @keyframes ltin { from { opacity: 0; transform: translateX(16px) scale(.95); } to { opacity: 1; transform: none; } }
        .lt-fab-item {
          display: flex; align-items: center; gap: 8px;
          background: #fff; border: 1px solid #e2e8f0;
          color: #0f172a; font-size: 12.5px; font-weight: 500;
          padding: 8px 14px 8px 10px; border-radius: 24px; cursor: pointer;
          transition: all .18s; box-shadow: 0 4px 16px rgba(0,0,0,.1);
          white-space: nowrap; font-family: inherit;
        }
        .lt-fab-item:hover { border-color: #06402B; color: #06402B; transform: translateX(-3px); }
        .lt-inv-item {
          border-radius: 10px; border: 1px solid #e5e7eb;
          margin-bottom: 6px; overflow: hidden; transition: all .15s; background: #fff;
        }
        .lt-inv-item:last-child { margin-bottom: 0; }
        .lt-inv-item:hover { border-color: #06402B; }
        .lt-inv-item.open { border-color: #06402B; }
        .lt-inv-header {
          display: flex; align-items: center; gap: 10px; padding: 11px 14px;
          cursor: pointer; transition: background .15s;
        }
        .lt-inv-header:hover { background: #f0fdf4; }
        .lt-inv-body { display: none; padding: 0 14px 12px; border-top: 1px solid #e5e7eb; }
        .lt-inv-item.open .lt-inv-body { display: block; }
        .lt-stat-box {
          background: #f8fafc; border-radius: 8px; padding: 8px 10px; border: 1px solid #e5e7eb;
        }
        .lt-kpi {
          background: #fff; border-radius: 10px; border: 1px solid #e5e7eb;
          padding: 14px 16px; transition: all .2s; cursor: default;
        }
        .lt-kpi:hover { border-color: #06402B; box-shadow: 0 2px 8px rgba(6,64,43,.06); }
      `}</style>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
        {[
          { label: "Total Items", val: kpi.total, sub: "All categories", cls: "#0f172a" },
          { label: "Ready to Use", val: kpi.ready, sub: "Clean & available", cls: "#16a34a" },
          { label: "In Laundry", val: kpi.laundry, sub: "Currently washing", cls: "#d4a843" },
          { label: "Lost / Damaged", val: kpi.lost, sub: "Written off", cls: "#e05252" },
        ].map((k) => (
          <div key={k.label} className="lt-kpi">
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: "#64748b", marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 28, fontWeight: 700, color: k.cls, lineHeight: 1 }}>{k.val}</div>
            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
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
          {(chartTab === "status" ? [
            { label: "Ready to Use", val: kpi.ready, cls: "#16a34a" },
            { label: "In Laundry", val: kpi.laundry, cls: "#d4a843" },
            { label: "Lost / Damaged", val: kpi.lost, cls: "#e05252" },
          ] : invItems.map((c, i) => ({
            label: c.name,
            val: c.total,
            cls: ["#16a34a", "#d4a843", "#e05252", "#4a7fcb", "#06402B", "#d4a843"][i % 6],
          }))).map((r) => (
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

      {/* Bottom Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 14 }}>
        {/* Inventory */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <div style={{
            padding: "12px 14px 10px", borderBottom: "1px solid #e5e7eb",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#06402B" }}>Inventory</span>
            <button onClick={() => openDr("add")} style={{
              ...btnBase, background: "#06402B", color: "#fff",
            }}><i className="ti ti-plus" style={{ fontSize: 14 }} /> Add Stock</button>
          </div>
          <div style={{ padding: 10 }}>
            {invItems.map((item) => {
              const id = "linv_" + item.name.replace(/\s/g, "_");
              return (
                <div key={item.name} className="lt-inv-item" id={id}>
                  <div className="lt-inv-header" onClick={() => {
                    const el = document.getElementById(id);
                    el.classList.toggle("open");
                  }}>
                    <i className={`ti ti-${item.icon}`} style={{ fontSize: 16, color: "#06402B", width: 20, textAlign: "center", flexShrink: 0 }} />
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: "#0f172a", flex: 1 }}>{item.name}</span>
                    <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "#06402B", fontWeight: 600 }}>{item.total}</span>
                    <i className="ti ti-chevron-right" style={{ fontSize: 12, color: "#94a3b8", transition: "transform .2s" }} />
                  </div>
                  <div className="lt-inv-body">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, margin: "10px 0 8px" }}>
                      {[
                        { label: "Ready", val: item.clean, cls: "#16a34a" },
                        { label: "Laundry", val: item.atLaundry, cls: "#d4a843" },
                        { label: "Lost", val: item.lost, cls: "#e05252" },
                      ].map((f) => (
                        <div key={f.label} className="lt-stat-box">
                          <div style={{ fontSize: 9.5, color: "#64748b", letterSpacing: ".06em", textTransform: "uppercase", fontWeight: 500, marginBottom: 3 }}>{f.label}</div>
                          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 16, fontWeight: 500, color: f.cls }}>{f.val}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      <button onClick={() => openDr("send", item.name)} style={{ ...btnBase, background: "#06402B", color: "#fff" }}>
                        <i className="ti ti-send" style={{ fontSize: 12 }} /> Send
                      </button>
                      <button onClick={() => openDr("return", item.name)} style={{ ...btnBase, background: "#f0fdf4", color: "#06402B", border: "1px solid #06402B", padding: "5px 11px" }}>
                        <i className="ti ti-arrow-back-up" style={{ fontSize: 12 }} /> Return
                      </button>
                      <button onClick={() => openDr("adjust", item.name)} style={{ ...btnBase, background: "#f8fafc", color: "#64748b" }}>
                        <i className="ti ti-adjustments" style={{ fontSize: 12 }} /> Adjust
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <div style={{
            padding: "12px 14px 10px", borderBottom: "1px solid #e5e7eb",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#06402B" }}>Activity</span>
          </div>
          <div style={{ padding: "10px 14px", maxHeight: 380, overflowY: "auto" }}>
            {activity.length === 0 ? (
              <div style={{ textAlign: "center", padding: 20, color: "#94a3b8", fontSize: 12 }}>No activity yet.</div>
            ) : (() => {
              const groups = {};
              activity.forEach((a) => {
                const g = a.time || "Today";
                if (!groups[g]) groups[g] = [];
                groups[g].push(a);
              });
              const clsMap = { up: "#16a34a", down: "#4a7fcb", warn: "#d4a843", add: "#16a34a" };
              const bgMap = { up: "#f0fdf4", down: "#eff6ff", warn: "#fefce8", add: "#f0fdf4" };
              return Object.entries(groups).map(([date, items]) => (
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
              ));
            })()}
          </div>
        </div>
      </div>

      {/* FAB */}
      <div style={{ position: "fixed", bottom: 80, right: 24, zIndex: 40, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
        <div style={{
          display: "flex", flexDirection: "column", gap: 5, alignItems: "flex-end",
          transition: "opacity .25s,transform .25s", opacity: fabOpen ? 1 : 0,
          pointerEvents: fabOpen ? "all" : "none", transform: fabOpen ? "none" : "translateY(10px)",
        }}>
          {[
            { label: "Send to Laundry", icon: "send", cls: "#d4a843", type: "send" },
            { label: "Return from Laundry", icon: "arrow-back-up", cls: "#4a7fcb", type: "return" },
            { label: "Add Stock", icon: "plus", cls: "#16a34a", type: "add" },
            { label: "Adjust Stock", icon: "adjustments", cls: "#e05252", type: "adjust" },
          ].map((f) => (
            <button key={f.type} className="lt-fab-item" onClick={() => openDr(f.type)}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%", display: "flex",
                alignItems: "center", justifyContent: "center",
                background: f.cls + "18", color: f.cls,
              }}><i className={`ti ti-${f.icon}`} style={{ fontSize: 12 }} /></div>
              {f.label}
            </button>
          ))}
        </div>
        <button onClick={toggleFab} style={{
          width: 48, height: 48, borderRadius: "50%", background: "#06402B", border: "none",
          cursor: "pointer", color: "#fff", fontSize: 22, display: "flex", alignItems: "center",
          justifyContent: "center", boxShadow: "0 6px 20px rgba(6,64,43,.3)",
          transition: "transform .25s cubic-bezier(.34,1.56,.64,1)",
          transform: fabOpen ? "rotate(45deg)" : "none",
        }}><i className="ti ti-plus" style={{ fontSize: 20 }} /></button>
      </div>

      {/* Drawer Overlay */}
      <div className={`lt-dr-overlay${drawer ? " open" : ""}`} onClick={closeDr} />

      {/* Drawer */}
      <div className={`lt-dr${drawer ? " open" : ""}`}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 18px 14px", borderBottom: "1px solid #e2e8f0", flexShrink: 0,
        }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#06402B" }}>
            {drawer === "send" ? "Send to Laundry" :
             drawer === "return" ? "Return from Laundry" :
             drawer === "add" ? "Add Stock" :
             drawer === "adjust" ? "Adjust Stock" : "Action"}
          </span>
          <button onClick={closeDr} style={{
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
          <button onClick={() => {
            if (drawer === "send") doSend();
            else if (drawer === "return") doReturn();
            else if (drawer === "add") doAdd();
            else if (drawer === "adjust") doAdjust();
          }} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            width: "100%", padding: "10px 16px", borderRadius: 8,
            fontSize: 12.5, fontWeight: 600, fontFamily: "inherit",
            border: "none", cursor: "pointer", color: "#fff",
            background: drawer === "send" ? "#d4a843" :
                        drawer === "return" ? "#4a7fcb" :
                        drawer === "add" ? "#16a34a" :
                        "#e05252",
          }}>
            <i className={`ti ti-${drawer === "send" ? "send" : drawer === "return" ? "arrow-back-up" : drawer === "add" ? "plus" : "adjustments"}`} style={{ fontSize: 14 }} />
            {drawer === "send" ? "Confirm Send" :
             drawer === "return" ? "Confirm Return" :
             drawer === "add" ? "Confirm Add" :
             "Apply Adjustment"}
          </button>
        </div>
      </div>

      {/* Toast Container */}
      <div style={{ position: "fixed", bottom: 80, right: 24, zIndex: 60, display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
        {toasts.map((t) => (
          <div key={t.id} className="lt-toast">
            <div style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
              background: t.type === "green" ? "#16a34a" : t.type === "amber" ? "#d4a843" : "#e05252",
            }} />
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}

function Stepper({ label, val, min = 0, set }) {
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

function InputField({ label, val, set, placeholder, type = "text" }) {
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
