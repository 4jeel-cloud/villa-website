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

export default function WhyCreekView() {
  return (
    <section style={{
      background: "#ffffff",
      minHeight:  "100dvh",
      display:    "flex",
      alignItems: "center",
      padding:    "60px 40px",
      fontFamily: "DM Sans, sans-serif",
    }}>
      <div style={{ maxWidth: 900, margin: "0 auto", width: "100%" }}>

        <div style={{ marginBottom: 48, maxWidth: 520 }}>
          <p style={{
            fontSize: 10, fontWeight: 500, letterSpacing: "0.18em",
            textTransform: "uppercase", color: "#7A9A7A", marginBottom: 8,
          }}>
            Why Creek View Villa
          </p>
          <h2 style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize:   "clamp(24px, 3.5vw, 34px)",
            fontWeight: 300,
            fontStyle:  "italic",
            color:      "#1C3A28",
            lineHeight: 1.25,
            margin:     0,
          }}>
            Three reasons guests<br />keep coming back
          </h2>
        </div>

        <div style={{
          display:             "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap:                 20,
        }}>
          {reasons.map(({ icon, title, desc }, i) => (
            <div
              key={title}
              style={{
                borderTop:     "2.5px solid #1C3A28",
                paddingTop:    24,
              }}
            >
              <div style={{
                display:       "flex",
                alignItems:    "center",
                gap:           10,
                marginBottom:  14,
              }}>
                <span style={{
                  fontSize:      10,
                  fontWeight:    500,
                  color:         "#A0B8A0",
                  letterSpacing: "0.1em",
                }}>
                  {(i + 1).toString().padStart(2, "0")}
                </span>
                <span style={{ width: "0.5px", height: 16, background: "#D0E0D0", display: "block" }} />
                <i
                  className={`ti ti-${icon}`}
                  aria-hidden="true"
                  style={{ fontSize: 18, color: "#3B6D11" }}
                />
              </div>
              <h3 style={{
                fontFamily:   "Cormorant Garamond, serif",
                fontSize:     19,
                fontWeight:   400,
                fontStyle:    "italic",
                color:        "#1C3A28",
                margin:       "0 0 10px",
                lineHeight:   1.25,
              }}>
                {title}
              </h3>
              <p style={{
                fontSize:   13,
                color:      "#7A9A7A",
                lineHeight: 1.8,
                margin:     0,
                fontWeight: 300,
              }}>
                {desc}
              </p>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 44,
          paddingTop: 28,
          borderTop: "0.5px solid #E0ECE0",
          display: "flex",
          justifyContent: "center",
        }}>
          <a
            href="/rooms"
            style={{
              display:       "inline-flex",
              alignItems:    "center",
              gap:           8,
              background:    "#ffffff",
              border:        "0.5px solid #1C3A28",
              color:         "#1C3A28",
              padding:       "12px 32px",
              borderRadius:  4,
              fontSize:      11,
              fontWeight:    500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              textDecoration: "none",
              transition:    "background 0.2s, color 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#1C3A28"; e.currentTarget.style.color = "#ffffff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.color = "#1C3A28"; }}
          >
            Explore rooms
            <i className="ti ti-arrow-right" aria-hidden="true" style={{ fontSize: 12 }} />
          </a>
        </div>

      </div>
    </section>
  );
}
