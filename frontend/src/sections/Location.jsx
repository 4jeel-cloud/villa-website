import { Link } from "react-router-dom";

const nearby = [
  { icon: "mountain",       name: "Chembra Peak",       dist: "12 km away" },
  { icon: "waterfall",      name: "Soochipara Falls",   dist: "18 km away" },
  { icon: "ripple",         name: "Pookode Lake",       dist: "8 km away"  },
  { icon: "building-arch",  name: "Banasura Dam",       dist: "22 km away" },
  { icon: "island",         name: "Kuruva Island",      dist: "15 km away" },
  { icon: "paw",            name: "Wayanad Sanctuary",  dist: "10 km away" },
];

function MapIllustration() {
  return (
    <svg
      viewBox="0 0 400 280"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
    >
      <rect width="400" height="280" fill="#162818" />
      <path d="M0 80 Q100 60 200 75 Q300 90 400 70 L400 100 Q300 118 200 103 Q100 88 0 108Z"  fill="#1E3828" opacity="0.8" />
      <path d="M0 140 Q100 120 200 135 Q300 150 400 130 L400 160 Q300 178 200 163 Q100 148 0 168Z" fill="#1E3828" opacity="0.6" />
      <path d="M0 200 Q100 180 200 195 Q300 210 400 190 L400 220 Q300 238 200 223 Q100 208 0 228Z" fill="#1E3828" opacity="0.4" />
      <rect x="0"   y="138" width="400" height="2" rx="1" fill="#2A4A30" opacity="0.4" />
      <rect x="198" y="0"   width="2"   height="280" rx="1" fill="#2A4A30" opacity="0.4" />
      <rect x="60"  y="50"  width="80"  height="3"   rx="1" fill="#2A4A30" opacity="0.5" />
      <rect x="260" y="120" width="80"  height="3"   rx="1" fill="#3A6040" opacity="0.4" />
      <rect x="80"  y="200" width="60"  height="3"   rx="1" fill="#3A6040" opacity="0.35" />
      <circle cx="200" cy="140" r="24" fill="#7AB890" opacity="0.08" />
      <circle cx="200" cy="140" r="14" fill="#7AB890" opacity="0.2"  />
      <circle cx="200" cy="140" r="6"  fill="#7AB890" />
    </svg>
  );
}

function NearbyItem({ icon, name, dist, last }) {
  return (
    <Link
      to={`/nearby?place=${encodeURIComponent(name)}`}
      style={{
        display:       "flex",
        alignItems:    "center",
        gap:           12,
        padding:       "12px 0",
        borderBottom:  last ? "none" : "0.5px solid rgba(255,255,255,0.08)",
        textDecoration: "none",
      }}
    >
      <div
        style={{
          width:          32,
          height:         32,
          borderRadius:   8,
          background:     "rgba(122,184,144,0.15)",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          color:          "#7AB890",
          fontSize:       16,
          flexShrink:     0,
        }}
      >
        <i className={`ti ti-${icon}`} aria-hidden="true" />
      </div>
      <div>
        <div style={{ fontSize: 13, color: "#ffffff", marginBottom: 1 }}>{name}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{dist}</div>
      </div>
    </Link>
  );
}

export default function Location() {
  return (
    <section
      id="location"
      style={{
        background: "#1C3A28",
        padding:    "64px 40px",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      <div
        className="locationGrid"
        style={{
          maxWidth:            820,
          margin:              "0 auto",
          display:             "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap:                 36,
          alignItems:          "start",
        }}
      >

        {/* Left col — address + map */}
        <div>
          <p
            style={{
              fontSize:      10,
              fontWeight:    500,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color:         "#7AB890",
              marginBottom:  8,
            }}
          >
            Location
          </p>

          <h2
            style={{
              fontFamily:   "Cormorant Garamond, serif",
              fontSize:     28,
              fontWeight:   300,
              fontStyle:    "italic",
              color:        "#ffffff",
              lineHeight:   1.25,
              marginBottom: 16,
            }}
          >
            Padinjarathara,<br />Wayanad
          </h2>

          <p
            style={{
              fontSize:     13,
              color:        "rgba(255,255,255,0.5)",
              lineHeight:   1.9,
              marginBottom: 24,
            }}
          >
            Kerala, India<br />
            <a
              href="tel:+919544242879"
              style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}
            >
              +91 95442 42879
            </a>
            <br />
            <a
              href="mailto:creekviewvilla@gmail.com"
              style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}
            >
              creekviewvilla@gmail.com
            </a>
          </p>

          <div
            style={{
              background:   "rgba(255,255,255,0.06)",
              border:       "0.5px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              height:       280,
              position:     "relative",
              overflow:     "hidden",
            }}
          >
            <iframe
              src="https://www.google.com/maps?q=Padinjarathara,Wayanad,Kerala&output=embed"
              title="Creek View Villa Location"
              loading="lazy"
              allowFullScreen
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                display: "block",
              }}
            />

            <a
              href="https://maps.google.com/?q=Padinjarathara,Wayanad,Kerala"
              target="_blank"
              rel="noreferrer"
              style={{
                position:      "absolute",
                bottom:        14,
                right:         14,
                background:    "rgba(28,58,40,0.9)",
                border:        "0.5px solid rgba(122,184,144,0.3)",
                color:         "#A8C8B0",
                fontSize:      11,
                padding:       "6px 12px",
                borderRadius:  4,
                textDecoration: "none",
                display:       "flex",
                alignItems:    "center",
                gap:           5,
                backdropFilter: "blur(4px)",
              }}
            >
              <i className="ti ti-map-2" aria-hidden="true" style={{ fontSize: 13 }} />
              Open in Maps
            </a>
          </div>
        </div>

        {/* Right col — nearby */}
        <div>
          <p
            style={{
              fontSize:      10,
              fontWeight:    500,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color:         "#7AB890",
              marginBottom:  16,
            }}
          >
            Nearby attractions
          </p>

          <div>
            {nearby.map((item, i) => (
              <NearbyItem
                key={item.name}
                {...item}
                last={i === nearby.length - 1}
              />
            ))}
          </div>

          <Link
            to="/nearby"
            style={{
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              gap:            8,
              marginTop:      24,
              background:     "transparent",
              border:         "0.5px solid rgba(122,184,144,0.3)",
              color:          "#A8C8B0",
              padding:        "12px 20px",
              borderRadius:   4,
              fontSize:       12,
              fontWeight:     500,
              letterSpacing:  "0.08em",
              textTransform:  "uppercase",
              textDecoration: "none",
            }}
          >
            <i className="ti ti-navigation" aria-hidden="true" />
            Get directions
          </Link>
        </div>

      </div>
    </section>
  );
}
