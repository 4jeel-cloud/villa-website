import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../hooks/useAppContext";

const ROOM_DISPLAY = [
  {
    name:     "4-Room Villa",
    desc:     "Spacious villa perfect for large families and groups — spread across four beautifully appointed rooms with full access to all outdoor areas.",
    guests:   16,
    roomCount: 4,
    badge:    "Most popular",
    features: ["Free WiFi", "Free parking", "Swimming pool", "Kitchen", "Bonfire area", "BBQ area", "Creek view", "Breakfast"],
  },
  {
    name:     "2-Room Stay",
    desc:     "Cozy and intimate stay ideal for couples and small families — two warm rooms with everything you need for a peaceful retreat.",
    guests:   8,
    roomCount: 2,
    badge:    null,
    features: ["Free WiFi", "Free parking", "Hot water", "Garden", "Balcony", "Creek view", "Breakfast"],
  },
];

function RoomCard({ display, images, index, roomId, price }) {
  const [imgIdx, setImgIdx] = useState(0);
  const hasImages = images && images.length > 0;
  const currentImg = hasImages ? images[imgIdx % images.length] : null;

  return (
    <div className="roomCard" style={{
      background:    "#ffffff",
      border:        display.badge ? "1px solid #1C3A28" : "0.5px solid #D8ECD8",
      borderRadius:  16,
      overflow:      "hidden",
      display:       "grid",
      gridTemplateColumns: "1fr 1fr",
      minHeight:     320,
    }}>
      {/* image side */}
      <div style={{
        background: "#C8DEB8",
        position:   "relative",
        minHeight:  260,
        overflow:   "hidden",
      }}>
        {currentImg ? (
          <img
            key={currentImg}
            src={currentImg}
            alt={display.name}
            loading={index === 0 ? "eager" : "lazy"}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          /* fallback SVG illustration when no image is available */
          <svg viewBox="0 0 400 320" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{position:'absolute',inset:0,width:'100%',height:'100%'}}>
            <rect width="400" height="320" fill="#C8DEB8"/>
            <rect x="0" y="180" width="400" height="140" fill="#A8C890"/>
            <rect x="60" y="80" width="280" height="160" rx="4" fill="#2A5A30"/>
            <rect x="80" y="100" width="80" height="100" rx="2" fill="#1C3A28"/>
            <rect x="240" y="100" width="80" height="100" rx="2" fill="#1C3A28"/>
            <rect x="170" y="120" width="60" height="80" rx="2" fill="#3A6A40"/>
            <rect x="85" y="105" width="70" height="45" rx="1" fill="#4A8A50" opacity="0.6"/>
            <rect x="245" y="105" width="70" height="45" rx="1" fill="#4A8A50" opacity="0.6"/>
            <rect x="130" y="200" width="140" height="40" fill="#1C3A28"/>
            <circle cx="80" cy="140" r="30" fill="#3B6D11" opacity="0.5"/>
            <circle cx="320" cy="160" r="24" fill="#3B6D11" opacity="0.4"/>
            <path d="M0 280 Q100 260 200 275 Q300 290 400 270 L400 320 L0 320Z" fill="#7AB060" opacity="0.6"/>
          </svg>
        )}

        {display.badge && (
          <div style={{
            position:      "absolute",
            top:           16,
            left:          16,
            background:    "#1C3A28",
            color:         "#A8C8B0",
            fontSize:      10,
            fontWeight:    500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding:       "4px 12px",
            borderRadius:  20,
          }}>
            {display.badge}
          </div>
        )}

        {hasImages && images.length > 1 && (
          <div style={{
            position: "absolute",
            bottom: 12,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 6,
          }}>
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setImgIdx(i)}
                aria-label={`Image ${i + 1}`}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  background: i === imgIdx ? "#ffffff" : "rgba(255,255,255,0.4)",
                  transition: "background 0.2s",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* content side */}
      <div style={{ padding: "28px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <h2 style={{
            fontFamily:  "Cormorant Garamond, serif",
            fontSize:    22,
            fontWeight:  300,
            fontStyle:   "italic",
            color:       "#1C3A28",
            lineHeight:  1.2,
            marginBottom: 8,
          }}>
            {display.name}
          </h2>
          <p style={{ fontSize: 13, color: "#7A9A7A", fontWeight: 300, lineHeight: 1.7, marginBottom: 20 }}>
            {display.desc}
          </p>

          <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
            {[
              { icon: "users", label: `Up to ${display.guests} guests` },
              { icon: "door",  label: `${display.roomCount} rooms` },
            ].map(m => (
              <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#5A8A6A" }}>
                <i className={`ti ti-${m.icon}`} aria-hidden="true" style={{ fontSize: 15, color: "#3B6D11" }} />
                {m.label}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24 }}>
            {display.features.map(f => (
              <span key={f} style={{
                background:   "#EAF3EA",
                color:        "#27500A",
                fontSize:     11,
                padding:      "4px 10px",
                borderRadius: 20,
              }}>
                {f}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 16 }}>
            <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 28, fontWeight: 300, color: "#1C3A28" }}>
              ₹{(price || 0).toLocaleString("en-IN")}
            </span>
            <span style={{ fontSize: 12, color: "#7A9A7A" }}>/ night</span>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Link to={`/?room=${roomId}`} style={{
              flex:          1,
              background:    "#1C3A28",
              color:         "#ffffff",
              padding:       "11px 16px",
              borderRadius:  4,
              fontSize:      12,
              fontWeight:    500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              textDecoration: "none",
              textAlign:     "center",
            }}>
              Book now
            </Link>
            <Link to="/nearby" style={{
              flex:          1,
              background:    "transparent",
              color:         "#1C3A28",
              padding:       "11px 16px",
              borderRadius:  4,
              fontSize:      12,
              fontWeight:    500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              textDecoration: "none",
              textAlign:     "center",
              border:        "0.5px solid #C8DCC8",
            }}>
              Explore
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RoomsPage() {
  const { rooms } = useAppContext();
  return (
    <div style={{
      background: "#F5F9F5",
      padding: "64px 24px",
      minHeight: "100vh",
      fontFamily: "DM Sans, sans-serif",
    }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* hero */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{
            fontSize: 11, fontWeight: 500, letterSpacing: "0.2em",
            textTransform: "uppercase", color: "#5A8A6A", marginBottom: 12,
          }}>
            Our rooms
          </p>
          <h1 style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: "clamp(26px, 4vw, 38px)",
            fontWeight: 300, fontStyle: "italic", color: "#1C3A28",
            lineHeight: 1.2, marginBottom: 12,
          }}>
            Find your perfect<br />space to unwind
          </h1>
          <p style={{
            fontSize: 13, color: "#7A9A7A", fontWeight: 300,
            lineHeight: 1.7, maxWidth: 420, margin: "0 auto",
          }}>
            Two thoughtfully designed stays nestled in the heart of Wayanad — each offering comfort, privacy, and the calm of nature.
          </p>
        </div>

        {/* room cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {ROOM_DISPLAY.map((display, i) => (
            <RoomCard
              key={display.name}
              display={display}
              images={rooms[i]?.images || []}
              index={i}
              roomId={rooms[i]?.id || ""}
              price={rooms[i]?.basePrice ?? (i === 0 ? 12000 : 6000)}
            />
          ))}
        </div>

        {/* divider */}
        <div style={{ height: "0.5px", background: "#C8DCC8", margin: "48px 0 40px" }} />

        {/* bottom stats */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 1,
          background: "#D8ECD8",
          border: "0.5px solid #D8ECD8",
          borderRadius: 12,
          overflow: "hidden",
          marginBottom: 40,
        }}>
          {[
            { num: "24",   label: "Max guests total" },
            { num: "2:00", label: "Check-in from" },
            { num: "11:00",label: "Check-out by" },
          ].map(s => (
            <div key={s.label} style={{ background: "#ffffff", padding: 20, textAlign: "center" }}>
              <div style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: 26, fontWeight: 300, color: "#1C3A28", marginBottom: 3,
              }}>
                {s.num}
              </div>
              <div style={{ fontSize: 11, color: "#7A9A7A", letterSpacing: "0.06em" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* cta */}
        <div style={{ textAlign: "center" }}>
          <Link to="/#booking" style={{
            display: "inline-block",
            background: "#1C3A28",
            color: "#ffffff",
            padding: "13px 36px",
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}>
            Check availability
          </Link>
        </div>

      </div>
    </div>
  );
}
