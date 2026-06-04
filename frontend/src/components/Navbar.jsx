import { Link, useLocation } from "react-router-dom";

export default function Navbar({ isScrolled, sidebarOpen, setSidebarOpen, isAdminRoute, isLightNav, adminAuthed, logout }) {
  const location = useLocation();

  return (
    <header
      className={`topNav${isScrolled ? " scrolled" : ""}${isLightNav ? " topNav--light" : ""}`}
      style={{ display: isAdminRoute ? "none" : undefined }}
    >
      <div className="navLeft">
        {location.pathname !== "/" && (
          <Link className="navBack" to="/#hero" aria-label="Back to home">&lt;</Link>
        )}
        <button
          className={`hamburger${sidebarOpen ? " open" : ""}`}
          onClick={() => setSidebarOpen((o) => !o)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
      </div>

      <Link className="brand" to="/" style={{
        textDecoration: "none", fontFamily: '"Cormorant Garamond", serif',
        fontStyle: "italic", fontWeight: 600, fontSize: "1.15rem", letterSpacing: "0.02em",
      }}>Creek View Villa</Link>

      <nav className="navCenter">
        {location.pathname !== "/" && (
          <Link className="navLink" to="/#hero" onClick={() => setSidebarOpen(false)}>Home</Link>
        )}
        {[
          ["/rooms",     "Rooms"],
          ["/amenities", "Amenities"],
          ["/photos",    "Photos"],
          ["/#location", "Location"],
          ["/nearby",    "Nearby"],
        ].map(([to, label]) => (
          <Link
            key={to}
            className={`navLink${location.pathname === to || (to === "/#location" && location.hash === "#location") ? " active" : ""}`}
            to={to}
            onClick={() => setSidebarOpen(false)}
          >{label}</Link>
        ))}
      </nav>

      <nav className="navActions">
        {isAdminRoute ? (
          <>
            <Link className="navLink navLink--admin" to="/">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </Link>
            {adminAuthed && (
              <button className="navLink navLink--admin" style={{ background: "none", border: "none", cursor: "pointer", padding: "8px" }} onClick={logout} title="Sign out">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            )}
          </>
        ) : (
          <>
            <Link className="navLink navLink--book" to="/#booking">Book Now</Link>
            <Link className="navLink navLink--admin" to="/admin">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

export function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();

  return (
    <>
      <div className={`sidebarOverlay${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(false)} />
      <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
        {[
          ["/#booking",  "Book Now",   "sidebarLink--book"],
          ["/rooms",     "Rooms",      ""],
          ["/amenities", "Amenities",  ""],
          ["/photos",    "Photos",     ""],
          ["/#location", "Location",   ""],
          ["/nearby",    "Nearby",     ""],
        ].map(([to, label, extra]) => (
          <Link
            key={to}
            className={`sidebarLink${extra ? " " + extra : ""}${location.pathname === to ? " active" : ""}`}
            to={to}
            onClick={() => setSidebarOpen(false)}
          >{label}</Link>
        ))}
      </aside>
    </>
  );
}
