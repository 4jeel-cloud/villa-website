import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

const DESTINATIONS = [
  {
    icon: "backpack", name: "Wayanad Adventure Camp",
    rating: "4.0", reviews: "4.0K",
    description: "Located by Karlad Lake with zip-line over water, kayaking, rock climbing, and bamboo rafting.",
    tag: "Tourist Attraction", mapUrl: "https://maps.google.com/?q=Wayanad+Adventure+Camp+Karlad+Lake",
    mapEmbed: "https://www.google.com/maps?q=Wayanad+Adventure+Camp+Karlad+Lake&output=embed",
  },
  {
    icon: "sunset", name: "Dam Back Side View",
    rating: "4.7", reviews: "190",
    description: "Serene viewpoint on the reservoir's far side with panoramic mountain and water views. Exceptional for sunset photography.",
    tag: "Viewpoint", mapUrl: "https://maps.google.com/?q=Dam+Back+Side+View+Banasura+Sagar",
    mapEmbed: "https://www.google.com/maps?q=Dam+Back+Side+View+Banasura+Sagar&output=embed",
  },
  {
    icon: "waterfall", name: "Makkiyad Meenmutty Water Falls",
    rating: "4.2", reviews: "1.2K",
    description: "Peaceful multi-tiered waterfall hidden in lush forest. A light hike over muddy terrain and stone steps — away from the crowds.",
    tag: "Waterfall", mapUrl: "https://maps.google.com/?q=Makkiyad+Meenmutty+Waterfalls+Kanjirangad+Kerala",
    mapEmbed: "https://www.google.com/maps?q=Makkiyad+Meenmutty+Waterfalls+Kanjirangad+Kerala&output=embed",
  },
  {
    icon: "camera", name: "Waterfall Selfie Point",
    rating: "4.5", reviews: "66",
    description: "Scenic roadside stop near the main dam. Quick beautiful view of cascading water framed by dense greenery.",
    tag: "Scenic Spot", mapUrl: "https://maps.google.com/?q=Waterfall+Selfie+Point+Padinjarathara",
    mapEmbed: "https://www.google.com/maps?q=Waterfall+Selfie+Point+Padinjarathara&output=embed",
  },
  {
    icon: "building-arch", name: "Banasura Sagar Dam",
    rating: "4.4", reviews: "12K",
    description: "India's largest earthen dam with park areas, speed boating, and stunning island views. Just minutes from Creek View Villa.",
    tag: "Dam", mapUrl: "https://maps.google.com/?q=Banasura+Sagar+Dam+Padinjarathara+Kerala",
    mapEmbed: "https://www.google.com/maps?q=Banasura+Sagar+Dam+Padinjarathara+Kerala&output=embed",
  },
  {
    icon: "mountain", name: "Chembra Peak",
    rating: "4.5", reviews: "3.2K",
    description: "Trek to Wayanad's highest peak featuring a heart-shaped lake. A challenging but rewarding hike through tea plantations and misty trails.",
    tag: "Trekking", mapUrl: "https://maps.google.com/?q=Chembra+Peak+Wayanad",
    mapEmbed: "https://www.google.com/maps?q=Chembra+Peak+Wayanad&output=embed",
  },
  {
    icon: "droplets", name: "Soochipara Falls",
    rating: "4.3", reviews: "5.8K",
    description: "Three-tiered waterfall plunging into a natural pool. Perfect for a refreshing dip surrounded by dense forest.",
    tag: "Waterfall", mapUrl: "https://maps.google.com/?q=Soochipara+Falls+Wayanad",
    mapEmbed: "https://www.google.com/maps?q=Soochipara+Falls+Wayanad&output=embed",
  },
  {
    icon: "ripple", name: "Pookode Lake",
    rating: "4.2", reviews: "7.1K",
    description: "Natural freshwater lake shaped like India's map. Offers paddle boating, a freshwater aquarium, and scenic walking trails.",
    tag: "Lake", mapUrl: "https://maps.google.com/?q=Pookode+Lake+Wayanad",
    mapEmbed: "https://www.google.com/maps?q=Pookode+Lake+Wayanad&output=embed",
  },
  {
    icon: "leaf", name: "Kuruva Island",
    rating: "4.1", reviews: "2.3K",
    description: "Uninhabited river island with bamboo groves and walking trails. Accessible via bamboo rafts across the Kabini River.",
    tag: "Island", mapUrl: "https://maps.google.com/?q=Kuruva+Island+Wayanad",
    mapEmbed: "https://www.google.com/maps?q=Kuruva+Island+Wayanad&output=embed",
  },
  {
    icon: "paw", name: "Wayanad Wildlife Sanctuary",
    rating: "4.3", reviews: "4.5K",
    description: "Rich wildlife sanctuary home to elephants, tigers, and exotic birds. Jeep safaris and guided nature walks available.",
    tag: "Wildlife", mapUrl: "https://maps.google.com/?q=Wayanad+Wildlife+Sanctuary",
    mapEmbed: "https://www.google.com/maps?q=Wayanad+Wildlife+Sanctuary&output=embed",
  },
];

function LazyMap({ place }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="nearbyMapWrap" ref={ref}>
      {visible ? (
        <iframe
          src={place.mapEmbed}
          title={place.name}
          loading="lazy"
          allowFullScreen
          className="nearbyMapIframe"
        />
      ) : (
        <div className="nearbyMapPlaceholder">
          <i className="ti ti-map" />
          <span>Map loading…</span>
        </div>
      )}
    </div>
  );
}

export default function NearbyPage() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const place = searchParams.get("place");
    if (place) {
      const id = place.toLowerCase().replace(/\s+/g, "-");
      const el = document.getElementById(id);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    }
  }, [searchParams]);

  const slug = (name) => name.toLowerCase().replace(/\s+/g, "-");

  return (
    <section className="nearbyPage">
      <div className="nearbyHero">
        <h2>Nearby Attractions</h2>
        <p>Explore the best of Wayanad from Creek View Villa, Padinjarathara</p>
      </div>
      <div className="nearbyList">
        {DESTINATIONS.map((place, i) => {
          const isReversed = i % 2 !== 0;
          const card = (
            <div className="nearbyCard">
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "#ecfdf5", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  color: "#06402B", fontSize: 18, flexShrink: 0,
                }}>
                  <i className={`ti ti-${place.icon}`} aria-hidden="true" />
                </div>
                <span className="nearbyTag">{place.tag}</span>
              </div>
              <h3>{place.name}</h3>
              <div className="nearbyRating">
                <span className="nearbyStars">{"★".repeat(Math.round(Number(place.rating)))}{"☆".repeat(5 - Math.round(Number(place.rating)))}</span>
                <span className="nearbyRatingNum">{place.rating}</span>
                <span className="nearbyReviews">({place.reviews} reviews)</span>
              </div>
              <p className="nearbyDesc">{place.description}</p>
              <a href={place.mapUrl} target="_blank" rel="noopener noreferrer" className="nearbyMapBtn">
                <i className="ti ti-map-pin" style={{ fontSize: 14 }} />
                Get Directions
              </a>
            </div>
          );

          return (
            <div key={place.name} id={slug(place.name)} className={`nearbyRow${isReversed ? " nearbyRow--reverse" : ""}`}>
              {isReversed ? <><LazyMap place={place} />{card}</> : <>{card}<LazyMap place={place} /></>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
