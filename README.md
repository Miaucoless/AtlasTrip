# AtlasTrip ✈️

A premium React Native travel planning app built with Expo and backed by a Node.js/Express API.

## Features

- 🌍 **Interactive 3D Globe** – Three.js spinning Earth with city markers
- ✈️ **Trip Planning** – Create, organize, and share detailed itineraries
- 🗺 **Map Exploration** – Full-screen Mapbox map with custom category markers
- 🔍 **Discover** – Trending destinations, hidden gems, and live city pulse
- 🤖 **AI Assistant** – GPT-powered trip optimization and travel chatbot
- 🌤 **Weather** – Real-time forecasts per destination
- 🔒 **Auth** – Supabase Auth (email/password + social login)
- 🤝 **Collaboration** – Real-time shared itinerary editing via Socket.io

---

## Prerequisites

Install the following before running the app:

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 18 | https://nodejs.org |
| npm | ≥ 9 | bundled with Node.js |
| Expo Go (phone) | latest | [iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) |
| Supabase account | free | https://supabase.com |

> **No physical device?** Install [Android Studio](https://developer.android.com/studio) (Android emulator) or use Xcode on macOS (iOS simulator).

---

## Project Structure

```
AtlasTrip/
├── supabase/
│   └── schema.sql           # Full database schema – run once in Supabase SQL editor
├── mobile/                  # React Native (Expo) app
│   ├── App.js
│   ├── .env.example         # ← copy to .env and fill in values
│   ├── package.json
│   └── src/
│       ├── screens/         # HomeScreen, TripsScreen, DiscoverScreen, MapScreen, ProfileScreen
│       ├── components/      # Globe, AI, Booking, Map, Trips components
│       ├── navigation/      # AppNavigator (Bottom Tabs)
│       ├── services/        # api.js, auth.js, supabase.js
│       ├── hooks/           # useAuth.js, useRealtimeTrip.js
│       └── utils/           # constants.js
└── backend/                 # Node.js / Express API
    ├── server.js
    ├── .env.example         # ← copy to .env and fill in values
    ├── config/              # db.js (Supabase client)
    ├── routes/              # auth, trips, destinations, ai, flights, hotels, history
    └── middleware/          # auth (Supabase JWT), error
```

---

## Quick Start

### Step 1 — Create a Supabase project

1. Go to https://supabase.com and sign in (free account).
2. Click **"New project"**, give it a name (e.g. `atlastrip`), set a database password, and click **Create**.
3. Wait ~1 minute for the project to provision.
4. Open the **SQL Editor** (left sidebar → "SQL Editor") and paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql), then click **Run**.  
   This creates all tables, indexes, and Row-Level Security (RLS) policies.
5. Go to **Project Settings → API** and note down:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon / public** key
   - **service_role** key (keep this secret – server-side only)

---

### Step 2 — Backend API

Open a terminal in the project root:

```bash
cd backend
cp .env.example .env
```

Edit the new `.env` file and fill in **at minimum** the three Supabase values:

```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Then install dependencies and start the server:

```bash
npm install
npm run dev
```

✅ The API is ready when you see:

```
✅ Supabase connected
🚀 AtlasTrip server running on port 5000
```

> If you only see a warning (`⚠️ Supabase connection error`) check that your `.env` values match what the Supabase dashboard shows.

---

### Step 3 — Mobile App

Open a **second terminal** in the project root:

```bash
cd mobile
cp .env.example .env
```

Edit `.env` and fill in the Supabase values (the anon key is safe to expose here):

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

Then install and start:

```bash
npm install
npx expo start
```

A QR code appears in the terminal. Choose how to run:

| Option | How |
|--------|-----|
| 📱 Physical phone | Scan the QR code with the **Expo Go** app |
| 🤖 Android emulator | Press **`a`** in the Expo terminal (requires Android Studio) |
| 🍎 iOS simulator | Press **`i`** in the Expo terminal (requires Xcode on macOS) |
| 🌐 Web browser | Press **`w`** in the Expo terminal |

> **Tip — physical phone + local backend:** Your phone and computer must be on the same Wi-Fi network. Change `EXPO_PUBLIC_API_BASE_URL` in `mobile/.env` from `http://localhost:5000/api` to `http://<your-computer-LAN-IP>:5000/api`.  
> Find your LAN IP with `ipconfig` (Windows) or `ifconfig` / `ip addr` (Mac/Linux).

