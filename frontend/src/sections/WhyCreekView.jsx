const reasons = [
  {
    icon: "heart",
    title: "Peaceful retreat",
    desc: "Escape the city and unwind in the quiet hills of Wayanad — perfect for families, couples, and solo travelers.",
  },
  {
    icon: "home",
    title: "Privacy & comfort",
    desc: "Your own private villa with spacious rooms, garden, and all the comforts of home in a serene natural setting.",
  },
  {
    icon: "star",
    title: "Thoughtful hospitality",
    desc: "From homemade breakfast to local tips, we make sure every guest feels welcomed and well cared for.",
  },
];

export default function WhyCreekView() {
  return (
    <section style={{
      background: "#F5F9F5",
      padding:    "56px 40px",
      fontFamily: "DM Sans, sans-serif",
    }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span style={{
            fontSize:      10,
            fontWeight:    500,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color:         "#7A9A7A",
            marginBottom:  8,
            display:       "block",
          }}>
            Why Creek View Villa
          </span>
          <h2 style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize:   "clamp(22px, 3vw, 30px)",
            fontWeight: 300,
            fontStyle:  "italic",
            color:      "#1C3A28",
            lineHeight: 1.25,
            margin:     0,
          }}>
            A home away from home<br />in the heart of Wayanad
          </h2>
        </div>

        <div style={{
          display:             "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap:                16,
        }}>
          {reasons.map(({ icon, title, desc }) => (
            <div
              key={title}
              style={{
                padding:       "24px 20px",
                borderRadius:  12,
                background:    "#ffffff",
                border:        "0.5px solid #E4EEE4",
              }}
            >
              <div style={{
                width:         40,
                height:        40,
                borderRadius:  10,
                background:    "#EAF3EA",
                display:       "flex",
                alignItems:    "center",
                justifyContent: "center",
                color:         "#3B6D11",
                fontSize:      20,
                marginBottom:  14,
              }}>
                <i className={`ti ti-${icon}`} aria-hidden="true" />
              </div>
              <h3 style={{
                fontSize:   15,
                fontWeight: 500,
                color:      "#1C3A28",
                margin:     "0 0 6px",
                lineHeight: 1.3,
              }}>
                {title}
              </h3>
              <p style={{
                fontSize:   13,
                color:      "#7A9A7A",
                lineHeight: 1.7,
                margin:     0,
                fontWeight: 300,
              }}>
                {desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
