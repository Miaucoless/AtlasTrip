# AtlasTrip ✈️

A premium React Native travel planning app built with Expo and backed by a Node.js/Express API.

## Features

- 🌍 **Interactive 3D Globe** – Three.js spinning Earth with city markers
- ✈️ **Trip Planning** – Create, organize, and share detailed itineraries
- 🗺 **Map Exploration** – Full-screen map with custom category markers
- 🔍 **Discover** – Trending destinations, hidden gems, and live city pulse
- 🤖 **AI Assistant** – GPT-powered trip optimization and travel chatbot
- 🌤 **Weather** – Real-time forecasts per destination
- 🔒 **Auth** – JWT + refresh-token authentication

---

## Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- Expo CLI (`npm install -g expo-cli`)
- MongoDB (local or Atlas)
- (Optional) OpenAI API key
- (Optional) OpenWeatherMap API key

---

## Project Structure

```
AtlasTrip/
├── mobile/          # React Native (Expo) app
│   ├── App.js
│   ├── babel.config.js
│   ├── package.json
│   └── src/
│       ├── screens/         # HomeScreen, TripsScreen, DiscoverScreen, MapScreen, ProfileScreen
│       ├── components/      # Globe, GlassmorphicCard
│       ├── navigation/      # AppNavigator (Bottom Tabs)
│       ├── services/        # api.js, auth.js
│       ├── hooks/           # useAuth.js
│       └── utils/           # constants.js
└── backend/         # Node.js / Express API
    ├── server.js
    ├── config/      # db.js
    ├── models/      # User, Trip, Destination
    ├── routes/      # auth, trips, destinations, ai
    ├── middleware/  # auth, error
    └── .env.example
```

---

## Quick Start

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secrets, and API keys
npm install
npm run dev
```

The API will be available at `http://localhost:5000`.

### 2. Mobile App

```bash
cd mobile
npm install
npx expo start
```

Then press:
- **`i`** – open in iOS Simulator
- **`a`** – open in Android Emulator
- **Scan QR** – open in Expo Go on your device

---

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out |
| POST | `/api/auth/refresh` | Refresh token |
| GET  | `/api/auth/me` | Current user |
| PUT  | `/api/auth/profile` | Update profile |

### Trips
| Method | Path | Description |
|--------|------|-------------|
| GET    | `/api/trips` | List trips |
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
| GET | `/api/destinations/:id` | Destination detail |
| GET | `/api/destinations/:id/weather` | Weather forecast |

### AI
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/ai/optimize-trip` | AI itinerary optimization |
| POST | `/api/ai/recommendations` | Personalized suggestions |
| POST | `/api/ai/chat` | Travel assistant chat |

---

## Environment Variables

See [`backend/.env.example`](backend/.env.example) for a full list of required environment variables.

---

## Tech Stack

**Mobile**
- React Native + Expo 49
- React Navigation (Bottom Tabs + Stack)
- Three.js (WebView globe)
- react-native-maps
- expo-blur / expo-linear-gradient
- Socket.io client (real-time collaboration)
- Axios

**Backend**
- Node.js + Express 4
- MongoDB + Mongoose 7
- JWT authentication (access + refresh tokens)
- Socket.io (real-time trip collaboration)
- OpenAI GPT-4o-mini
- OpenWeatherMap API

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
