import { useCallback, useRef, useState } from "react";

const SLIDES = [
  { img: "/carousel/1.webp",        tag: "Exteriors", name: "Front view" },
  { img: "/carousel/2.webp",        tag: "Exteriors", name: "Villa entrance" },
  { img: "/carousel/DSC00989.webp",  tag: "Interiors", name: "Living room" },
  { img: "/carousel/DSC01011.webp",  tag: "Interiors", name: "Bedroom" },
  { img: "/carousel/DSC01019.webp",  tag: "Views",     name: "Mountain view" },
  { img: "/carousel/DSC01082.webp",  tag: "Outdoors",  name: "Pool area" },
  { img: "/carousel/DSC01097.webp",  tag: "Garden",    name: "Lawn & seating" },
  { img: "/carousel/DSC01077.webp",  tag: "Evenings",  name: "Sunset at villa" },
  { img: "/carousel/DSC01105.webp",  tag: "Morning",   name: "Creek at dawn" },
  { img: "/carousel/DSC01115.webp",  tag: "Views",     name: "Balcony view" },
];

const TOTAL = SLIDES.length;

export default function GalleryCarousel() {
  const [index, setIndex] = useState(0);
  const trackRef = useRef(null);
  const touchStartX = useRef(null);
  const dragStartX = useRef(null);
  const indexRef = useRef(0);

  const go = useCallback((idx) => {
    const next = ((idx % TOTAL) + TOTAL) % TOTAL;
    indexRef.current = next;
    setIndex(next);
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${next * 100}%)`;
    }
  }, []);

  const prev = useCallback(() => go(indexRef.current - 1), [go]);
  const next = useCallback(() => go(indexRef.current + 1), [go]);

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) go(indexRef.current + (dx < 0 ? 1 : -1));
    touchStartX.current = null;
  }, [go]);

  const handleMouseDown = useCallback((e) => {
    dragStartX.current = e.clientX;
  }, []);

  const handleMouseUp = useCallback((e) => {
    if (dragStartX.current === null) return;
    const dx = e.clientX - dragStartX.current;
    if (Math.abs(dx) > 40) go(indexRef.current + (dx < 0 ? 1 : -1));
    dragStartX.current = null;
  }, [go]);

  return (
    <div className="car-root">
      <div
        className="car-track-wrap"
        id="car-wrap"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="car-track" ref={trackRef}>
          {SLIDES.map((s, i) => (
            <div className="car-slide" key={i}>
              <div
                className={`car-img${i === index ? " ken" : ""}`}
                style={{
                  backgroundImage: Math.abs(i - index) <= 1 || TOTAL <= 3 ? `url(${s.img})` : undefined,
                  backgroundColor: "#8aab88",
                }}
              />
              <div className="car-scrim" />
              <div className="car-info">
                <div>
                  <p className="car-tag">{s.tag}</p>
                  <p className="car-name">{s.name}</p>
                </div>
                <span className="car-ctr">{i + 1} / {TOTAL}</span>
              </div>
            </div>
          ))}
        </div>

        <button className="car-btn car-btn--prev" id="car-prev" onClick={prev} aria-label="Previous">
          &#8592;
        </button>
        <button className="car-btn car-btn--next" id="car-next" onClick={next} aria-label="Next">
          &#8594;
        </button>
      </div>

      <div className="car-dots" id="car-dots">
        {SLIDES.map((_, i) => (
          <div
            key={i}
            className={`car-dot${i === index ? " active" : ""}`}
            style={{ width: i === index ? "22px" : "6px" }}
            onClick={() => go(i)}
          />
        ))}
      </div>

      <div className="thumb-strip" id="thumb-strip">
        {SLIDES.map((s, i) => (
          <div
            key={i}
            className={`thumb${i === index ? " active" : ""}`}
            onClick={() => go(i)}
          >
            <div
              className="thumb-img"
              style={{
                backgroundImage: Math.abs(i - index) <= 2 ? `url(${s.img})` : undefined,
                backgroundColor: "#8aab88",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
