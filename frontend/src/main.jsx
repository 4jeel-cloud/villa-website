import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles/base.css";
import "./styles/nav.css";
import "./styles/hero.css";
import "./styles/booking.css";
import "./styles/admin.css";
import "./styles/laundry.css";
import "./styles/rooms.css";
import "./styles/carousel.css";
import "./styles/lightbox.css";
import "./styles/map.css";
import "./styles/nearby.css";
import "./styles/footer.css";
import "./styles/widgets.css";
import "./styles/responsive.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
