const amenities = [
  "Swimming pool", "Creek view", "Breakfast", "Free WiFi",
  "Free parking", "Bonfire area", "Garden", "BBQ area",
  "Hot water", "Balcony", "Kitchen", "CCTV",
];

export default function WhatsIncluded() {
  return (
    <section style={{
      background: "#1C3A28",
      padding:    "64px 40px",
      fontFamily: "DM Sans, sans-serif",
    }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          marginBottom:   40,
        }}>
          <div>
            <p style={{
              fontSize:      10,
              fontWeight:    500,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color:         "#A0C8A8",
              margin:        0,
            }}>
              Amenities
            </p>
            <h2 style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize:   "clamp(26px, 3.5vw, 36px)",
              fontWeight: 300,
              fontStyle:  "italic",
              color:      "#ffffff",
              margin:     "6px 0 0",
              lineHeight: 1.2,
            }}>
              What's included
            </h2>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{
              fontSize:   13,
              color:      "#A0C8A8",
              fontWeight: 500,
              display:    "block",
            }}>
              12 amenities
            </span>
            <a
              href="/amenities"
              style={{
                fontSize:       11,
                color:          "#C8E0CE",
                textDecoration: "none",
                letterSpacing:  "0.06em",
                display:        "inline-flex",
                alignItems:     "center",
                gap:            4,
                marginTop:      4,
                opacity:        0.75,
              }}
            >
              See all
              <i className="ti ti-arrow-right" aria-hidden="true" style={{ fontSize: 11 }} />
            </a>
          </div>
        </div>

        <div style={{
          display:             "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap:                 10,
          marginBottom:        40,
        }}>
          {amenities.map(name => (
            <div
              key={name}
              style={{
                background: "rgba(255,255,255,0.06)",
                border:     "0.5px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                padding:    "14px 10px",
                textAlign:  "center",
              }}
            >
              <p style={{
                fontSize:   12,
                color:      "rgba(255,255,255,0.7)",
                lineHeight: 1.3,
                margin:     0,
                fontWeight: 300,
              }}>
                {name}
              </p>
            </div>
          ))}
        </div>

        <div style={{
          display:         "flex",
          justifyContent:  "center",
          gap:             "clamp(24px, 8vw, 80px)",
          paddingTop:      28,
          borderTop:       "0.5px solid rgba(255,255,255,0.12)",
        }}>
          <div style={{ textAlign: "center" }}>
            <i className="ti ti-clock" aria-hidden="true" style={{
              fontSize: 18, color: "#A0C8A8", display: "block", marginBottom: 6,
            }} />
            <p style={{
              fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em",
              textTransform: "uppercase", margin: "0 0 4px",
            }}>
              Check-in
            </p>
            <p style={{
              fontSize: 14, color: "#ffffff", margin: 0, fontWeight: 400,
            }}>
              2:00 PM
            </p>
          </div>
          <div style={{ textAlign: "center" }}>
            <i className="ti ti-clock" aria-hidden="true" style={{
              fontSize: 18, color: "#A0C8A8", display: "block", marginBottom: 6,
            }} />
            <p style={{
              fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em",
              textTransform: "uppercase", margin: "0 0 4px",
            }}>
              Check-out
            </p>
            <p style={{
              fontSize: 14, color: "#ffffff", margin: 0, fontWeight: 400,
            }}>
              11:00 AM
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
