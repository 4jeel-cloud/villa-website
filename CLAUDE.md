# Creek View Villa Website

## Stack
- **Frontend**: React 19 + Vite 8, React Router, FullCalendar, Axios
- **Backend**: Node.js + Express, Helmet, express-rate-limit, Razorpay
- **Database**: Firestore (laundry cache, booking cache, availability cache)
- **Auth**: Firebase Auth (session-only persistence, browserSessionPersistence)
- **Email**: Brevo (Sendinblue) API
- **CSS**: Plain CSS (no framework), Tabler Icons CDN, Google Fonts (DM Sans + Cormorant Garamond)
- **Data sync**: Google Sheets via Apps Script web app

## Project structure
```
/backend
  /src
    /data/store.js     — In-memory store, syncs with Google Sheets
    /server.js          — Express API server
    /services/          — Email, integrations
/frontend
  /src
    App.jsx             — Root: routing, auth, bookings/availability state
    firebase.js         — Firebase + Firestore init
    bookingCache.js     — Firestore booking cache
    availabilityCache.js — Firestore availability cache
    laundryDb.js        — Firestore laundry persistence
    api.js              — Axios API client
    /components/
      AdminPage.jsx     — Admin dashboard, sidebar, bookings, laundry, profile
      AdminDashboard.jsx
      AdminLoginPage.jsx
      UserPage.jsx      — Home page booking form + calendar
      GalleryCarousel.jsx
      NearbyPage.jsx
    /sections/
      Hero.jsx, About.jsx, Rooms.jsx, Amenities.jsx, Location.jsx, Footer.jsx, Testimonials.jsx
    /pages/
      Photos.jsx
    /pages/
      Photos.jsx
  index.html
  vite.config.js
  .env (VITE_FIREBASE_* vars)
```

## Key conventions
- **Colors**: Primary green `#06402B`, alt green `#1C3A28`, always use these exact hex values
- **Fonts**: Cormorant Garamond italic 600 for brand, DM Sans 700 for nav links
- **ESM imports**: Use `import()` for dynamic Firebase imports
- **State**: Prefer `useRef` for guards, `useState` for reactive state, `useCallback` for stable handlers
- **Admin**: No navbar/footer/FloatingContact when `pathname === "/admin"`; fixed sidebar with 6 items
- **Calendar**: FullCalendar with dayGridPlugin + interactionPlugin; events from merged availability+bookings
- **Laundry**: Local state with Firestore persistence (500ms debounce), `beforeunload` flush
- **Caches**: Firestore cache-then-network pattern for bookings + availability
- **Lazy loading**: React.lazy for all page routes, IntersectionObserver for maps

## API routes (backend)
- `GET /rooms` — public
- `GET /availability` — public
- `GET /bookings` — requires admin auth (Firebase token or ADMIN_TOKEN)
- `POST /bookings` — public (guest booking)
- `POST /api/create-razorpay-order` — public
- `PATCH /admin/bookings/:id/cancel` — admin
- `PATCH /admin/rooms/:id/price` — admin
- `PATCH /admin/rooms/:id/images` — admin
- `POST /admin/blocks` — admin

## Environment variables
- Backend: `APPS_SCRIPT_URL`, `ADMIN_TOKEN`, `FIREBASE_API_KEY`, `FIREBASE_PROJECT_ID`, `BREVO_API_KEY`, `MANAGER_EMAIL`, `CORS_ORIGIN`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `PORT`
- Frontend: `VITE_API_URL`, `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`
- GitHub: `RENDER_URL` (for keep-awake cron)

## Important behaviors
- `isRoomAvailable()` is synchronous
- Merge: `mergeBookingsIntoAvailability(availData, bookings)` adds red "Booked" events
- Bookings fetch runs once per mount; retry via `retryFetchBookings()` on API failure
- Admin sidebar: `position: fixed`, collapses to 56px via chevron toggle
- All confirmed bookings are shown on admin calendar; user calendar filters by selected room
- Both check-in and check-out dates are available for new bookings (same-day turnover)
