const amenities = [
  { icon: "swimming",        name: "Swimming pool" },
  { icon: "droplet",         name: "Creek view"    },
  { icon: "egg",             name: "Breakfast"     },
  { icon: "wifi",            name: "Free WiFi"     },
  { icon: "car",             name: "Free parking"  },
  { icon: "flame",           name: "Bonfire area"  },
  { icon: "tree",            name: "Garden"        },
  { icon: "grill",           name: "BBQ area"      },
  { icon: "droplet",         name: "Hot water"     },
  { icon: "building",        name: "Balcony"       },
  { icon: "tools-kitchen-2", name: "Kitchen"       },
  { icon: "shield-check",    name: "CCTV"          },
];

export default function WhatsIncluded() {
  return (
    <section style={{
      background: "#1C3A28",
      minHeight:  "100dvh",
      display:    "flex",
      alignItems: "center",
      padding:    "60px 40px",
      fontFamily: "DM Sans, sans-serif",
    }}>
      <div style={{ maxWidth: 960, margin: "0 auto", width: "100%" }}>

        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          marginBottom:   44,
          flexWrap:       "wrap",
          gap:            12,
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
              fontSize:   "clamp(28px, 4vw, 38px)",
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
              fontSize:   12,
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
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap:                 12,
          marginBottom:        48,
        }}>
          {amenities.map(({ icon, name }) => (
            <div
              key={name}
              style={{
                background:  "rgba(255,255,255,0.06)",
                border:      "0.5px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                padding:     "18px 12px",
                textAlign:   "center",
                transition:  "background 0.25s, border-color 0.25s, transform 0.25s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background  = "rgba(255,255,255,0.12)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                e.currentTarget.style.transform   = "translateY(-3px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background  = "rgba(255,255,255,0.06)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.transform   = "translateY(0)";
              }}
            >
              <i
                className={`ti ti-${icon}`}
                aria-hidden="true"
                style={{
                  fontSize:   24,
                  color:      "#A8C8B0",
                  display:    "block",
                  marginBottom: 8,
                }}
              />
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
          gap:             "clamp(32px, 10vw, 96px)",
          paddingTop:      32,
          borderTop:       "0.5px solid rgba(255,255,255,0.12)",
        }}>
          <div style={{ textAlign: "center" }}>
            <i className="ti ti-clock" aria-hidden="true" style={{
              fontSize: 22, color: "#A0C8A8", display: "block", marginBottom: 8,
            }} />
            <p style={{
              fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.14em",
              textTransform: "uppercase", margin: "0 0 4px",
            }}>
              Check-in
            </p>
            <p style={{
              fontSize: 16, color: "#ffffff", margin: 0, fontWeight: 400,
            }}>
              2:00 PM
            </p>
          </div>
          <div style={{ textAlign: "center" }}>
            <i className="ti ti-clock" aria-hidden="true" style={{
              fontSize: 22, color: "#A0C8A8", display: "block", marginBottom: 8,
            }} />
            <p style={{
              fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.14em",
              textTransform: "uppercase", margin: "0 0 4px",
            }}>
              Check-out
            </p>
            <p style={{
              fontSize: 16, color: "#ffffff", margin: 0, fontWeight: 400,
            }}>
              11:00 AM
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