---

## Environment Variables

### `backend/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | API server port (default `5000`) |
| `NODE_ENV` | No | `development` or `production` |
| `SUPABASE_URL` | **Yes** | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | **Yes** | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | Supabase service-role key (server-side only) |
| `OPENAI_API_KEY` | No | GPT-4o-mini for AI trip optimizer & chatbot |
| `OPENWEATHER_API_KEY` | No | OpenWeatherMap for weather forecasts |
| `AMADEUS_CLIENT_ID` | No | Amadeus API for flight search |
| `AMADEUS_CLIENT_SECRET` | No | Amadeus API secret |
| `MAPBOX_TOKEN` | No | Mapbox for directions API |
| `CLIENT_ORIGIN` | No | CORS allowed origin (default `*`) |

### `mobile/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | **Yes** | Your Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | Supabase anon/public key |
| `EXPO_PUBLIC_API_BASE_URL` | **Yes** | Backend API base URL |
| `EXPO_PUBLIC_MAPBOX_TOKEN` | No | Mapbox token for the interactive map screen |

> Optional keys unlock extra features but the app runs without them — AI suggestions, weather, flight search, and the full map will simply be unavailable or show placeholder data.

---

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out |
| GET  | `/api/auth/me` | Current user profile |
| PUT  | `/api/auth/profile` | Update profile |

### Trips
| Method | Path | Description |
|--------|------|-------------|
| GET    | `/api/trips` | List my trips |
| POST   | `/api/trips` | Create trip |
| GET    | `/api/trips/:id` | Get trip |
| PUT    | `/api/trips/:id` | Update trip |
| DELETE | `/api/trips/:id` | Delete trip |
| POST   | `/api/trips/:id/activities` | Add activity |
| PUT    | `/api/trips/:id/activities/:actId` | Update activity |
| DELETE | `/api/trips/:id/activities/:actId` | Delete activity |
| POST   | `/api/trips/:id/share` | Generate share link |
| GET    | `/api/trips/shared/:code` | View shared trip |

### Destinations
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/destinations` | Search destinations |
| GET | `/api/destinations/trending` | Trending list |
| GET | `/api/destinations/hidden-gems` | Hidden gems |
| GET | `/api/destinations/weather/coords` | Weather by coordinates |
| GET | `/api/destinations/:id` | Destination detail |
| GET | `/api/destinations/:id/weather` | Weather forecast |

### Flights & Hotels
| Method | Path | Description |
|--------|------|-------------|
| GET  | `/api/flights/search` | Search available flights |
| POST | `/api/flights/book` | Book a flight |
| GET  | `/api/hotels/search` | Search hotels |
| POST | `/api/hotels/book` | Book a hotel |

### Travel History
| Method | Path | Description |
|--------|------|-------------|
| GET  | `/api/history` | My travel history |
| POST | `/api/history` | Add history entry |
| GET  | `/api/history/stats` | Travel statistics |

### AI
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/ai/optimize-trip` | AI itinerary optimization |
| POST | `/api/ai/recommendations` | Personalized suggestions |
| POST | `/api/ai/chat` | Travel assistant chat |

---

## Tech Stack

**Mobile**
- React Native + Expo 49
- React Navigation (Bottom Tabs + Stack)
- Three.js (WebView globe)
- react-native-maps
- Supabase JS client (auth + real-time)
- expo-blur / expo-linear-gradient
- Socket.io client (real-time collaboration)
- Axios

**Backend**
- Node.js + Express 4
- Supabase (PostgreSQL + Auth + Storage + Real-time)
- Socket.io (real-time trip collaboration)
- OpenAI GPT-4o-mini
- OpenWeatherMap API
- Amadeus API (flights)

**Database**
- Supabase PostgreSQL with Row-Level Security
- Tables: profiles, trips, trip_itineraries, destinations, flights, hotels, restaurants, events, travel_history, trip_collaborators, trip_comments, user_reviews

---

## Design System

| Token | Value |
|-------|-------|
| Background | `#0A0E1A` (navy dark) |
| Card | `#1A2238` |
| Accent | `#F59E0B` (gold) |
| Text Primary | `#FFFFFF` |
| Text Secondary | `#94A3B8` |

---

## License

MIT © AtlasTrip
