import { useMemo } from "react";

export default function Footer() {
  const bubbles = useMemo(() => Array.from({ length: 64 }, (_, i) => ({
    id: i,
    size: `${2 + Math.random() * 4}rem`,
    distance: `${6 + Math.random() * 4}rem`,
    position: `${-5 + Math.random() * 110}%`,
    time: `${2 + Math.random() * 2}s`,
    delay: `${-1 * (2 + Math.random() * 2)}s`
  })), []);

  return (
    <>
      <div className="footer">
        <div className="footerBubbles">
          {bubbles.map((b) => (
            <div
              key={b.id}
              className="footerBubble"
              style={{
                "--size": b.size,
                "--distance": b.distance,
                "--position": b.position,
                "--time": b.time,
                "--delay": b.delay
              }}
            />
          ))}
        </div>
        <div className="footerContent">
          <div className="footerLinks">
            <div className="footerGroup">
              <b>Explore</b>
              <a href="/#photos">Gallery</a>
              <a href="/rooms">Rooms</a>
              <a href="/nearby">Nearby</a>
              <a href="/#location">Location</a>
            </div>
            <div className="footerGroup">
              <b>Facilities</b>
              <a href="https://maps.google.com/?q=Creek+View+Villa+Padinjarathara+Kerala" target="_blank" rel="noopener noreferrer">Parking</a>
              <a href="https://maps.google.com/?q=Creek+View+Villa+Padinjarathara+Kerala" target="_blank" rel="noopener noreferrer">Wi-Fi</a>
              <a href="https://maps.google.com/?q=Creek+View+Villa+Padinjarathara+Kerala" target="_blank" rel="noopener noreferrer">Garden</a>
              <a href="https://maps.google.com/?q=Creek+View+Villa+Padinjarathara+Kerala" target="_blank" rel="noopener noreferrer">Kitchen</a>
            </div>
            <div className="footerGroup">
              <b>Nearby</b>
              <a href="https://maps.google.com/?q=Chembra+Peak+Wayanad" target="_blank" rel="noopener noreferrer">Chembra Peak</a>
              <a href="https://maps.google.com/?q=Soochipara+Falls+Wayanad" target="_blank" rel="noopener noreferrer">Soochipara Falls</a>
              <a href="https://maps.google.com/?q=Pookode+Lake+Wayanad" target="_blank" rel="noopener noreferrer">Pookode Lake</a>
              <a href="https://maps.google.com/?q=Banasura+Sagar+Dam+Padinjarathara" target="_blank" rel="noopener noreferrer">Banasura Dam</a>
              <a href="https://maps.google.com/?q=Kuruva+Island+Wayanad" target="_blank" rel="noopener noreferrer">Kuruva Island</a>
              <a href="https://maps.google.com/?q=Wayanad+Wildlife+Sanctuary" target="_blank" rel="noopener noreferrer">Wayanad Sanctuary</a>
            </div>
            <div className="footerGroup">
              <b>Contact</b>
              <a href="tel:+919876543210">+91 98765 43210</a>
              <a href="mailto:hello@creekviewvilla.com">hello@creekviewvilla.com</a>
              <a href="https://maps.google.com/?q=Creek+View+Villa+Padinjarathara+Kerala" target="_blank" rel="noopener noreferrer">Padinjarathara, Wayanad</a>
              <a href="https://maps.google.com/?q=Creek+View+Villa+Padinjarathara+Kerala" target="_blank" rel="noopener noreferrer">Kerala, India</a>
            </div>
          </div>
          <div className="footerBrand">
            <div className="footerLogo" />
            <p>&copy; 2026 Creek View Villa. All rights reserved.</p>
          </div>
        </div>
      </div>
      <svg style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
        <defs>
          <filter id="blob">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="blob"
            />
          </filter>
        </defs>
      </svg>
    </>
  );
}
