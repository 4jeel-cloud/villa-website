import { Link } from "react-router-dom";

const nearby = [
  { icon: "mountain",       name: "Chembra Peak",       dist: "12 km away" },
  { icon: "droplets",       name: "Soochipara Falls",   dist: "18 km away" },
  { icon: "ripple",         name: "Pookode Lake",       dist: "8 km away"  },
  { icon: "building-arch",  name: "Banasura Dam",       dist: "22 km away" },
  { icon: "leaf",           name: "Kuruva Island",      dist: "15 km away" },
  { icon: "paw",            name: "Wayanad Sanctuary",  dist: "10 km away" },
];

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
        minHeight:  "100dvh",
        display:    "flex",
        alignItems: "center",
        padding:    "60px 40px",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      <div
        className="locationGrid"
        style={{
          maxWidth:            960,
          margin:              "0 auto",
          width:               "100%",
          display:             "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap:                 "clamp(32px, 5vw, 80px)",
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
            className="locationHeading"
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
              href="tel:+917306198968"
              style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}
            >
              +91 73061 98968
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
            className="locationMap"
            style={{
              background:   "rgba(255,255,255,0.06)",
              border:       "0.5px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              aspectRatio:  "16/9",
              minHeight:    280,
              position:     "relative",
              overflow:     "hidden",
            }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3907.226179532473!2d75.95563127481901!3d11.678376588530668!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba67701b3c7d127%3A0x33cad82b8edc52e8!2sCreek%20view%20villa!5e0!3m2!1sen!2sin!4v1779700149057!5m2!1sen!2sin"
              title="Creek View Villa Location"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                display: "block",
                position: "absolute",
                inset: 0,
              }}
            />

            <a
              href="https://maps.google.com/maps?q=11.684611,75.954"
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
              <i className="ti ti-map-pin" aria-hidden="true" style={{ fontSize: 13 }} />
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

          <a
            href="https://maps.google.com/maps/dir//11.684611,75.954"
            target="_blank"
            rel="noreferrer"
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
            <i className="ti ti-map-2" aria-hidden="true" />
            Get directions
          </a>
        </div>

      </div>
    </section>
  );
}
