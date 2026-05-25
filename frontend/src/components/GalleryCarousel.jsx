import { useCallback, useEffect, useRef, useState } from "react";

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

const DELAY = 3500;
const TOTAL = SLIDES.length;

export default function GalleryCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef(null);
  const progressRef = useRef(null);
  const autoTimer = useRef(null);
  const dragStartX = useRef(null);
  const touchStartX = useRef(null);

  const go = useCallback((idx, resetTimer) => {
    setIndex((prev) => {
      const next = ((idx % TOTAL) + TOTAL) % TOTAL;
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(-${next * 100}%)`;
      }
      return next;
    });
    if (resetTimer) {
      clearInterval(autoTimer.current);
      autoTimer.current = setInterval(() => go(index + 1, false), DELAY);
    }
  }, [index]);

  useEffect(() => {
    const timer = setInterval(() => go(index + 1, false), DELAY);
    autoTimer.current = timer;
    return () => clearInterval(timer);
  }, [index, go]);

  useEffect(() => {
    if (paused) return;
    const bar = progressRef.current;
    if (!bar) return;
    bar.style.transition = "none";
    bar.style.width = "0%";
    bar.offsetWidth;
    bar.style.transition = `width ${DELAY}ms linear`;
    bar.style.width = "100%";
  }, [index, paused]);

  useEffect(() => {
    const imgs = document.querySelectorAll(".car-img");
    imgs.forEach((img, i) => {
      if (i === index) {
        img.classList.remove("ken");
        void img.offsetWidth;
        img.classList.add("ken");
      } else {
        img.classList.remove("ken");
      }
    });
  }, [index]);

  const prev = useCallback(() => go(index - 1, true), [index, go]);
  const next = useCallback(() => go(index + 1, true), [index, go]);

  const handleMouseEnter = useCallback(() => {
    setPaused(true);
    clearInterval(autoTimer.current);
    if (progressRef.current) {
      progressRef.current.style.transition = "none";
      progressRef.current.style.width = "0%";
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setPaused(false);
    autoTimer.current = setInterval(() => go(index + 1, false), DELAY);
  }, [index, go]);

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1), true);
    touchStartX.current = null;
  }, [index, go]);

  const handleMouseDown = useCallback((e) => {
    dragStartX.current = e.clientX;
  }, []);

  const handleMouseUp = useCallback((e) => {
    if (dragStartX.current === null) return;
    const dx = e.clientX - dragStartX.current;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1), true);
    dragStartX.current = null;
  }, [index, go]);

  return (
    <div className="car-root">
      <div
        className="car-track-wrap"
        id="car-wrap"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="car-track" ref={trackRef}>
          {SLIDES.map((s, i) => (
            <div className="car-slide" key={i}>
              <div
                className={`car-img${i === index ? " ken" : ""}`}
                style={{ backgroundImage: `url(${s.img})`, backgroundColor: "#8aab88" }}
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

        <div className="car-progress" ref={progressRef} />

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
            onClick={() => go(i, true)}
          />
        ))}
      </div>

      <div className="thumb-strip" id="thumb-strip">
        {SLIDES.map((s, i) => (
          <div
            key={i}
            className={`thumb${i === index ? " active" : ""}`}
            onClick={() => go(i, true)}
          >
            <div
              className="thumb-img"
              style={{
                backgroundImage: `url(${s.img})`,
                backgroundColor: "#8aab88",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
