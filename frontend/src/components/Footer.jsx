import { useMemo } from "react";

export default function Footer() {
  const bubbles = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: `${3 + Math.random() * 3}rem`,
    distance: `${5 + Math.random() * 3}rem`,
    position: `${Math.random() * 100}%`,
    time: `${3 + Math.random() * 2}s`,
    delay: `${-1 * (2 + Math.random() * 2)}s`
  })), []);

  return (
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
            <a href="tel:+919544242879">+91 95442 42879</a>
            <a href="mailto:creekviewvilla@gmail.com">creekviewvilla@gmail.com</a>
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
  );
}
