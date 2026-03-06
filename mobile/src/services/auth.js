import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

const TOKEN_KEY = 'authToken';
const REFRESH_KEY = 'refreshToken';
const USER_KEY = 'currentUser';

export async function login(email, password) {
  const response = await api.post('/auth/login', { email, password });
  const { token, refreshToken, user } = response.data;
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(REFRESH_KEY, refreshToken);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export async function register(name, email, password) {
  const response = await api.post('/auth/register', { name, email, password });
  const { token, refreshToken, user } = response.data;
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(REFRESH_KEY, refreshToken);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export async function logout() {
  try {
    await api.post('/auth/logout');
  } catch {
    // Continue with local cleanup even if server call fails
  }
  await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_KEY, USER_KEY]);
}

export async function refreshToken() {
  const refresh = await AsyncStorage.getItem(REFRESH_KEY);
  if (!refresh) throw new Error('No refresh token');
  const response = await api.post('/auth/refresh', { refreshToken: refresh });
  await AsyncStorage.setItem(TOKEN_KEY, response.data.token);
  return response.data.token;
}

export async function getCurrentUser() {
  const stored = await AsyncStorage.getItem(USER_KEY);
  return stored ? JSON.parse(stored) : null;
}

export async function getStoredToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function updateProfile(data) {
  const response = await api.put('/auth/profile', data);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
  return response.data.user;
}

export async function isAuthenticated() {
  const token = await getStoredToken();
  return !!token;
}
