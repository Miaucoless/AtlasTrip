import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor – attach auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor – handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('refreshToken');
    }
    return Promise.reject(error);
  },
);

// ── Trips ────────────────────────────────────────────────────────────────────

export const getTrips = () => api.get('/trips');

export const createTrip = (data) => api.post('/trips', data);

export const getTripById = (id) => api.get(`/trips/${id}`);

export const updateTrip = (id, data) => api.put(`/trips/${id}`, data);

export const deleteTrip = (id) => api.delete(`/trips/${id}`);

export const addActivity = (tripId, data) => api.post(`/trips/${tripId}/activities`, data);

export const updateActivity = (tripId, actId, data) =>
  api.put(`/trips/${tripId}/activities/${actId}`, data);

export const deleteActivity = (tripId, actId) =>
  api.delete(`/trips/${tripId}/activities/${actId}`);

export const shareTrip = (tripId) => api.post(`/trips/${tripId}/share`);

export const getSharedTrip = (shareCode) => api.get(`/trips/shared/${shareCode}`);

// ── Destinations ─────────────────────────────────────────────────────────────

export const searchDestinations = (query, category) =>
  api.get('/destinations', { params: { q: query, category } });

export const getTrendingDestinations = () => api.get('/destinations/trending');

export const getHiddenGems = () => api.get('/destinations/hidden-gems');

export const getDestination = (id) => api.get(`/destinations/${id}`);

export const getDestinationWeather = (id) => api.get(`/destinations/${id}/weather`);

// ── AI ────────────────────────────────────────────────────────────────────────

export const optimizeTrip = (tripId) => api.post('/ai/optimize-trip', { tripId });

export const getRecommendations = (preferences) =>
  api.post('/ai/recommendations', preferences);

export const chatWithAssistant = (message, history) =>
  api.post('/ai/chat', { message, history });

export default api;
