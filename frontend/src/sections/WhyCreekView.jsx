const reasons = [
  {
    icon:  "trees",
    title: "Surrounded by nature",
    desc:  "Nestled in the Western Ghats with creek views, forest trails, and fresh mountain air right at your doorstep.",
  },
  {
    icon:  "home",
    title: "Entire villa, all yours",
    desc:  "Book the whole property exclusively for your group — no shared spaces, no strangers, just your people.",
  },
  {
    icon:  "star",
    title: "Luxury without pretense",
    desc:  "Pool, breakfast, bonfire and BBQ — every comfort included, delivered with genuine Kerala warmth.",
  },
];

function Card({ icon, title, desc }) {
  return (
    <div style={{
      border:       "0.5px solid #E8F0E8",
      borderRadius: 12,
      padding:      "22px 18px",
      background:   "#ffffff",
    }}>
      <i
        className={`ti ti-${icon}`}
        aria-hidden="true"
        style={{ fontSize: 22, color: "#5A8A6A", display: "block", marginBottom: 12 }}
      />
      <div style={{
        fontFamily:   "Cormorant Garamond, serif",
        fontSize:     16,
        fontWeight:   300,
        fontStyle:    "italic",
        color:        "#1C3A28",
        marginBottom: 8,
        lineHeight:   1.3,
      }}>
        {title}
      </div>
      <p style={{
        fontSize:   12,
        color:      "#7A9A7A",
        lineHeight: 1.7,
        margin:     0,
        fontWeight: 300,
      }}>
        {desc}
      </p>
    </div>
  );
}

export default function WhyCreekView() {
  return (
    <section style={{
      background: "#ffffff",
      padding:    "56px 40px",
      fontFamily: "DM Sans, sans-serif",
    }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        <div style={{
          display:        "flex",
          alignItems:     "flex-end",
          justifyContent: "space-between",
          marginBottom:   28,
          flexWrap:       "wrap",
          gap:            12,
        }}>
          <div>
            <p style={{
              fontSize:      10,
              fontWeight:    500,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color:         "#7A9A7A",
              marginBottom:  6,
            }}>
              Why Creek View Villa
            </p>
            <h2 style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize:   28,
              fontWeight: 300,
              fontStyle:  "italic",
              color:      "#1C3A28",
              lineHeight: 1.2,
            }}>
              Made for memories
            </h2>
          </div>
        </div>

        <div style={{
          display:             "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap:                 14,
        }}>
          {reasons.map(r => <Card key={r.title} {...r} />)}
        </div>

      </div>
    </section>
  );
}
