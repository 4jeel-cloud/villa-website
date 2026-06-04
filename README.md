# Creek View Villa — Homestay Booking Website

A full-stack homestay booking system for Creek View Villa in Wayanad, Kerala. Guests can browse rooms, check availability, make reservations with online payment, and receive email confirmations. Admin dashboard for managing bookings, blocking dates, tracking laundry, and viewing analytics.

## Features

- **Guest-facing site** — rooms page, availability calendar, booking form with Razorpay payments, nearby attractions, photo gallery, amenities
- **Admin dashboard** — bookings calendar (create/cancel), occupancy & revenue charts, laundry tracker, room price/image editor
- **Real-time calendar sync** — Firestore `onSnapshot` subscription keeps the admin calendar in sync without page reload
- **Data persistence** — Google Sheets via Apps Script (primary), Firestore (secondary cache)
- **Email notifications** — Brevo (Sendinblue) for guest confirmations and manager alerts
- **Password reset** — Firebase Auth with custom email template
- **Responsive design** — mobile-friendly with sidebar navigation for admin

## Tech Stack

| Frontend | Backend | Infrastructure |
|----------|---------|---------------|
| React 19 | Node.js (Express 5) | Firebase Auth + Firestore |
| Vite 8 | firebase-admin | Google Sheets (Apps Script) |
| FullCalendar 6 | Razorpay | Brevo (email) |
| Chart.js 4 | express-rate-limit | Netlify (frontend) |
| Leaflet 1.9 | express-validator | Render (backend) |
| Axios | Helmet | GitHub Actions (keep-awake) |
| react-router-dom 7 | dotenv | |

## Architecture

```
Guest/Admin Browser
      │
      ├──► React App (Vite dev / Netlify prod)
      │       │
      │       ├──► Firebase Auth (login, password reset)
      │       ├──► Firestore (calendar events, booking cache, laundry)
      │       └──► Axios ──► Express API ──► store.js
      │                                          │
      │                          ┌───────────────┼───────────────┐
      │                          ▼               ▼               ▼
      │                     In-Memory        Firestore      Google Sheets
      │                     (rooms,          (persistence)   (via Apps
      │                      bookings,                       Script Web App)
      │                      blockedDates)
      │
      └──► Google Apps Script (Code.gs) — deployed as Web App
                  │
                  └──► Google Sheets (Rooms, Bookings, Cancelled, Blocks tabs)
```

**Data loading priority:** Firestore → Google Sheets → in-memory defaults

## Project Structure

```
backend/
├── appsscript/Code.gs          # Google Apps Script for Sheets CRUD
├── src/
│   ├── server.js               # Express routes, auth, rate limiting
│   ├── validators.js           # express-validator rule chains
│   ├── data/
│   │   ├── store.js            # Data store (memory + Firestore + Sheets sync)
│   │   └── firestoreDb.js      # Firestore CRUD operations
│   └── services/
│       ├── emailTemplates.js    # HTML email templates (escaped)
│       └── integrations.js      # Brevo email sending
└── tests/
    ├── store.test.mjs          # 15 tests — store operations
    └── validators.test.mjs     # 3 tests — validator rules

frontend/
├── src/
│   ├── App.jsx                 # Routes, context provider, lazy loading
│   ├── api.js                  # Axios client for backend API
│   ├── firebase.js             # Firebase client init (Auth + Firestore)
│   ├── calendarDb.js           # Firestore calendar fetch + onSnapshot
│   ├── bookingCache.js         # Firestore booking cache
│   ├── laundryDb.js            # Firestore laundry persistence
│   ├── constants.js            # Shared constants
│   ├── utils.js                # Date helpers
│   ├── context/AppContext.jsx  # React context
│   ├── hooks/                  # Custom hooks (data, forms, auth, notifications)
│   ├── components/             # UI components (AdminPage, UserPage, RoomsPage, etc.)
│   ├── pages/                  # Static pages (Privacy, Terms, Amenities, Photos)
│   ├── sections/               # Landing page sections
│   └── styles/                 # CSS files (base, admin, booking, nav, etc.)
└── netlify.toml                # Netlify deploy config
```

## Setup

### Prerequisites

