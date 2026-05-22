import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RoomsPage({ rooms }) {
  const [activeImg, setActiveImg] = useState({});
  const navigate = useNavigate();

  return (
    <section className="card roomsPage">
      <h2>Our Rooms</h2>
      <div className="grid">
        {rooms.map((room) => {
          const imgIndex = activeImg[room.id] || 0;
          return (
            <article className="room" key={room.id}>
              <div className="roomImgWrap">
                <img src={room.images[imgIndex]} alt={room.name} loading="lazy" />
                {room.images.length > 1 && (
                  <div className="roomImgDots">
                    {room.images.map((_, i) => (
                      <button
                        key={i}
                        className={`roomImgDot${i === imgIndex ? " roomImgDot--active" : ""}`}
                        onClick={() => setActiveImg((prev) => ({ ...prev, [room.id]: i }))}
                        aria-label={`Image ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="roomInfo">
                <h3>{room.name}</h3>
                <p>{room.description}</p>
                <div className="roomMeta">
                  <span>👥 Up to {room.capacity} guests</span>
                  <span>₹{room.basePrice.toLocaleString("en-IN")}/night</span>
                </div>
                <button className="formSubmit" style={{ marginTop: 10 }} onClick={() => navigate(`/?room=${room.id}`)}>
                  Select
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
