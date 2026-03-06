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

## Opening the Project

### If you see a "Select how to open the repository" dialog (VS Code)

1. Click **"Select Directory…"**
2. Navigate to the folder where you cloned AtlasTrip (e.g. `~/Projects/AtlasTrip`)
3. Click **Open**

VS Code will open the project and you're ready for the steps below.

### Haven't cloned yet?

```bash
git clone https://github.com/Miaucoless/AtlasTrip.git
cd AtlasTrip
```

Then open the folder in your editor:

```bash
# VS Code
code .
```

---

## Prerequisites

Install the following before running the app:

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 18 | https://nodejs.org |
| npm | ≥ 9 | bundled with Node.js |
| Expo Go (phone) | latest | [iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) |
| MongoDB | any | https://www.mongodb.com/try/download/community |

> **No physical device?** Install [Android Studio](https://developer.android.com/studio) (Android emulator) or use Xcode on macOS (iOS simulator).

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

You need **two terminal windows** — one for the backend, one for the mobile app.

### Terminal 1 — Backend API

```bash
cd backend
cp .env.example .env        # create your local config file
```

Open the new `.env` file and set at minimum:

```
MONGODB_URI=mongodb://localhost:27017/atlastrip
JWT_SECRET=any-long-random-string
JWT_REFRESH_SECRET=another-long-random-string
```

Then install and start:

```bash
npm install
npm run dev
```

✅ The API is ready when you see: `Server running on port 5000`

---

### Terminal 2 — Mobile App

```bash
cd mobile
npm install
npx expo start
```

A QR code appears in the terminal. Choose how to run:

| Option | How |
|--------|-----|
| 📱 Physical phone | Scan the QR code with the **Expo Go** app |
| 🤖 Android emulator | Press **`a`** (requires Android Studio) |
| 🍎 iOS simulator | Press **`i`** (requires Xcode on macOS) |
| 🌐 Web browser | Press **`w`** |

> **Tip — phone + local backend:** If running on a physical device, update `mobile/src/utils/constants.js` and change `API_URL` from `http://localhost:5000` to `http://<your-computer-IP>:5000` (find your IP with `ipconfig` on Windows or `ifconfig` on Mac/Linux).

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
