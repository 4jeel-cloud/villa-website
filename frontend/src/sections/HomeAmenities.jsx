import { useEffect, useRef, useState } from "react";

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

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function AmenityCard({ icon, name, index, inView }) {
  const [hovered, setHovered] = useState(false);
  const delay = 180 + index * 55;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        padding: "11px 13px",
        borderRadius: 10,
        background: hovered ? "#EAF3EA" : "#ffffff",
        border: `0.5px solid ${hovered ? "#A8C8B0" : "#E4EEE4"}`,
        cursor: "default",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0) scale(1)" : "translateY(16px) scale(0.97)",
        transition: `opacity 0.45s ease ${delay}ms, transform 0.45s ease ${delay}ms, background 0.2s, border-color 0.2s`,
      }}
    >
      <i
        className={`ti ti-${icon}`}
        aria-hidden="true"
        style={{
          color: hovered ? "#1C3A28" : "#5A8A6A",
          fontSize: 16,
          flexShrink: 0,
          transform: hovered ? "scale(1.15) rotate(-5deg)" : "scale(1) rotate(0deg)",
          transition: "color 0.2s, transform 0.3s ease",
        }}
      />
      <span
        style={{
          fontSize: 12,
          color: hovered ? "#1C3A28" : "#3A5A3A",
          lineHeight: 1.3,
          transition: "color 0.2s",
        }}
      >
        {name}
      </span>
    </div>
  );
}

export default function HomeAmenities() {
  const [sectionRef, inView] = useInView();
  const footerDelay = 180 + amenities.length * 55;

  return (
    <section
      ref={sectionRef}
      style={{
        background: "#F5F9F5",
        padding: "56px 40px",
        fontFamily: "DM Sans, sans-serif",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 32,
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "#7A9A7A" }}>
              Amenities
            </span>
            <span style={{ width: "0.5px", height: 28, background: "#C8DCC8", display: "block" }} />
            <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 22, fontWeight: 300, fontStyle: "italic", color: "#1C3A28" }}>
              What's included
            </span>
          </div>
          <a
            href="/amenities"
            style={{
              fontSize: 11,
              color: "#5A8A6A",
              textDecoration: "none",
              letterSpacing: "0.06em",
              display: "flex",
              alignItems: "center",
              gap: 4,
              transition: "gap 0.2s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.gap = "8px"}
            onMouseLeave={e => e.currentTarget.style.gap = "4px"}
          >
            See all
            <i className="ti ti-arrow-right" aria-hidden="true" style={{ fontSize: 12 }} />
          </a>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8 }}>
          {amenities.map((a, i) => (
            <AmenityCard key={a.name} {...a} index={i} inView={inView} />
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 24,
            gap: 6,
            flexWrap: "wrap",
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(8px)",
            transition: `opacity 0.6s ease ${footerDelay}ms, transform 0.6s ease ${footerDelay}ms`,
          }}
        >
          {["12 amenities", "Check-in 2:00 PM", "Check-out 11:00 AM"].map((tag, i, arr) => (
            <span key={tag} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ background: "#EAF3EA", color: "#3B6D11", fontSize: 10, padding: "4px 12px", borderRadius: 20, letterSpacing: "0.06em" }}>
                {tag}
              </span>
              {i < arr.length - 1 && (
                <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#C8DCC8", display: "block" }} />
              )}
            </span>
          ))}
        </div>

      </div>
    </section>
  );
}
