import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const C = {
  emerald: "#06402B",
  emeraldLight: "#0a6a42",
  emeraldDark: "#042a1d",
  emeraldBg: "#e8f2ea",
  emeraldBgLight: "#cde2d5",
  warmWhite: "#ffffff",
  bg: "#f7f8fb",
  bark: "#0f172a",
  text: "#334155",
  muted: "#94a3b8",
  mid: "#64748b",
  border: "#e2e8f0",
  red: "#ef4444",
  amber: "#f59e0b",
  blue: "#3b82f6",
  purple: "#8b5cf6",
};

function now() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfWeek(d) {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.getFullYear(), d.getMonth(), diff);
}

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfYear(d) {
  return new Date(d.getFullYear(), 0, 1);
}

function toDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

  function formatCurrency(n) {
    return "₹" + Math.round(n).toLocaleString("en-IN");
  }

  function distributePaidRevenue(bookings, start, end, rooms) {
    let rev = 0;
    for (const b of bookings) {
      if (b.paymentStatus !== "paid" && b.paymentStatus !== "manual") continue;
      const ci = new Date(b.checkIn + "T00:00:00").getTime();
      const co = new Date(b.checkOut + "T00:00:00").getTime();
      const os = Math.max(ci, start);
      const oe = Math.min(co, end);
      if (os >= oe) continue;
      const nights = Math.ceil((oe - os) / 86400000);
      const room = rooms.find((r) => r.id === b.roomId);
      rev += nights * (room?.basePrice || 0);
    }
    return rev;
  }

  function countNights(bookings, start, end) {
    let total = 0;
    for (const b of bookings) {
      const ci = new Date(b.checkIn + "T00:00:00").getTime();
      const co = new Date(b.checkOut + "T00:00:00").getTime();
      const os = Math.max(ci, start);
      const oe = Math.min(co, end);
      if (os >= oe) continue;
      total += Math.ceil((oe - os) / 86400000);
    }
    return total;
  }

