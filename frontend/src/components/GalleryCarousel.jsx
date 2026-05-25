import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const IMAGES = [
  { img: "/carousel/1.webp" },
  { img: "/carousel/2.webp" },
  { img: "/carousel/DSC00989.webp" },
  { img: "/carousel/DSC01011.webp" },
  { img: "/carousel/DSC01019.webp" },
  { img: "/carousel/DSC01082.webp" },
  { img: "/carousel/DSC01097.webp" },
  { img: "/carousel/DSC01077.webp" },
  { img: "/carousel/DSC01105.webp" },
  { img: "/carousel/DSC01115.webp" },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function GalleryCarousel() {
  const [order] = useState(() => shuffle(IMAGES));
  const [index, setIndex] = useState(10);
  const [paused, setPaused] = useState(false);
  const [lightboxData, setLightboxData] = useState(null);
  const transitioning = useRef(true);
  const [itemWidth, setItemWidth] = useState(0);
  const trackRef = useRef(null);
  const pauseTimeout = useRef(null);
  const touchStartX = useRef(0);
  const touchOffset = useRef(0);
  const [touchDelta, setTouchDelta] = useState(0);
  const isSwiping = useRef(false);

  const len = order.length;
  const items = useMemo(() => [...order, ...order, ...order], [order]);

  const snap = useCallback((dir) => {
    setIndex((prev) => prev + dir);
    setTouchDelta(0);
    touchOffset.current = 0;
    setPaused(true);
    if (pauseTimeout.current) clearTimeout(pauseTimeout.current);
    pauseTimeout.current = setTimeout(() => setPaused(false), 4000);
  }, []);

  useEffect(() => {
    return () => {
      if (pauseTimeout.current) clearTimeout(pauseTimeout.current);
    };
  }, []);

  useEffect(() => {
    const measure = () => {
      const el = document.querySelector(".carousel .carousel-item");
      if (el) {
        const w = el.getBoundingClientRect().width;
        const style = window.getComputedStyle(el);
        const ml = parseFloat(style.marginLeft) || 0;
        const mr = parseFloat(style.marginRight) || 0;
        setItemWidth(w + ml + mr);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setIndex((prev) => prev + 1), 2500);
    return () => clearInterval(timer);
  }, [paused]);

  useEffect(() => {
    if (index >= 2 * len) {
      const timeout = setTimeout(() => {
        transitioning.current = false;
        setIndex((prev) => prev - len);
      }, 500);
      return () => clearTimeout(timeout);
    }
    if (index < len) {
      const timeout = setTimeout(() => {
        transitioning.current = false;
        setIndex((prev) => prev + len);
      }, 500);
      return () => clearTimeout(timeout);
    }
    transitioning.current = true;
  }, [index, len]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const onTouchStart = (e) => {
      isSwiping.current = true;
      touchStartX.current = e.touches[0].clientX;
      touchOffset.current = 0;
      setPaused(true);
    };

    const onTouchMove = (e) => {
      if (!isSwiping.current) return;
      touchOffset.current = e.touches[0].clientX - touchStartX.current;
      setTouchDelta(touchOffset.current);
    };

    const onTouchEnd = () => {
      if (!isSwiping.current) return;
      isSwiping.current = false;
      const delta = touchOffset.current;
      if (Math.abs(delta) > 50) {
        if (delta < 0) snap(1);
        else snap(-1);
      } else {
        setTouchDelta(0);
        touchOffset.current = 0;
        if (pauseTimeout.current) clearTimeout(pauseTimeout.current);
        setPaused(false);
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [snap]);

  useEffect(() => {
    const els = document.querySelectorAll(".carousel .carousel-item");
    const handleMouseMove = (e, el) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.x;
      const y = e.clientY - rect.y;
      const midX = rect.width / 2;
      const midY = rect.height / 2;
      const angleY = -(x - midX) / 6;
      const angleX = (y - midY) / 6;
      const box = el.querySelector(".carousel-box");
      if (box) {
        box.style.transform = `perspective(800px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale3d(1.02,1.02,1.02)`;
      }
    };
    const handleMouseLeave = (el) => {
      const box = el.querySelector(".carousel-box");
      if (box) {
        box.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg)";
      }
    };
    const handleEnter = () => setPaused(true);
    const bound = [];
    els.forEach((el) => {
      const move = (e) => handleMouseMove(e, el);
      const leave = () => handleMouseLeave(el);
      el.addEventListener("mousemove", move);
      el.addEventListener("mouseleave", leave);
      el.addEventListener("mouseenter", handleEnter);
      bound.push({ el, move, leave, handleEnter });
    });
    const onExit = () => {
      if (pauseTimeout.current) clearTimeout(pauseTimeout.current);
      setPaused(false);
    };
    const container = document.querySelector(".carousel");
    container?.addEventListener("mouseleave", onExit);
    return () => {
      bound.forEach(({ el, move, leave, handleEnter }) => {
        el.removeEventListener("mousemove", move);
        el.removeEventListener("mouseleave", leave);
        el.removeEventListener("mouseenter", handleEnter);
      });
      container?.removeEventListener("mouseleave", onExit);
    };
  }, []);

  useEffect(() => {
    if (!lightboxData) return;
    const handler = (e) => {
      if (e.key === "Escape") setLightboxData(null);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [lightboxData]);

  const baseTransform = itemWidth ? -index * itemWidth : 0;
  const currentOffset = baseTransform + touchDelta;

  const row = (isTop) => (
    <div className={`carousel-row${isTop ? "" : " carousel-row--reverse"}`}>
      <div
        className="carousel-track"
        ref={isTop ? trackRef : null}
        style={{
          transform: `translateX(${currentOffset}px)`,
          transition: isSwiping.current || transitioning.current === false
            ? "none"
            : "transform 0.5s ease"
        }}
      >
        {items.map((city, i) => (
          <div className="carousel-item" key={i}>
            <div className="carousel-box" onClick={() => setLightboxData(order[i % len])}>
              <img src={city.img} loading="lazy" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div className="homeSection" style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "48px 0 20px",
        borderBottom: "0.5px solid #E4EEE4"
      }}>
        <div style={{ maxWidth: 960, margin: "0 auto", paddingBottom: 4, width: "100%" }}>
          <h2 className="sectionHeading" style={{ paddingLeft: 0 }}>Photos</h2>
        </div>
        <div className="carousel">
          <button className="carousel-btn carousel-btn--prev" onClick={() => snap(1)} aria-label="Next">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          {row(true)}
          {row(false)}

          <button className="carousel-btn carousel-btn--next" onClick={() => snap(-1)} aria-label="Previous">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

      {lightboxData && (
        <div className="lightbox" onClick={() => setLightboxData(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightboxData(null)}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <img src={lightboxData.img} />
          </div>
        </div>
      )}
    </>
  );
}
