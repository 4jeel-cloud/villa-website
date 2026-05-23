import { useEffect, useMemo, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const C = {
  emerald: "#059669",
  emeraldLight: "#10b981",
  emeraldDark: "#065f46",
  emeraldBg: "#ecfdf5",
  emeraldBgLight: "#d1fae5",
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

export default function AdminDashboard({ bookings }) {
  const [range, setRange] = useState("month");
  const revRef = useRef(null);
  const roomRef = useRef(null);
  const revVsRef = useRef(null);
  const revChart = useRef(null);
  const roomChart = useRef(null);
  const revVsChart = useRef(null);

  const today = now();
  const rangeStart = range === "week" ? startOfWeek(today) : range === "month" ? startOfMonth(today) : startOfYear(today);
  let rangeEnd;
  if (range === "week") {
    rangeEnd = new Date(rangeStart);
    rangeEnd.setDate(rangeEnd.getDate() + 6);
  } else if (range === "month") {
    rangeEnd = new Date(rangeStart.getFullYear(), rangeStart.getMonth() + 1, 0);
  } else {
    rangeEnd = new Date(rangeStart.getFullYear(), 11, 31);
  }

  const prevStart = new Date(rangeStart.getTime() - (rangeEnd.getTime() - rangeStart.getTime()) - 86400000);
  const prevEnd = new Date(rangeStart.getTime() - 86400000);

  const filt = useMemo(() => {
    const sk = toDateKey(rangeStart), ek = toDateKey(rangeEnd);
    return (bookings || []).filter((b) => b.status === "confirmed" && b.checkIn <= ek && b.checkOut >= sk);
  }, [bookings, rangeStart, rangeEnd]);

  const prev = useMemo(() => {
    const sk = toDateKey(prevStart), ek = toDateKey(prevEnd);
    return (bookings || []).filter((b) => b.status === "confirmed" && b.checkIn <= ek && b.checkOut >= sk);
  }, [bookings, prevStart, prevEnd]);

  function calc(list) {
    let rev = 0, cnt = 0, nights = 0, guests = 0;
    for (const b of list) {
      cnt++;
      const ci = new Date(b.checkIn + "T00:00:00"), co = new Date(b.checkOut + "T00:00:00");
      nights += Math.max(1, Math.ceil((co - ci) / 86400000));
      guests += parseInt(b.guests) || 0;
      if (b.paymentStatus === "paid" || b.paymentStatus === "manual") rev += parseFloat(b.amount) || 0;
    }
    return { rev, cnt, nights, guests };
  }

  const s = calc(filt), ps = calc(prev);
  const avg = s.cnt ? s.nights / s.cnt : 0;
  const pAvg = ps.cnt ? ps.nights / ps.cnt : 0;
  const occ = s.nights ? Math.min(100, Math.round(s.nights / (range === "week" ? 14 : range === "month" ? 60 : 730) * 100)) : 0;
  const pOcc = ps.nights ? Math.min(100, Math.round(ps.nights / (range === "week" ? 14 : range === "month" ? 60 : 730) * 100)) : 0;

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

  const labels = range === "week" ? ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] : range === "month" ? ["Wk1","Wk2","Wk3","Wk4","Wk5"] : ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const revData = useMemo(() => labels.map((_, i) => {
    let start, end;
    if (range === "week") {
      start = new Date(rangeStart.getTime() + i * 86400000);
      end = new Date(start);
      end.setDate(end.getDate() + 1);
    } else if (range === "month") {
      start = new Date(rangeStart.getTime() + i * 7 * 86400000);
      end = new Date(start);
      end.setDate(end.getDate() + 6);
    } else {
      start = new Date(rangeStart.getFullYear(), i, 1);
      end = new Date(rangeStart.getFullYear(), i + 1, 0);
    }
    const sk = toDateKey(start), ek = toDateKey(end);
    return filt.filter((b) => b.checkIn <= ek && b.checkOut >= sk).reduce((acc, b) => acc + (parseFloat(b.amount) || 0), 0);
  }), [filt, labels, rangeStart, range]);

  const bkgData = useMemo(() => labels.map((_, i) => {
    let start, end;
    if (range === "week") {
      start = new Date(rangeStart.getTime() + i * 86400000);
      end = new Date(start);
      end.setDate(end.getDate() + 1);
    } else if (range === "month") {
      start = new Date(rangeStart.getTime() + i * 7 * 86400000);
      end = new Date(start);
      end.setDate(end.getDate() + 6);
    } else {
      start = new Date(rangeStart.getFullYear(), i, 1);
      end = new Date(rangeStart.getFullYear(), i + 1, 0);
    }
    const sk = toDateKey(start), ek = toDateKey(end);
    return filt.filter((b) => b.checkIn <= ek && b.checkOut >= sk).length;
  }), [filt, labels, rangeStart, range]);

  const rLabels = ["Standard Room","Deluxe Room","Family Room","Entire Homestay"];
  const rColors = [C.emerald, C.emeraldLight, C.blue, C.purple];
  const rPcts = useMemo(() => {
    const c = [0,0,0,0];
    for (const b of filt) {
      const idx = rLabels.findIndex((r) => b.roomName?.includes(r.split(" ")[0]));
      if (idx >= 0) c[idx]++; else c[0]++;
    }
    const t = c.reduce((a, b) => a + b, 0);
    return t ? c.map((v) => Math.round(v / t * 100)) : [25, 35, 22, 18];
  }, [filt]);

  const occDays = useMemo(() => {
    const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
    return days.map((_, di) => {
      const d = toDateKey(new Date(rangeStart.getTime() + di * 86400000));
      const occupied = filt.filter((b) => b.checkIn <= d && b.checkOut > d).length;
      return Math.min(100, Math.round(occupied / 2 * 100));
    });
  }, [filt, rangeStart]);

  useEffect(() => {
    if (!revRef.current) return;
    if (revChart.current) revChart.current.destroy();
    const ctx = revRef.current.getContext("2d");
    revChart.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Revenue",
            data: revData,
            backgroundColor: C.emerald,
            borderRadius: 3,
            barPercentage: 0.6,
          },
          {
            label: "Target",
            data: revData.map(() => 45000),
            type: "line",
            borderColor: C.emeraldLight,
            borderDash: [5, 4],
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, border: { display: false }, grid: { color: "#f1f5f9" }, ticks: { callback: (v) => "₹" + Math.round(v / 1000) + "k", font: { size: 11 } } },
          x: { border: { display: false }, grid: { display: false }, ticks: { font: { size: 11 } } },
        },
      },
    });
    return () => revChart.current?.destroy();
  }, [revData, labels]);

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
  }, [rPcts]);

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
    <div style={{ fontFamily: "'DM Sans', Inter, Arial, sans-serif", color: C.bark, maxWidth: 1100, margin: "0 auto", padding: "24px 0" }}>
      <style>{`
        @media (max-width: 700px) {
          .dash-grid { grid-template-columns: 1fr !important; }
          .dash-full { grid-column: 1 !important; }
          .dash-metrics { grid-template-columns: repeat(2, 1fr) !important; }
          .dash-status { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["week","month","year"].map((r) => (
          <button key={r} onClick={() => setRange(r)} style={{
            padding: "8px 20px", borderRadius: 6, fontWeight: 500, fontSize: 13, fontFamily: "inherit", cursor: "pointer", border: "none", minHeight: 40,
            background: range === r ? C.emerald : C.bg, color: range === r ? "#fff" : C.mid,
          }}>This {r.charAt(0).toUpperCase() + r.slice(1)}</button>
        ))}
      </div>

      <div className="dash-metrics" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 20 }}>
        {metrics.map((m) => (
          <div key={m.label} style={{ background: C.bg, borderRadius: 8, padding: "14px 14px 12px" }}>
            <div style={{ fontSize: 12, color: C.mid, marginBottom: 2 }}>{m.label}</div>
            <div style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.2, marginBottom: 6 }}>{m.value}</div>
            <div style={{ fontSize: 11, color: m.trend.includes("▲") ? C.emerald : m.trend.includes("▼") ? C.red : C.mid }}>{m.trend}</div>
          </div>
        ))}
      </div>

      <div className="dash-status" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 24 }}>
        {statusCards.map((c) => (
          <div key={c.label} style={{ background: c.bg, borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.2, color: c.color }}>{c.count}</div>
            <div style={{ fontSize: 12, color: c.color, opacity: 0.8 }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div className="dash-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="dash-full" style={{ gridColumn: "1 / -1", background: C.warmWhite, border: "1px solid " + C.border, borderRadius: 10, padding: "16px 16px 8px" }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 20, margin: "0 0 8px", color: C.bark }}>Revenue over time</h3>
          <canvas ref={revRef} style={{ width: "100%", height: 240 }} />
        </div>

        <div style={{ background: C.warmWhite, border: "1px solid " + C.border, borderRadius: 10, padding: "16px 16px 8px" }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 20, margin: "0 0 8px", color: C.bark }}>Bookings by room</h3>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
            {rLabels.map((l, i) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.mid }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: rColors[i], flexShrink: 0 }} />
                {l} {rPcts[i]}%
              </div>
            ))}
          </div>
          <canvas ref={roomRef} style={{ width: "100%", height: 190 }} />
        </div>

        <div style={{ background: C.warmWhite, border: "1px solid " + C.border, borderRadius: 10, padding: "16px 16px 8px" }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 20, margin: "0 0 12px", color: C.bark }}>Occupancy by day</h3>
          {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, i) => {
            const pct = occDays[i];
            return (
              <div key={d} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                <span style={{ width: 28, fontSize: 12, color: C.mid, flexShrink: 0 }}>{d}</span>
                <div style={{ flex: 1, height: 16, background: C.bg, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: pct + "%", height: "100%", background: pct >= 80 ? C.emerald : pct >= 50 ? C.emeraldLight : "#d1fae5", borderRadius: 3, transition: "width 0.3s" }} />
                </div>
                <span style={{ width: 34, fontSize: 12, fontWeight: 500, textAlign: "right" }}>{pct}%</span>
              </div>
            );
          })}
        </div>

        <div className="dash-full" style={{ gridColumn: "1 / -1", background: C.warmWhite, border: "1px solid " + C.border, borderRadius: 10, padding: "16px 16px 8px" }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 20, margin: "0 0 8px", color: C.bark }}>Revenue vs bookings</h3>
          <canvas ref={revVsRef} style={{ width: "100%", height: 240 }} />
        </div>
      </div>
    </div>
  );
}