export default function AdminDashboard({ bookings, rooms }) {
  const [range, setRange] = useState("month");
  const roomRef = useRef(null);
  const revVsRef = useRef(null);
  const roomChart = useRef(null);
  const revVsChart = useRef(null);

  const today = useMemo(() => now(), []);
  const rangeStart = useMemo(() => range === "week" ? startOfWeek(today) : range === "month" ? startOfMonth(today) : startOfYear(today), [range, today]);
  const daysInRange = useMemo(() => range === "week" ? 7 : range === "month" ? new Date(rangeStart.getFullYear(), rangeStart.getMonth() + 1, 0).getDate() : 365, [range, rangeStart]);
  const rangeEnd = useMemo(() => {
    if (range === "week") {
      const e = new Date(rangeStart);
      e.setDate(e.getDate() + 6);
      return e;
    } else if (range === "month") {
      return new Date(rangeStart.getFullYear(), rangeStart.getMonth() + 1, 0);
    }
    return new Date(rangeStart.getFullYear(), 11, 31);
  }, [range, rangeStart]);

  const prevStart = useMemo(() => new Date(rangeStart.getTime() - (rangeEnd.getTime() - rangeStart.getTime()) - 86400000), [rangeStart, rangeEnd]);
  const prevEnd = useMemo(() => new Date(rangeStart.getTime() - 86400000), [rangeStart]);

  const roomCount = 1; // entire property is locked when ANY booking exists

  const filt = useMemo(() => {
    const sk = toDateKey(rangeStart), ek = toDateKey(rangeEnd);
    return (bookings || []).filter((b) => b.status === "confirmed" && b.checkIn <= ek && b.checkOut >= sk);
  }, [bookings, rangeStart, rangeEnd]);

  const prev = useMemo(() => {
    const sk = toDateKey(prevStart), ek = toDateKey(prevEnd);
    return (bookings || []).filter((b) => b.status === "confirmed" && b.checkIn <= ek && b.checkOut >= sk);
  }, [bookings, prevStart, prevEnd]);

  const bookingRevenue = useCallback((b) => {
    const ci = new Date(b.checkIn + "T00:00:00"), co = new Date(b.checkOut + "T00:00:00");
    const nights = Math.max(1, Math.ceil((co - ci) / 86400000));
    const room = rooms.find((r) => r.id === b.roomId);
    return (room?.basePrice || 0) * nights;
  }, [rooms]);

  function calc(revFn, list) {
    let rev = 0, cnt = 0, nights = 0, guests = 0;
    for (const b of list) {
      cnt++;
      const ci = new Date(b.checkIn + "T00:00:00"), co = new Date(b.checkOut + "T00:00:00");
      nights += Math.max(1, Math.ceil((co - ci) / 86400000));
      guests += parseInt(b.guests) || 0;
      if (b.paymentStatus === "paid" || b.paymentStatus === "manual") rev += revFn(b);
    }
    return { rev, cnt, nights, guests };
  }

  const s = useMemo(() => calc(bookingRevenue, filt), [bookingRevenue, filt]);
  const ps = useMemo(() => calc(bookingRevenue, prev), [bookingRevenue, prev]);
  const avg = s.cnt ? s.nights / s.cnt : 0;
  const pAvg = ps.cnt ? ps.nights / ps.cnt : 0;
  const maxNights = roomCount * daysInRange;
  const occ = maxNights ? Math.min(100, Math.round(s.nights / maxNights * 100)) : 0;
  const pOcc = maxNights ? Math.min(100, Math.round(ps.nights / (roomCount * (prevEnd.getTime() - prevStart.getTime()) / 86400000) * 100)) : 0;

  function tr(c, p) {
    if (p === 0 && c > 0) return "▲";
    if (p === 0) return "–";
    const pct = Math.round((c - p) / p * 100);
    if (pct > 0) return `▲ +${pct}%`;
    if (pct < 0) return `▼ ${pct}%`;
    return "– 0%";
  }

  const metrics = [
    { label: "Revenue", value: formatCurrency(s.rev), trend: tr(s.rev, ps.rev) },
    { label: "Bookings", value: String(s.cnt), trend: tr(s.cnt, ps.cnt) },
    { label: "Occupancy", value: occ + "%", trend: tr(occ, pOcc) },
    { label: "Avg nights", value: avg.toFixed(1), trend: tr(avg, pAvg) },
    { label: "Total guests", value: String(s.guests), trend: tr(s.guests, ps.guests) },
  ];

  const statusCards = [
    { label: "Confirmed", count: (bookings || []).filter((b) => b.status === "confirmed").length, bg: C.emeraldBg, color: C.emeraldDark },
    { label: "Pending", count: (bookings || []).filter((b) => b.status === "pending" || b.status === "unpaid").length, bg: "#fffbeb", color: "#92400e" },
    { label: "Checked in", count: (bookings || []).filter((b) => b.status === "confirmed" && b.checkIn <= toDateKey(today) && b.checkOut > toDateKey(today)).length, bg: "#eff6ff", color: "#1e40af" },
    { label: "Cancelled", count: (bookings || []).filter((b) => b.status === "cancelled").length, bg: "#fef2f2", color: "#991b1b" },
    { label: "Checkout today", count: (bookings || []).filter((b) => b.status === "confirmed" && b.checkOut === toDateKey(today)).length, bg: "#faf5ff", color: "#6b21a8" },
  ];

  const labels = useMemo(() => range === "week" ? ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] : range === "month" ? ["Wk1","Wk2","Wk3","Wk4","Wk5"] : ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"], [range]);

  const revData = useMemo(() => {
    const buckets = labels.map((_, i) => {
      if (range === "week") {
        const s = rangeStart.getTime() + i * 86400000;
        return { s, e: s + 86400000 };
      }
      if (range === "month") {
        const ws = i * 7, we = Math.min(ws + 6, daysInRange - 1);
        const s = rangeStart.getTime() + ws * 86400000;
        const e = rangeStart.getTime() + (we + 1) * 86400000;
        return { s, e };
      }
      const ms = new Date(rangeStart.getFullYear(), i, 1);
      const me = new Date(rangeStart.getFullYear(), i + 1, 0);
      return { s: ms.getTime(), e: me.getTime() + 86400000 };
    });
    return buckets.map((b) => distributePaidRevenue(filt, b.s, b.e, rooms));
  }, [filt, labels, rangeStart, range, daysInRange, rooms]);

  const bkgData = useMemo(() => {
    const buckets = labels.map((_, i) => {
      if (range === "week") {
        const s = rangeStart.getTime() + i * 86400000;
        return { s, e: s + 86400000 };
      }
      if (range === "month") {
        const ws = i * 7, we = Math.min(ws + 6, daysInRange - 1);
        const s = rangeStart.getTime() + ws * 86400000;
        const e = rangeStart.getTime() + (we + 1) * 86400000;
        return { s, e };
      }
      const ms = new Date(rangeStart.getFullYear(), i, 1);
      const me = new Date(rangeStart.getFullYear(), i + 1, 0);
      return { s: ms.getTime(), e: me.getTime() + 86400000 };
    });
    return buckets.map((b) => countNights(filt, b.s, b.e));
  }, [filt, labels, rangeStart, range, daysInRange]);

  const rLabels = useMemo(() => (rooms || []).map((r) => r.name), [rooms]);
  const rColors = useMemo(() => [C.emerald, C.emeraldLight, C.blue, C.amber], []);
  const rPcts = useMemo(() => {
    const nightsPerRoom = new Map((rooms || []).map((r) => [r.name, 0]));
    for (const b of filt) {
      const name = b.roomName || "";
      if (!nightsPerRoom.has(name)) continue;
      const ci = new Date(b.checkIn + "T00:00:00"), co = new Date(b.checkOut + "T00:00:00");
      const n = Math.max(1, Math.ceil((co - ci) / 86400000));
      nightsPerRoom.set(name, nightsPerRoom.get(name) + n);
    }
    const t = [...nightsPerRoom.values()].reduce((a, b) => a + b, 0);
    return t ? [...nightsPerRoom.values()].map((v) => Math.round(v / t * 100)) : (rooms || []).map(() => Math.round(100 / (rooms.length || 1)));
  }, [filt, rooms]);

  const occDays = useMemo(() => {
    const dayIdx = [0, 0, 0, 0, 0, 0, 0]; // Mon=0 … Sun=6 — total dates per weekday
    const occIdx = [0, 0, 0, 0, 0, 0, 0];
    const activeBookings = (bookings || []).filter((b) => b.status === "confirmed");
    for (let i = 0; i < daysInRange; i++) {
      const d = new Date(rangeStart.getTime() + i * 86400000);
      const key = toDateKey(d);
      const dow = d.getDay(); // 0=Sun … 6=Sat
      const idx = dow === 0 ? 6 : dow - 1; // map to Mon=0 … Sun=6
      dayIdx[idx]++;
      for (const b of activeBookings) {
        if (b.checkIn <= key && b.checkOut > key) { occIdx[idx]++; break; }
      }
    }
    return dayIdx.map((total, i) => total ? Math.round(occIdx[i] / total * 100) : 0);
  }, [bookings, daysInRange, rangeStart]);

  useEffect(() => {
    if (!roomRef.current) return;
    if (roomChart.current) roomChart.current.destroy();
    const ctx = roomRef.current.getContext("2d");
    roomChart.current = new Chart(ctx, {
      type: "doughnut",
      data: { labels: rLabels, datasets: [{ data: rPcts, backgroundColor: rColors, borderWidth: 0 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: "70%",
        plugins: { legend: { display: false } },
      },
    });
    return () => roomChart.current?.destroy();
  }, [rPcts, rLabels, rColors]);

  useEffect(() => {
    if (!revVsRef.current) return;
    if (revVsChart.current) revVsChart.current.destroy();
    const ctx = revVsRef.current.getContext("2d");
    revVsChart.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Revenue", data: revData, backgroundColor: C.emerald, borderRadius: 3, barPercentage: 0.6, yAxisID: "y" },
          { label: "Bookings", data: bkgData, type: "line", borderColor: C.amber, borderDash: [4,3], borderWidth: 2, pointBackgroundColor: C.amber, pointRadius: 3, fill: false, yAxisID: "y1" },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, position: "left", border: { display: false }, grid: { color: "#f1f5f9" }, ticks: { callback: (v) => "₹" + Math.round(v / 1000) + "k", font: { size: 11 } } },
          y1: { beginAtZero: true, position: "right", grid: { drawOnChartArea: false }, border: { display: false }, ticks: { font: { size: 11 } } },
          x: { border: { display: false }, grid: { display: false }, ticks: { font: { size: 11 } } },
        },
      },
    });
    return () => revVsChart.current?.destroy();
  }, [revData, bkgData, labels]);

  return (
    <div className="dash-wrap" style={{ fontFamily: "'DM Sans', Inter, Arial, sans-serif", color: C.bark, width: "100%", padding: "24px 20px" }}>

      <div className="dash-range" style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["week","month","year"].map((r) => (
          <button key={r} onClick={() => setRange(r)} style={{
            padding: "8px 20px", borderRadius: 6, fontWeight: 500, fontSize: 13, fontFamily: "inherit", cursor: "pointer", border: "none", minHeight: 40,
            background: range === r ? C.emerald : C.bg, color: range === r ? "#fff" : C.mid,
          }}>This {r.charAt(0).toUpperCase() + r.slice(1)}</button>
        ))}
      </div>

      <div className="dash-metrics" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 20 }}>
        {metrics.map((m) => (
          <div key={m.label} className="dash-metric-card" style={{ background: C.bg, borderRadius: 8, padding: "14px 14px 12px" }}>
            <div className="dash-metric-label" style={{ fontSize: 12, color: C.mid, marginBottom: 2 }}>{m.label}</div>
            <div className="dash-metric-value" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.2, marginBottom: 6 }}>{m.value}</div>
            <div style={{ fontSize: 11, color: m.trend.includes("▲") ? C.emerald : m.trend.includes("▼") ? C.red : C.mid }}>{m.trend}</div>
          </div>
        ))}
      </div>

      <div className="dash-status" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 24 }}>
        {statusCards.map((c) => (
          <div key={c.label} className="dash-status-card" style={{ background: c.bg, borderRadius: 8, padding: "10px 14px" }}>
            <div className="dash-status-count" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.2, color: c.color }}>{c.count}</div>
            <div className="dash-status-label" style={{ fontSize: 12, color: c.color, opacity: 0.8 }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div className="dash-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="dash-chart" style={{ background: C.warmWhite, border: "1px solid " + C.border, borderRadius: 10, padding: "16px 16px 8px" }}>
          <h3 className="dash-chart-title" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 20, margin: "0 0 8px", color: C.bark }}>Bookings by room</h3>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
            {rLabels.map((l, i) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.mid }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: rColors[i], flexShrink: 0 }} />
                {l} {rPcts[i]}%
              </div>
            ))}
          </div>
          <div style={{ position: "relative", height: 190 }}><canvas ref={roomRef} style={{ width: "100%", height: "100%" }} /></div>
        </div>

        <div className="dash-chart" style={{ background: C.warmWhite, border: "1px solid " + C.border, borderRadius: 10, padding: "16px 16px 8px" }}>
          <h3 className="dash-chart-title" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 20, margin: "0 0 12px", color: C.bark }}>Occupancy by day</h3>
          {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, i) => {
            const pct = occDays[i];
            return (
              <div key={d} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                <span style={{ width: 28, fontSize: 12, color: C.mid, flexShrink: 0 }}>{d}</span>
                <div style={{ flex: 1, height: 16, background: C.bg, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: pct + "%", height: "100%", background: pct >= 80 ? C.emerald : pct >= 50 ? C.emeraldLight : "#cde2d5", borderRadius: 3, transition: "width 0.3s" }} />
                </div>
                <span style={{ width: 34, fontSize: 12, fontWeight: 500, textAlign: "right" }}>{pct}%</span>
              </div>
            );
          })}
        </div>

        <div className="dash-chart dash-full" style={{ gridColumn: "1 / -1", background: C.warmWhite, border: "1px solid " + C.border, borderRadius: 10, padding: "16px 16px 8px" }}>
          <h3 className="dash-chart-title" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 20, margin: "0 0 8px", color: C.bark }}>Revenue vs bookings</h3>
          <div style={{ position: "relative", height: 240 }}><canvas ref={revVsRef} style={{ width: "100%", height: "100%" }} /></div>
        </div>
      </div>
    </div>
  );
}