- Node.js 18+ (tested with 22)
- npm
- Firebase project (for Auth + Firestore)
- Google Cloud project with Apps Script deployed (or use the included `Code.gs`)
- Brevo API key (free tier: 300 emails/day)
- Razorpay account (optional, for online payments)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values (see Environment Variables below)
npm run dev       # development (nodemon)
# or
npm start         # production
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev       # Vite dev server at http://localhost:5173
```

### Google Sheets (Apps Script)

1. Open `backend/appsscript/Code.gs`
2. Create a new Google Apps Script project
3. Paste the code and deploy as a Web App (Execute as: Me, Access: Anyone)
4. Set Script Properties:
   - `SHEET_ID` — your Google Spreadsheet ID
   - `APPS_SCRIPT_TOKEN` — a secret token (must match `APPS_SCRIPT_TOKEN` in backend .env)
5. The script auto-creates 4 sheet tabs: `Rooms`, `Bookings`, `Cancelled`, `Blocks`

### Testing

```bash
# Backend (15 tests)
cd backend && npm test

# Frontend (8 tests)
cd frontend && npm test
```

### Lint

```bash
cd backend && npm run lint      # ESLint 9, 0 warnings target
cd frontend && npm run lint     # ESLint 10, 0 warnings target
```

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default 4000) |
| `CORS_ORIGIN` | No | Frontend URL (default http://localhost:5173) |
| `ADMIN_TOKEN` | **Yes** | Secret shared between backend & frontend for admin auth |
| `ADMIN_EMAILS` | No | Comma-separated Firebase emails allowed admin access |
| `APPS_SCRIPT_URL` | No | Deployed Apps Script Web App URL |
| `APPS_SCRIPT_TOKEN` | No | Secret token for Apps Script auth |
| `BREVO_API_KEY` | No | Brevo (Sendinblue) API key for emails |
| `MANAGER_EMAIL` | No | Comma-separated emails notified on new bookings |
| `RAZORPAY_KEY_ID` | No | Razorpay live key ID |
| `RAZORPAY_KEY_SECRET` | No | Razorpay key secret |
| `FIREBASE_SERVICE_ACCOUNT` | No | Firebase service account JSON (one line) |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | No | Backend API base URL (default http://localhost:4000) |
| `VITE_ADMIN_TOKEN` | No | Must match `ADMIN_TOKEN` in backend .env |
| `VITE_RAZORPAY_KEY_ID` | No | Razorpay key ID (public) |
| `VITE_FIREBASE_API_KEY` | **Yes** | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | **Yes** | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | **Yes** | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | **Yes** | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | **Yes** | Firebase sender ID |
| `VITE_FIREBASE_APP_ID` | **Yes** | Firebase app ID |

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/health` | — | Health check |
| `GET` | `/rooms` | — | List rooms with prices & images |
| `GET` | `/availability` | — | Calendar events (bookings + blocks) |
| `GET` | `/bookings` | Admin | All bookings |
| `POST` | `/bookings` | — | Create booking (rate-limited: 10/15min) |
| `POST` | `/api/create-razorpay-order` | — | Create Razorpay payment order |
| `PATCH` | `/admin/bookings/:id/cancel` | Admin | Cancel booking |
| `PATCH` | `/admin/rooms/:id/price` | Admin | Update room price |
| `PATCH` | `/admin/rooms/:id/images` | Admin | Update room images |
| `POST` | `/admin/blocks` | Admin | Block dates |
| `POST` | `/api/send-reset-email` | — | Send password reset email (5/15min) |

## Deployment

### Frontend — Netlify

The `netlify.toml` is pre-configured:
- Build: `npm run build`
- Publish: `dist/`
- SPA redirects for all routes

```bash
cd frontend
npm run build
# Deploy dist/ to Netlify (drag & drop or CLI)
```

### Backend — Render

1. Push to GitHub
2. Create a new Web Service on Render
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && npm start`
5. Add all environment variables from `backend/.env`
6. The included GitHub Action (`.github/workflows/keep-awake.yml`) pings `RENDER_URL/health` every 10 min to prevent sleeping

### Google Apps Script

Deploy `backend/appsscript/Code.gs` as a Web App. Set Script Properties:
- `SHEET_ID` — spreadsheet ID
- `APPS_SCRIPT_TOKEN` — must match `APPS_SCRIPT_TOKEN` in backend .env
- `MANAGER_EMAIL` (optional) — overrides email alert recipient

## License

ISC
