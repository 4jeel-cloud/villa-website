const sections = [
  {
    label: "Essentials",
    items: [
      { icon: "wifi",           name: "Free WiFi",        desc: "High-speed internet throughout the property",    highlight: false },
      { icon: "car",            name: "Free parking",     desc: "Secure on-site parking for all guests",          highlight: false },
      { icon: "droplet",        name: "Hot water",        desc: "24-hour hot water in all bathrooms",             highlight: false },
      { icon: "tools-kitchen-2", name: "Kitchen",         desc: "Fully equipped kitchenette for self-use",        highlight: false },
      { icon: "swimming",       name: "Swimming pool",    desc: "Private pool open all day",                      highlight: true  },
    ],
  },
  {
    label: "Outdoors & nature",
    items: [
      { icon: "tree",     name: "Garden & lawn",     desc: "Lush garden perfect for morning walks",    highlight: false },
      { icon: "droplet",  name: "Creek view",        desc: "Scenic creek views from the property",     highlight: true  },
      { icon: "building", name: "Balcony & terrace", desc: "Private balcony with open-air views",      highlight: false },
      { icon: "flame",    name: "Bonfire area",      desc: "Evening bonfires under the open sky",      highlight: false },
      { icon: "grill",    name: "BBQ area",          desc: "Outdoor barbecue setup for guests",        highlight: false },
    ],
  },
  {
    label: "Food & dining",
    items: [
      { icon: "egg", name: "Breakfast included", desc: "Fresh homemade breakfast every morning", highlight: true },
    ],
  },
  {
    label: "Activities & entertainment",
    items: [
      { icon: "chess", name: "Board games",   desc: "Collection of games for all ages",        highlight: false },
      { icon: "walk",  name: "Nature walks",  desc: "Guided trails through the property",      highlight: false },
    ],
  },
  {
    label: "In-room comforts",
    items: [
      { icon: "device-tv",  name: "TV in room",  desc: "Cable TV in every room",        highlight: false },
      { icon: "propeller",  name: "Ceiling fan", desc: "Cooling fan in all rooms",      highlight: false },
      { icon: "door",       name: "Wardrobe",    desc: "Spacious wardrobe storage",     highlight: false },
    ],
  },
  {
    label: "Guest convenience",
    items: [
      { icon: "baby-carriage", name: "Child friendly",  desc: "Safe and welcoming for families",       highlight: false },
      { icon: "shield-check",  name: "CCTV security",   desc: "24-hour cameras for your safety",       highlight: false },
    ],
  },
];

function AmenityCard({ icon, name, desc, highlight }) {
  return (
    <div style={{
      background:    highlight ? "#1C3A28" : "#ffffff",
      border:        `0.5px solid ${highlight ? "#1C3A28" : "#D8ECD8"}`,
      borderRadius:  12,
      padding:       "16px 14px",
      display:       "flex",
      flexDirection: "column",
      gap:           10,
    }}>
      <div style={{
        width:          36,
        height:         36,
        borderRadius:   10,
        background:     highlight ? "rgba(255,255,255,0.12)" : "#EAF3EA",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        color:          highlight ? "#A8C8B0" : "#3B6D11",
        fontSize:       17,
      }}>
        <i className={`ti ti-${icon}`} aria-hidden="true" />
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: highlight ? "#ffffff" : "#1C3A28", marginBottom: 3 }}>
          {name}
        </div>
        <div style={{ fontSize: 11, color: highlight ? "#A8C8B0" : "#7A9A7A", lineHeight: 1.5 }}>
          {desc}
        </div>
      </div>
    </div>
  );
}

function Section({ label, items }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{
        fontSize: 10, fontWeight: 500, letterSpacing: "0.18em",
        textTransform: "uppercase", color: "#7A9A7A",
        marginBottom: 14, display: "flex", alignItems: "center", gap: 10,
      }}>
        {label}
        <span style={{ flex: 1, height: "0.5px", background: "#C8DCC8" }} />
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: 10,
      }}>
        {items.map(item => <AmenityCard key={item.name} {...item} />)}
      </div>
    </div>
  );
}

export default function Amenities() {
  const totalCount = sections.reduce((sum, s) => sum + s.items.length, 0);

  return (
    <div style={{ background: "#F5F9F5", padding: "64px 24px", minHeight: "100vh", fontFamily: "DM Sans, sans-serif" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "#5A8A6A", marginBottom: 12 }}>
            What we offer
          </p>
          <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 300, fontStyle: "italic", color: "#1C3A28", lineHeight: 1.2, marginBottom: 12 }}>
            Everything you need<br />for a perfect stay
          </h1>
          <p style={{ fontSize: 13, color: "#7A9A7A", fontWeight: 300, lineHeight: 1.7, maxWidth: 400, margin: "0 auto 28px" }}>
            Creek View Villa is designed to make you feel at home — with every comfort and experience thoughtfully provided.
          </p>

          <div className="amenitiesCountStrip" style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
            {[
              { num: totalCount, label: "Total amenities" },
              { num: 5,          label: "Outdoor features" },
              { num: 3,          label: "Room comforts" },
              { num: 2,          label: "Activities" },
            ].map((c, i, arr) => (
              <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 32 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 32, fontWeight: 300, color: "#1C3A28", lineHeight: 1 }}>{c.num}</div>
                  <div style={{ fontSize: 11, color: "#7A9A7A", letterSpacing: "0.08em", marginTop: 3 }}>{c.label}</div>
                </div>
                {i < arr.length - 1 && <div style={{ width: "0.5px", height: 36, background: "#C8DCC8" }} />}
              </div>
            ))}
          </div>
        </div>

        {sections.map(s => <Section key={s.label} {...s} />)}

        <div style={{ height: "0.5px", background: "#C8DCC8", margin: "8px 0 40px" }} />
        <div style={{ textAlign: "center" }}>
          <a href="/booking" style={{
            display: "inline-block", background: "#1C3A28", color: "#ffffff",
            padding: "13px 36px", borderRadius: 4, fontSize: 12, fontWeight: 500,
            letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none",
          }}>
            Book your stay
          </a>
        </div>

      </div>
    </div>
  );
}
