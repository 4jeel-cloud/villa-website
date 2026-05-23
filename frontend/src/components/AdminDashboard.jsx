import { useEffect, useMemo, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const COLORS = {
  cream: "#F7F3EE",
  warmWhite: "#FDFAF7",
  bark: "#2C1F14",
  gold: "#B8935A",
  muted: "#9A8878",
  border: "#E2D9D0",
  blue: "#378ADD",
  green: "#1D9E75",
  amber: "#D97706",
  red: "#DC2626",
  purple: "#7C3AED",
  coral: "#D85A30",
  targetGreen: "#639922",
  lightBlue: "#B5D4F4",
};

function formatCurrency(n) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

function formatCurrencyShort(n) {
  if (n >= 100000) return "₹" + Math.round(n / 1000) + "k";
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

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

function prevPeriodStart(currentStart, range) {
  const diff = currentStart.getTime() - (range === "week"
    ? startOfWeek(now())
    : range === "month"
      ? startOfMonth(now())
      : startOfYear(now())).getTime();
  if (diff === 0) {
    if (range === "week") return new Date(currentStart.getTime() - 7 * 86400000);
    if (range === "month") {
      const m = new Date(currentStart);
      m.setMonth(m.getMonth() - 1);
      return m;
    }
    const y = new Date(currentStart);
    y.setFullYear(y.getFullYear() - 1);
    return y;
  }
  return currentStart;
}

function toDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function AdminDashboard({ bookings }) {
  const [range, setRange] = useState("month");
  const revChartRef = useRef(null);
  const revVsBookChartRef = useRef(null);
  const roomChartRef = useRef(null);
  const revInstances = useRef({});
  const roomInstances = useRef({});
  const revVsBookInstances = useRef({});

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

  const prevStart = prevPeriodStart(rangeStart, range);
  const prevEnd = new Date(rangeStart.getTime() - 86400000);

  const filteredBookings = useMemo(() => {
    const startKey = toDateKey(rangeStart);
    const endKey = toDateKey(rangeEnd);
    return (bookings || []).filter((b) => {
      if (b.status !== "confirmed") return false;
      return b.checkIn <= endKey && b.checkOut >= startKey;
    });
  }, [bookings, range, rangeStart, rangeEnd]);

  const prevBookings = useMemo(() => {
    const startKey = toDateKey(prevStart);
    const endKey = toDateKey(prevEnd);
    return (bookings || []).filter((b) => {
      if (b.status !== "confirmed") return false;
      return b.checkIn <= endKey && b.checkOut >= startKey;
    });
  }, [bookings, prevStart, prevEnd]);

  function calcStats(list) {
    let revenue = 0;
    let bookingCount = 0;
    let totalNights = 0;
    let totalGuests = 0;
    for (const b of list) {
      bookingCount++;
      const ci = new Date(b.checkIn + "T00:00:00");
      const co = new Date(b.checkOut + "T00:00:00");
      const nights = Math.max(1, Math.ceil((co - ci) / 86400000));
      totalNights += nights;
      totalGuests += parseInt(b.guests) || 0;
      if (b.paymentStatus === "paid" || b.paymentStatus === "manual") {
        revenue += parseFloat(b.amount) || 0;
      }
    }
    return { revenue, bookingCount, totalNights, totalGuests };
  }

  const stats = useMemo(() => calcStats(filteredBookings), [filteredBookings]);
  const prevStats = useMemo(() => calcStats(prevBookings), [prevBookings]);
  const avgNights = stats.bookingCount ? (stats.totalNights / stats.bookingCount) : 0;
  const prevAvgNights = prevStats.bookingCount ? (prevStats.totalNights / prevStats.bookingCount) : 0;
  const occupancy = stats.totalNights ? Math.min(100, Math.round((stats.totalNights / (range === "week" ? 14 : range === "month" ? 60 : 730)) * 100)) : 0;

  function trend(current, previous) {
    if (previous === 0 && current > 0) return { dir: "up", pct: "+100%" };
    if (previous === 0) return { dir: "same", pct: "0%" };
    const pct = Math.round(((current - previous) / previous) * 100);
    if (pct > 0) return { dir: "up", pct: `+${pct}%` };
    if (pct < 0) return { dir: "down", pct: `${pct}%` };
    return { dir: "same", pct: "0%" };
  }

  function TrendIcon({ dir }) {
    if (dir === "up") return <span style={{ color: COLORS.green }}>▲</span>;
    if (dir === "down") return <span style={{ color: COLORS.red }}>▼</span>;
    return <span style={{ color: COLORS.muted }}>–</span>;
  }

  const revenueTrend = trend(stats.revenue, prevStats.revenue);
  const bookingsTrend = trend(stats.bookingCount, prevStats.bookingCount);
  const occupancyTrend = trend(occupancy, prevStats.bookingCount ? Math.min(100, Math.round((prevStats.totalNights / (range === "week" ? 14 : range === "month" ? 60 : 730)) * 100)) : 0);
  const avgNightsTrend = trend(avgNights, prevAvgNights);
  const guestsTrend = trend(stats.totalGuests, prevStats.totalGuests);

  const metrics = [
    { label: "Revenue", value: formatCurrency(stats.revenue), trend: revenueTrend, icon: "₹" },
    { label: "Bookings", value: String(stats.bookingCount), trend: bookingsTrend, icon: "✓" },
    { label: "Occupancy", value: occupancy + "%", trend: occupancyTrend, icon: "⌂" },
    { label: "Avg nights", value: avgNights.toFixed(1), trend: avgNightsTrend, icon: "☾" },
    { label: "Total guests", value: String(stats.totalGuests), trend: guestsTrend, icon: "👥" },
  ];

  const statusCards = [
    { label: "Confirmed", count: (bookings || []).filter((b) => b.status === "confirmed").length, color: COLORS.green, icon: "✓" },
    { label: "Pending", count: (bookings || []).filter((b) => b.status === "pending" || b.status === "unpaid").length, color: COLORS.amber, icon: "◷" },
    { label: "Checked in", count: (bookings || []).filter((b) => b.status === "confirmed" && b.checkIn <= toDateKey(today) && b.checkOut > toDateKey(today)).length, color: COLORS.blue, icon: "→" },
    { label: "Cancelled", count: (bookings || []).filter((b) => b.status === "cancelled").length, color: COLORS.red, icon: "✕" },
    { label: "Checkout today", count: (bookings || []).filter((b) => b.status === "confirmed" && b.checkOut === toDateKey(today)).length, color: COLORS.purple, icon: "←" },
  ];

  const revenueData = useMemo(() => {
    if (range === "week") {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      return days.map((d) => {
        const dayBookings = filteredBookings.filter((b) => {
          const ci = new Date(b.checkIn + "T00:00:00");
          const co = new Date(b.checkOut + "T00:00:00");
          return ci <= new Date(rangeStart.getTime() + days.indexOf(d) * 86400000) && co > new Date(rangeStart.getTime() + days.indexOf(d) * 86400000);
        });
        return dayBookings.reduce((s, b) => s + (parseFloat(b.amount) || 0), 0);
      });
    }
    if (range === "month") {
      const weeks = ["Wk1", "Wk2", "Wk3", "Wk4", "Wk5"];
      return weeks.map((_, wi) => {
        const ws = new Date(rangeStart.getTime() + wi * 7 * 86400000);
        const we = new Date(ws.getTime() + 6 * 86400000);
        return filteredBookings.filter((b) => b.checkIn <= toDateKey(we) && b.checkOut >= toDateKey(ws))
          .reduce((s, b) => s + (parseFloat(b.amount) || 0), 0);
      });
    }
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map((_, mi) => {
      const ms = new Date(rangeStart.getFullYear(), mi, 1);
      const me = new Date(rangeStart.getFullYear(), mi + 1, 0);
      return filteredBookings.filter((b) => b.checkIn <= toDateKey(me) && b.checkOut >= toDateKey(ms))
        .reduce((s, b) => s + (parseFloat(b.amount) || 0), 0);
    });
  }, [filteredBookings, range, rangeStart]);

  const bookingsCountData = useMemo(() => {
    if (range === "week") {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      return days.map((_, di) => {
        const d = new Date(rangeStart.getTime() + di * 86400000);
        const dk = toDateKey(d);
        return filteredBookings.filter((b) => b.checkIn <= dk && b.checkOut > dk).length;
      });
    }
    if (range === "month") {
      const weeks = ["Wk1", "Wk2", "Wk3", "Wk4", "Wk5"];
      return weeks.map((_, wi) => {
        const ws = new Date(rangeStart.getTime() + wi * 7 * 86400000);
        const we = new Date(ws.getTime() + 6 * 86400000);
        return filteredBookings.filter((b) => b.checkIn <= toDateKey(we) && b.checkOut >= toDateKey(ws)).length;
      });
    }
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map((_, mi) => {
      const ms = new Date(rangeStart.getFullYear(), mi, 1);
      const me = new Date(rangeStart.getFullYear(), mi + 1, 0);
      return filteredBookings.filter((b) => b.checkIn <= toDateKey(me) && b.checkOut >= toDateKey(ms)).length;
    });
  }, [filteredBookings, range, rangeStart]);

  const roomLabels = ["Standard Room", "Deluxe Room", "Family Room", "Entire Homestay"];
  const roomPcts = useMemo(() => {
    const counts = [0, 0, 0, 0];
    for (const b of filteredBookings) {
      const idx = roomLabels.findIndex((r) => b.roomName?.includes(r.split(" ")[0]));
      if (idx >= 0) counts[idx]++;
      else counts[0]++;
    }
    const total = counts.reduce((s, c) => s + c, 0);
    return total ? counts.map((c) => Math.round((c / total) * 100)) : [25, 35, 22, 18];
  }, [filteredBookings]);

  const occDays = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((_, di) => {
      const d = new Date(rangeStart.getTime() + di * 86400000);
      const dk = toDateKey(d);
      const occupied = filteredBookings.filter((b) => b.checkIn <= dk && b.checkOut > dk).length;
      return Math.min(100, Math.round((occupied / 2) * 100));
    });
  }, [filteredBookings, rangeStart]);

  const revenueLabels = range === "week"
    ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    : range === "month"
      ? ["Wk1", "Wk2", "Wk3", "Wk4", "Wk5"]
      : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dev"];

  useEffect(() => {
    const ids = ["revChart", "roomChart", "revVsBookChart"];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.getContext("2d");
    });
  }, []);

  useEffect(() => {
    if (!revChartRef.current) return;
    if (revInstances.current.chart) revInstances.current.chart.destroy();
    const ctx = revChartRef.current.getContext("2d");
    revInstances.current.chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: revenueLabels,
        datasets: [
          {
            label: "Revenue",
            data: revenueData,
            backgroundColor: COLORS.blue,
            borderRadius: 4,
            barPercentage: 0.65,
          },
          {
            label: "Target",
            data: revenueData.map(() => 45000),
            type: "line",
            borderColor: COLORS.targetGreen,
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
          y: {
            beginAtZero: true,
            ticks: {
              callback: (v) => "₹" + Math.round(v / 1000) + "k",
            },
          },
          x: {
            ticks: { autoSkip: false, maxRotation: 45, font: { size: 11 } },
          },
        },
      },
    });
    return () => {
      if (revInstances.current.chart) revInstances.current.chart.destroy();
    };
  }, [revenueData, revenueLabels]);

  useEffect(() => {
    if (!roomChartRef.current) return;
    if (roomInstances.current.chart) roomInstances.current.chart.destroy();
    const ctx = roomChartRef.current.getContext("2d");
    roomInstances.current.chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: roomLabels,
        datasets: [
          {
            data: roomPcts,
            backgroundColor: [COLORS.blue, COLORS.green, COLORS.amber, COLORS.purple],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%",
        plugins: { legend: { display: false } },
      },
    });
    return () => {
      if (roomInstances.current.chart) roomInstances.current.chart.destroy();
    };
  }, [roomPcts]);

  useEffect(() => {
    if (!revVsBookChartRef.current) return;
    if (revVsBookInstances.current.chart) revVsBookInstances.current.chart.destroy();
    const ctx = revVsBookChartRef.current.getContext("2d");
    revVsBookInstances.current.chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: revenueLabels,
        datasets: [
          {
            label: "Revenue",
            data: revenueData,
            backgroundColor: COLORS.blue,
            borderRadius: 4,
            barPercentage: 0.6,
            yAxisID: "y",
          },
          {
            label: "Bookings",
            data: bookingsCountData,
            type: "line",
            borderColor: COLORS.coral,
            borderDash: [4, 3],
            borderWidth: 2,
            pointBackgroundColor: COLORS.coral,
            pointRadius: 4,
            fill: false,
            yAxisID: "y1",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            position: "left",
            ticks: {
              callback: (v) => "₹" + Math.round(v / 1000) + "k",
            },
          },
          y1: {
            beginAtZero: true,
            position: "right",
            grid: { drawOnChartArea: false },
            ticks: {
              callback: (v) => Math.round(v),
            },
          },
          x: {
            ticks: { autoSkip: false, maxRotation: 45, font: { size: 11 } },
          },
        },
      },
    });
    return () => {
      if (revVsBookInstances.current.chart) revVsBookInstances.current.chart.destroy();
    };
  }, [revenueData, bookingsCountData, revenueLabels]);

  const barColor = (pct) => {
    if (pct >= 80) return COLORS.green;
    if (pct >= 60) return COLORS.blue;
    return COLORS.lightBlue;
  };

  const s = {
    container: {
      fontFamily: "'DM Sans', Inter, Arial, sans-serif",
      color: COLORS.bark,
      padding: "24px 0",
    },
    tabs: {
      display: "flex",
      gap: 8,
      marginBottom: 20,
    },
    tab: (active) => ({
      padding: "8px 20px",
      border: active ? "none" : "0.5px solid " + COLORS.border,
      borderRadius: 8,
      background: active ? COLORS.gold : COLORS.warmWhite,
      color: active ? "#fff" : COLORS.muted,
      fontWeight: 500,
      fontSize: 14,
      cursor: "pointer",
      fontFamily: "inherit",
      minHeight: 44,
    }),
    metricGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
      gap: 10,
      marginBottom: 20,
    },
    metricCard: {
      background: COLORS.cream,
      borderRadius: 8,
      padding: "14px 16px",
    },
    metricIcon: {
      color: COLORS.muted,
      fontSize: 13,
      marginBottom: 4,
    },
    metricValue: {
      fontSize: 24,
      fontWeight: 500,
      lineHeight: 1.2,
      marginBottom: 4,
    },
    trend: (dir) => ({
      fontSize: 12,
      color: dir === "up" ? COLORS.green : dir === "down" ? COLORS.red : COLORS.muted,
      display: "flex",
      alignItems: "center",
      gap: 4,
    }),
    statusGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
      gap: 10,
      marginBottom: 24,
    },
    statusCard: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      background: COLORS.warmWhite,
      border: "0.5px solid " + COLORS.border,
      borderRadius: 8,
      padding: "12px 14px",
    },
    statusIcon: (color) => ({
      width: 36,
      height: 36,
      borderRadius: 8,
      background: color,
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 16,
      fontWeight: 700,
      flexShrink: 0,
    }),
    statusText: {
      display: "flex",
      flexDirection: "column",
    },
    statusCount: {
      fontSize: 18,
      fontWeight: 500,
      lineHeight: 1.2,
    },
    statusLabel: {
      fontSize: 11,
      color: COLORS.muted,
    },
    chartGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16,
    },
    chartFull: {
      gridColumn: "1 / -1",
    },
    chartCard: {
      background: COLORS.warmWhite,
      border: "0.5px solid " + COLORS.border,
      borderRadius: 12,
      padding: "16px 16px 8px",
    },
    chartTitle: {
      fontFamily: "'Cormorant Garamond', serif",
      fontWeight: 400,
      fontSize: 20,
      margin: "0 0 12px",
      color: COLORS.bark,
    },
    legendRow: {
      display: "flex",
      gap: 16,
      marginBottom: 8,
      flexWrap: "wrap",
    },
    legendItem: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      fontSize: 12,
      color: COLORS.muted,
    },
    legendDot: (color) => ({
      width: 10,
      height: 10,
      borderRadius: "50%",
      background: color,
      flexShrink: 0,
    }),
    occRow: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 6,
    },
    occDay: {
      width: 28,
      fontSize: 12,
      color: COLORS.muted,
      flexShrink: 0,
    },
    occBarBg: {
      flex: 1,
      height: 18,
      background: COLORS.cream,
      borderRadius: 4,
      overflow: "hidden",
    },
    occBar: (pct, color) => ({
      width: pct + "%",
      height: "100%",
      background: color,
      borderRadius: 4,
      transition: "width 0.3s ease",
    }),
    occPct: {
      width: 36,
      fontSize: 12,
      fontWeight: 500,
      textAlign: "right" },
  };

  return (
    <div style={s.container}>
      <div style={s.tabs}>
        {["week", "month", "year"].map((r) => (
          <button key={r} style={s.tab(range === r)} onClick={() => setRange(r)}>
            This {r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>

      <div style={s.metricGrid}>
        {metrics.map((m) => (
          <div key={m.label} style={s.metricCard}>
            <div style={s.metricIcon}>{m.icon} {m.label}</div>
            <div style={s.metricValue}>{m.value}</div>
            <div style={s.trend(m.trend.dir)}>
              <TrendIcon dir={m.trend.dir} />
              {m.trend.pct} vs last period
            </div>
          </div>
        ))}
      </div>

      <div style={s.statusGrid}>
        {statusCards.map((c) => (
          <div key={c.label} style={s.statusCard}>
            <div style={s.statusIcon(c.color)}>{c.icon}</div>
            <div style={s.statusText}>
              <span style={s.statusCount}>{c.count}</span>
              <span style={s.statusLabel}>{c.label}</span>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .dashChartGrid { grid-template-columns: 1fr !important; }
        }
        .dashChartGrid > div[data-full="true"] { grid-column: 1 / -1; }
      `}</style>

      <div className="dashChartGrid" style={s.chartGrid}>
        <div data-full="true" style={s.chartCard}>
          <h3 style={s.chartTitle}>Revenue over time</h3>
          <canvas id="revChart" ref={revChartRef} role="img" aria-label="Revenue chart" style={{ width: "100%", height: 220 }}>Revenue chart</canvas>
        </div>

        <div style={s.chartCard}>
          <h3 style={s.chartTitle}>Bookings by room</h3>
          <div style={s.legendRow}>
            {roomLabels.map((l, i) => (
              <div key={l} style={s.legendItem}>
                <div style={s.legendDot([COLORS.blue, COLORS.green, COLORS.amber, COLORS.purple][i])} />
                {l} {roomPcts[i]}%
              </div>
            ))}
          </div>
          <canvas id="roomChart" ref={roomChartRef} role="img" aria-label="Bookings by room chart" style={{ width: "100%", height: 180 }}>Bookings by room</canvas>
        </div>

        <div style={s.chartCard}>
          <h3 style={s.chartTitle}>Occupancy by day</h3>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => {
            const pct = occDays[i];
            return (
              <div key={d} style={s.occRow}>
                <span style={s.occDay}>{d}</span>
                <div style={s.occBarBg}>
                  <div style={s.occBar(pct, barColor(pct))} />
                </div>
                <span style={s.occPct}>{pct}%</span>
              </div>
            );
          })}
        </div>

        <div data-full="true" style={s.chartCard}>
          <h3 style={s.chartTitle}>Revenue vs bookings</h3>
          <canvas id="revVsBookChart" ref={revVsBookChartRef} role="img" aria-label="Revenue vs bookings chart" style={{ width: "100%", height: 220 }}>Revenue vs bookings</canvas>
        </div>
      </div>
    </div>
  );
}
