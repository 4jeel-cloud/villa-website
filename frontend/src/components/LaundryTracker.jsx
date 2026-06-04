import { useState, useEffect, useRef, useMemo } from "react";
import { loadLaundryData, saveLaundryData } from "../laundryDb";
import { CATEGORIES, INITIAL_STOCK, computeTotals } from "./laundry/constants";
import LaundryKPICards from "./laundry/LaundryKPICards";
import InventoryChart from "./laundry/InventoryChart";
import InventoryList from "./laundry/InventoryList";
import ActivityFeed from "./laundry/ActivityFeed";
import LaundryFab from "./laundry/LaundryFab";
import LaundryDrawer from "./laundry/LaundryDrawer";
import LaundryToast from "./laundry/LaundryToast";

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
  const [isLoaded, setIsLoaded] = useState(false);
  const loadedData = useRef(false);
  const dataReady = useRef(false);

  useEffect(() => {
    if (loadedData.current) return;
    loadedData.current = true;
    loadLaundryData().then((res) => {
      if (res.data) {
        const d = res.data;
        let s = d.stock || {};
        if (Array.isArray(s)) {
          const converted = { ...INITIAL_STOCK };
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
        dataReady.current = true;
      } else if (res.empty) {
        // First time — document doesn't exist yet. Use defaults and enable saving.
        setStock({ ...INITIAL_STOCK });
        dataReady.current = true;
      } else {
        // Read error — don't overwrite Firestore. User edits will enable saving.
      }
      setIsLoaded(true);
    });
  }, []);

  const saveTimer = useRef(null);
  useEffect(() => {
    if (!isLoaded || !dataReady.current) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveLaundryData(stock, [], activity), 500);
  }, [stock, activity, isLoaded]);

  useEffect(() => {
    const h = () => {
      clearTimeout(saveTimer.current);
      if (dataReady.current) {
        saveLaundryData(stock, [], activity);
      }
    };
    window.addEventListener("beforeunload", h);
    return () => { window.removeEventListener("beforeunload", h); clearTimeout(saveTimer.current); };
  }, [stock, activity]);

  const kpi = useMemo(() => computeTotals(stock), [stock]);

  function addAct(type, text) {
    setActivity((prev) => [{ type, text, time: "Today", ts: Date.now() }, ...prev].slice(0, 50));
  }

  function toast(msg, type) {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg, type: type || "green" }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2600);
  }

  function openDrawer(type, cat) {
    setDrawer(type);
    setDrawerCat(cat || CATEGORIES[0].name);
    setDrawerQty(1);
    setDrawerDmg(0);
    setDrawerReady("");
    setDrawerLaundry("");
    setDrawerLost("");
    setDrawerNotes("");
    setDrawerService("");
    setFabOpen(false);
  }

  function closeDrawer() { setDrawer(null); }

  function doSend() {
    dataReady.current = true;
    const s = { ...stock };
    const item = { ...(s[drawerCat] || { total: 0, clean: 0, atLaundry: 0, lost: 0 }) };
    const qty = drawerQty;
    if (qty > item.clean) { toast("Not enough ready items", "red"); return; }
    item.clean -= qty;
    item.atLaundry += qty;
    s[drawerCat] = item;
    setStock(s);
    addAct("up", `${qty} ${drawerCat} sent to laundry${drawerService ? " (" + drawerService + ")" : ""}`);
    closeDrawer();
    toast(`${qty} ${drawerCat} sent to laundry`, "amber");
  }

  function doReturn() {
    dataReady.current = true;
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
    closeDrawer();
    toast(`${qty} ${drawerCat} returned${dmg ? `, ${dmg} damaged` : ""}`, "green");
  }

  function doAdd() {
    dataReady.current = true;
    const s = { ...stock };
    const item = { ...(s[drawerCat] || { total: 0, clean: 0, atLaundry: 0, lost: 0 }) };
    const qty = drawerQty;
    item.total += qty;
    item.clean += qty;
    s[drawerCat] = item;
    setStock(s);
    addAct("add", `${qty} ${drawerCat} added to inventory`);
    closeDrawer();
    toast(`${qty} ${drawerCat} added`, "green");
  }

  function doAdjust() {
    dataReady.current = true;
    const s = { ...stock };
    const item = { ...(s[drawerCat] || { total: 0, clean: 0, atLaundry: 0, lost: 0 }) };
    if (drawerReady !== "") item.clean = parseInt(drawerReady) || 0;
    if (drawerLaundry !== "") item.atLaundry = parseInt(drawerLaundry) || 0;
    if (drawerLost !== "") item.lost = parseInt(drawerLost) || 0;
    item.total = item.clean + item.atLaundry + item.lost;
    s[drawerCat] = item;
    setStock(s);
    addAct("warn", `Stock adjusted: ${drawerCat}`);
    closeDrawer();
    toast(`${drawerCat} stock adjusted`, "amber");
  }

  function handleFabAction(type) {
    openDrawer(type);
  }

  function confirmDrawer() {
    if (drawer === "send") doSend();
    else if (drawer === "return") doReturn();
    else if (drawer === "add") doAdd();
    else if (drawer === "adjust") doAdjust();
  }

  return (
    <div>
      <LaundryKPICards kpi={kpi} />
      <InventoryChart kpi={kpi} stock={stock} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 14 }}>
        <InventoryList stock={stock} onOpenDrawer={openDrawer} />
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <div style={{
            padding: "12px 14px 10px", borderBottom: "1px solid #e5e7eb",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#06402B" }}>Activity</span>
          </div>
          <ActivityFeed activity={activity} />
        </div>
      </div>
      <LaundryFab fabOpen={fabOpen} onToggle={() => setFabOpen((o) => !o)} onAction={handleFabAction} />
      <LaundryDrawer
        drawer={drawer} onClose={closeDrawer}
        drawerCat={drawerCat} setDrawerCat={setDrawerCat}
        drawerQty={drawerQty} setDrawerQty={setDrawerQty}
        drawerDmg={drawerDmg} setDrawerDmg={setDrawerDmg}
        drawerReady={drawerReady} setDrawerReady={setDrawerReady}
        drawerLaundry={drawerLaundry} setDrawerLaundry={setDrawerLaundry}
        drawerLost={drawerLost} setDrawerLost={setDrawerLost}
        drawerNotes={drawerNotes} setDrawerNotes={setDrawerNotes}
        drawerService={drawerService} setDrawerService={setDrawerService}
        onConfirm={confirmDrawer}
      />
      <LaundryToast toasts={toasts} />
    </div>
  );
}
