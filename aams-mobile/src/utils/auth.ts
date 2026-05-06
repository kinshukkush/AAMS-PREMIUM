/**
 * Auth utilities for mobile — use AsyncStorage (not localStorage which is web-only)
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');

/** Returns Authorization header with stored JWT token */
export const getAuthHeader = async (): Promise<{ Authorization: string }> => {
  const token = await AsyncStorage.getItem('aams_token');
  return { Authorization: `Bearer ${token || ''}` };
};

/** Returns the stored user object */
export const getStoredUser = async (): Promise<any | null> => {
  try {
    const raw = await AsyncStorage.getItem('aams_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/** Pre-configured axios instance with token injection */
export const apiClient = axios.create({ baseURL: `${API_URL}/api` });

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('aams_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
