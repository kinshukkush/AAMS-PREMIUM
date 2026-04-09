import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Axios instance shared across app
export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

// SECURITY FIX: Add promise-based token refresh lock to prevent race conditions
let tokenRefreshPromise = null;

// Attach token to every request automatically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('aams_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401 with proper locking to prevent race conditions
apiClient.interceptors.response.use(
  (res) => res.data,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('aams_refresh');
        if (refreshToken) {
          // SECURITY FIX: Use locking pattern to ensure only one refresh happens at a time
          if (!tokenRefreshPromise) {
            tokenRefreshPromise = axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
              .finally(() => {
                tokenRefreshPromise = null;
              });
          }
          
          const res = await tokenRefreshPromise;
          const newToken = res.data.data.accessToken;
          localStorage.setItem('aams_token', newToken);
          original.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(original);
        }
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data || { message: error.message });
  }
);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true on mount while restoring session

  // Restore session from localStorage on app load
  useEffect(() => {
    const token = localStorage.getItem('aams_token');
    const storedUser = localStorage.getItem('aams_user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        // Verify token is still valid in background
        apiClient.get('/auth/me')
          .then((res) => {
            const freshUser = res.data?.user || res.user;
            if (freshUser) {
              setUser(freshUser);
              localStorage.setItem('aams_user', JSON.stringify(freshUser));
            }
          })
          .catch(() => {
            // Token expired and refresh failed — force logout
            localStorage.clear();
            setUser(null);
          });
      } catch {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user: userData } = res.data;

      localStorage.setItem('aams_token', accessToken);
      localStorage.setItem('aams_refresh', refreshToken);
      localStorage.setItem('aams_user', JSON.stringify(userData));

      setUser(userData);
      setLoading(false);
      return { success: true, role: userData.role };
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message || 'Invalid credentials' };
    }
  };

  const logout = async () => {
    try { await apiClient.post('/auth/logout'); } catch { /* ignore */ }
    localStorage.removeItem('aams_token');
    localStorage.removeItem('aams_refresh');
    localStorage.removeItem('aams_user');
    setUser(null);
  };

  // Helper to get initials for avatar
  const getAvatar = (name = '') =>
    name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, getAvatar, apiClient }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
