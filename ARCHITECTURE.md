# AtlasTrip — Code Architecture

> Quick reference for finding every piece of the AtlasTrip mobile travel planning app.

## Repository Layout

```
AtlasTrip/
├── mobile/                       ← React Native (Expo) mobile app
│   ├── App.js                    ← App entry point — sets up navigation & providers
│   ├── babel.config.js           ← Babel configuration for Expo
│   ├── package.json              ← Mobile dependencies & scripts
│   └── src/
│       ├── screens/              ← Full-page views (one per bottom tab)
│       │   ├── HomeScreen.js     ← Globe hero, search, trending destinations, flight deals
│       │   ├── TripsScreen.js    ← Trip list, itinerary timeline, create-trip modal
│       │   ├── DiscoverScreen.js ← Destination grid, hidden gems, restaurants, events
│       │   ├── MapScreen.js      ← Interactive map with category filters & markers
│       │   └── ProfileScreen.js  ← User stats, saved trips, favorites, settings
│       ├── components/
│       │   ├── Common/
│       │   │   └── GlassmorphicCard.js  ← Reusable glassmorphic card wrapper
│       │   └── Globe/
│       │       └── GlobeView.js         ← 3D rotating Earth (Three.js in WebView)
│       ├── navigation/
│       │   └── AppNavigator.js   ← Bottom-tab navigator (Home, Trips, Discover, Map, Profile)
│       ├── services/
│       │   ├── api.js            ← Axios HTTP client & all API helper methods
│       │   └── auth.js           ← Login, register, logout, token refresh helpers
│       ├── hooks/
│       │   └── useAuth.js        ← Authentication state hook
│       └── utils/
│           └── constants.js      ← Design tokens (colors, fonts, spacing) & mock data
│
├── backend/                      ← Node.js / Express REST API
│   ├── server.js                 ← Express app setup, Socket.io, rate limiting, CORS
│   ├── package.json              ← Backend dependencies & scripts
│   ├── .env.example              ← Required environment variables template
│   ├── config/
│   │   └── db.js                 ← MongoDB / Mongoose connection
│   ├── models/
│   │   ├── User.js               ← User schema (auth, preferences, travel stats)
│   │   ├── Trip.js               ← Trip schema (itinerary, activities, sharing)
│   │   └── Destination.js        ← Destination schema (ratings, weather, trending)
│   ├── routes/
│   │   ├── auth.js               ← Register, login, logout, refresh, profile endpoints
│   │   ├── trips.js              ← CRUD trips, activities, sharing endpoints
│   │   ├── destinations.js       ← Search, trending, hidden-gems, weather endpoints
│   │   └── ai.js                 ← AI trip optimization, recommendations, chat endpoints
│   └── middleware/
│       ├── auth.js               ← JWT token verification middleware
│       └── error.js              ← Global error handler
│
├── README.md                     ← Getting started, prerequisites, quick start
├── ARCHITECTURE.md               ← This file — code map & architecture guide
└── atlastrip_app_design.md       ← Original design specification
```

## Where to Find Each Feature

| Feature | Mobile code | Backend code |
|---------|------------|--------------|
| **3D Globe** | `mobile/src/components/Globe/GlobeView.js` | — |
| **Home / Search** | `mobile/src/screens/HomeScreen.js` | — |
| **Trip Planning** | `mobile/src/screens/TripsScreen.js` | `backend/routes/trips.js`, `backend/models/Trip.js` |
| **Discover** | `mobile/src/screens/DiscoverScreen.js` | `backend/routes/destinations.js`, `backend/models/Destination.js` |
| **Map Exploration** | `mobile/src/screens/MapScreen.js` | — |
| **User Profile** | `mobile/src/screens/ProfileScreen.js` | `backend/routes/auth.js`, `backend/models/User.js` |
| **Authentication** | `mobile/src/services/auth.js`, `mobile/src/hooks/useAuth.js` | `backend/routes/auth.js`, `backend/middleware/auth.js` |
| **AI Assistant** | `mobile/src/services/api.js` (AI methods) | `backend/routes/ai.js` |
| **Weather** | — | `backend/routes/destinations.js` (`/:id/weather`) |
| **Design System** | `mobile/src/utils/constants.js` | — |
| **Glassmorphic UI** | `mobile/src/components/Common/GlassmorphicCard.js` | — |
| **Navigation** | `mobile/src/navigation/AppNavigator.js` | — |
| **Real-time Collaboration** | Socket.io client (`mobile/package.json`) | `backend/server.js` (Socket.io setup) |

## Data Flow

```
┌──────────────────────┐         HTTP / WebSocket         ┌──────────────────┐
│   Mobile App (Expo)  │  ◄──────────────────────────►   │  Backend (Express)│
│                      │         Axios / Socket.io        │                  │
│  App.js              │                                  │  server.js       │
│   └─ AppNavigator    │                                  │   ├─ routes/*    │
│       ├─ HomeScreen  │                                  │   ├─ models/*    │
│       ├─ TripsScreen │                                  │   └─ middleware/*│
│       ├─ DiscoverScreen                                 │                  │
│       ├─ MapScreen   │                                  └───────┬──────────┘
│       └─ ProfileScreen                                          │
│                      │                                          │
│  services/api.js ────┼──────────────────────────────────────────┘
│  services/auth.js ───┼──────────────────────────────────────────┘
│  hooks/useAuth.js    │                                  ┌──────────────────┐
│  utils/constants.js  │                                  │     MongoDB      │
│  components/*        │                                  └──────────────────┘
└──────────────────────┘                                  ┌──────────────────┐
                                                          │  External APIs   │
                                                          │  · OpenAI GPT    │
                                                          │  · OpenWeatherMap│
                                                          └──────────────────┘
```

## Running the App

See [README.md](README.md) for full setup instructions. In short:

```bash
# Terminal 1 — Backend
cd backend && cp .env.example .env   # then fill in secrets
npm install && npm run dev

# Terminal 2 — Mobile
cd mobile
npm install && npx expo start
```
