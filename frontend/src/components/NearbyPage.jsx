import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const DESTINATIONS = [
  {
    name: "Wayanad Adventure Camp",
    rating: "4.0",
    reviews: "4.0K",
    description: "Located by Karlad Lake with zip-line over water, kayaking, rock climbing, and bamboo rafting.",
    tag: "Tourist Attraction",
    mapUrl: "https://maps.google.com/?q=Wayanad+Adventure+Camp+Karlad+Lake",
    mapEmbed: "https://www.google.com/maps?q=Wayanad+Adventure+Camp+Karlad+Lake&output=embed",
  },
  {
    name: "Dam Back Side View",
    rating: "4.7",
    reviews: "190",
    description: "Serene viewpoint on the reservoir's far side with panoramic mountain and water views. Exceptional for sunset photography.",
    tag: "Viewpoint",
    mapUrl: "https://maps.google.com/?q=Dam+Back+Side+View+Banasura+Sagar",
    mapEmbed: "https://www.google.com/maps?q=Dam+Back+Side+View+Banasura+Sagar&output=embed",
  },
  {
    name: "Makkiyad Meenmutty Water Falls",
    rating: "4.2",
    reviews: "1.2K",
    description: "Peaceful multi-tiered waterfall hidden in lush forest. A light hike over muddy terrain and stone steps — away from the crowds.",
    tag: "Waterfall",
    mapUrl: "https://maps.google.com/?q=Makkiyad+Meenmutty+Waterfalls+Kanjirangad+Kerala",
    mapEmbed: "https://www.google.com/maps?q=Makkiyad+Meenmutty+Waterfalls+Kanjirangad+Kerala&output=embed",
  },
  {
    name: "Waterfall Selfie Point",
    rating: "4.5",
    reviews: "66",
    description: "Scenic roadside stop near the main dam. Quick beautiful view of cascading water framed by dense greenery.",
    tag: "Scenic Spot",
    mapUrl: "https://maps.google.com/?q=Waterfall+Selfie+Point+Padinjarathara",
    mapEmbed: "https://www.google.com/maps?q=Waterfall+Selfie+Point+Padinjarathara&output=embed",
  },
  {
    name: "Banasura Sagar Dam",
    rating: "4.4",
    reviews: "12K",
    description: "India's largest earthen dam with park areas, speed boating, and stunning island views. Just minutes from Creek View Villa.",
    tag: "Dam",
    mapUrl: "https://maps.google.com/?q=Banasura+Sagar+Dam+Padinjarathara+Kerala",
    mapEmbed: "https://www.google.com/maps?q=Banasura+Sagar+Dam+Padinjarathara+Kerala&output=embed",
  },
];

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
              <span className="nearbyTag">{place.tag}</span>
              <h3>{place.name}</h3>
              <div className="nearbyRating">
                <span className="nearbyStars">{"★".repeat(Math.round(Number(place.rating)))}{"☆".repeat(5 - Math.round(Number(place.rating)))}</span>
                <span className="nearbyRatingNum">{place.rating}</span>
                <span className="nearbyReviews">({place.reviews} reviews)</span>
              </div>
              <p className="nearbyDesc">{place.description}</p>
              <a href={place.mapUrl} target="_blank" rel="noopener noreferrer" className="nearbyMapBtn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Get Directions
              </a>
            </div>
          );
          const map = (
            <div className="nearbyMapWrap">
              <iframe
                src={place.mapEmbed}
                title={place.name}
                loading="lazy"
                allowFullScreen
                className="nearbyMapIframe"
              />
            </div>
          );
          return (
            <div key={place.name} id={slug(place.name)} className={`nearbyRow${isReversed ? " nearbyRow--reverse" : ""}`}>
              {isReversed ? <>{map}{card}</> : <>{card}{map}</>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
