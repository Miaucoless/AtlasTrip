import axios from 'axios';
import { getStoredToken } from './auth';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor – attach Supabase access token
api.interceptors.request.use(
  async (config) => {
    const token = await getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor – handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    return Promise.reject(error);
  },
);

// ── Trips ────────────────────────────────────────────────────────────────────

export const getTrips = (params) => api.get('/trips', { params });

export const createTrip = (data) => api.post('/trips', data);

export const getTripById = (id) => api.get(`/trips/${id}`);

export const updateTrip = (id, data) => api.put(`/trips/${id}`, data);

export const deleteTrip = (id) => api.delete(`/trips/${id}`);

export const shareTrip = (tripId) => api.post(`/trips/${tripId}/share`);

export const getSharedTrip = (shareToken) => api.get(`/trips/shared/${shareToken}`);

// ── Itinerary ─────────────────────────────────────────────────────────────────

export const getItinerary = (tripId) => api.get(`/trips/${tripId}/itinerary`);

export const addItineraryItem = (tripId, data) => api.post(`/trips/${tripId}/itinerary`, data);

export const updateItineraryItem = (tripId, itemId, data) =>
  api.put(`/trips/${tripId}/itinerary/${itemId}`, data);

export const deleteItineraryItem = (tripId, itemId) =>
  api.delete(`/trips/${tripId}/itinerary/${itemId}`);

export const reorderItinerary = (tripId, items) =>
  api.put(`/trips/${tripId}/itinerary/reorder`, { items });

// ── Collaborators ─────────────────────────────────────────────────────────────

export const getCollaborators = (tripId) => api.get(`/trips/${tripId}/collaborators`);

export const inviteCollaborator = (tripId, email, role) =>
  api.post(`/trips/${tripId}/collaborators`, { email, role });

export const updateCollaborator = (tripId, userId, updates) =>
  api.put(`/trips/${tripId}/collaborators/${userId}`, updates);

// ── Comments ──────────────────────────────────────────────────────────────────

export const getComments = (tripId) => api.get(`/trips/${tripId}/comments`);

export const addComment = (tripId, content, itemId = null) =>
  api.post(`/trips/${tripId}/comments`, { content, item_id: itemId });

// ── Votes ─────────────────────────────────────────────────────────────────────

export const voteOnActivity = (tripId, itemId, vote) =>
  api.post(`/trips/${tripId}/votes`, { item_id: itemId, vote });

// ── Destinations ─────────────────────────────────────────────────────────────

export const searchDestinations = (query, category, continent) =>
  api.get('/destinations', { params: { q: query, category, continent } });

export const getTrendingDestinations = () => api.get('/destinations/trending');

export const getHiddenGems = () => api.get('/destinations/hidden-gems');

export const getDestination = (id) => api.get(`/destinations/${id}`);

export const getDestinationWeather = (id) => api.get(`/destinations/${id}/weather`);

export const getWeatherByCoords = (lat, lon) =>
  api.get('/destinations/weather/coords', { params: { lat, lon } });

export const getCities = () => api.get('/destinations/cities');

// ── Flights ───────────────────────────────────────────────────────────────────

export const searchFlights = (params) => api.get('/flights/search', { params });

export const getUserFlights = (tripId) => api.get('/flights', { params: { trip_id: tripId } });

export const saveFlight = (data) => api.post('/flights', data);

export const deleteFlight = (id) => api.delete(`/flights/${id}`);

export const getFlightHistory = () => api.get('/flights/history/map');

// ── Hotels ────────────────────────────────────────────────────────────────────

export const getUserHotels = (tripId) => api.get('/hotels', { params: { trip_id: tripId } });

export const saveHotel = (data) => api.post('/hotels', data);

export const updateHotel = (id, data) => api.put(`/hotels/${id}`, data);

export const deleteHotel = (id) => api.delete(`/hotels/${id}`);

// ── Travel History ────────────────────────────────────────────────────────────

export const getTravelHistory = () => api.get('/history');

export const addTravelHistory = (data) => api.post('/history', data);

// ── AI ────────────────────────────────────────────────────────────────────────

export const optimizeTrip = (tripId) => api.post('/ai/optimize-trip', { tripId });

export const getRecommendations = (preferences) =>
  api.post('/ai/recommendations', preferences);

export const chatWithAssistant = (message, history, context) =>
  api.post('/ai/chat', { message, history, context });

export const generateTripStory = (tripId) => api.post('/ai/trip-story', { tripId });

export const getHiddenGemsAI = (destination) =>
  api.get(`/ai/hidden-gems/${encodeURIComponent(destination)}`);

export default api;

