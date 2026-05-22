export default function MapSection() {
  const address = "Creek+View+Villa,+MXH5%2B974,+Panthipoyil,+Padinjarathara,+Kerala+673575";

  return (
    <div className="mapLayout">
      <div className="mapContainer">
        <iframe
          src={`https://www.google.com/maps?q=${address}&output=embed`}
          className="mapIframe"
          allowFullScreen
          loading="lazy"
          title="Creek View Villa Location"
        />
        <a
          className="mapDirectionsBtn"
          href={`https://www.google.com/maps/dir/?api=1&destination=${address}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          Get Directions
        </a>
      </div>
      <div className="mapInfo">
        <h3 className="mapInfoTitle">About Creek View Villa</h3>
        <p className="mapInfoDesc">
          Nestled in the serene hills of Padinjarathara, Wayanad, Creek View Villa
          offers a peaceful retreat surrounded by lush greenery and breathtaking
          valley views. Experience the warmth of Kerala hospitality in a modern,
          comfortable homestay setting.
        </p>
        <div className="mapInfoImages">
          <img src="/carousel/1.webp" alt="" loading="lazy" />
          <img src="/carousel/2.webp" alt="" loading="lazy" />
          <img src="/carousel/DSC00989.webp" alt="" loading="lazy" />
          <img src="/carousel/DSC01011.webp" alt="" loading="lazy" />
        </div>
      </div>
    </div>
  );
}
