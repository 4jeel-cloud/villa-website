const amenities = [
  { icon: "swimming",      name: "Swimming pool" },
  { icon: "wave",          name: "Creek view"    },
  { icon: "egg",           name: "Breakfast"     },
  { icon: "wifi",          name: "Free WiFi"     },
  { icon: "car",           name: "Parking"       },
  { icon: "flame",         name: "Bonfire"       },
  { icon: "tree",          name: "Garden"        },
  { icon: "grill",         name: "BBQ area"      },
  { icon: "building",      name: "Balcony"       },
  { icon: "droplet",       name: "Hot water"     },
  { icon: "chess",         name: "Board games"   },
  { icon: "shield-check",  name: "CCTV"          },
];

export default function WhatsIncluded() {
  return (
    <section style={{
      background: "#1C3A28",
      padding:    "48px 40px",
      fontFamily: "DM Sans, sans-serif",
    }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          marginBottom:   28,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              fontSize:      10,
              fontWeight:    500,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color:         "#7AB890",
            }}>
              What's included
            </span>
            <span style={{
              display:    "block",
              height:     "0.5px",
              width:      32,
              background: "rgba(255,255,255,0.15)",
            }} />
          </div>
          <a
            href="/amenities"
            style={{
              fontSize:       11,
              color:          "#7AB890",
              textDecoration: "none",
              letterSpacing:  "0.06em",
              display:        "flex",
              alignItems:     "center",
              gap:            4,
            }}
          >
            See all
            <i className="ti ti-arrow-right" aria-hidden="true" style={{ fontSize: 11 }} />
          </a>
        </div>

        <div style={{
          display:             "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
          gap:                 8,
        }}>
          {amenities.map(({ icon, name }) => (
            <div
              key={name}
              style={{
                display:        "flex",
                flexDirection:  "column",
                alignItems:     "center",
                gap:            7,
                padding:        "14px 8px",
                borderRadius:   10,
                background:     "rgba(255,255,255,0.05)",
                border:         "0.5px solid rgba(255,255,255,0.08)",
                textAlign:      "center",
                transition:     "background 0.2s, border-color 0.2s",
                cursor:         "default",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background     = "rgba(255,255,255,0.1)";
                e.currentTarget.style.borderColor    = "rgba(255,255,255,0.2)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background     = "rgba(255,255,255,0.05)";
                e.currentTarget.style.borderColor    = "rgba(255,255,255,0.08)";
              }}
            >
              <i
                className={`ti ti-${icon}`}
                aria-hidden="true"
                style={{ fontSize: 20, color: "#A8C8B0" }}
              />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", lineHeight: 1.3 }}>
                {name}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
