/**
 * AuthContext - Mobile Authentication Management
 * JWT tokens, login/logout, user state
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'faculty' | 'student' | 'parent';
  avatar?: string;
  department?: string;
  enrolledCourses?: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('aams_token');
      const savedUser = await AsyncStorage.getItem('aams_user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));

        // Verify token with backend
        verifyToken(savedToken);
      }
    } catch (error) {
      console.warn('Auth initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyToken = async (token: string) => {
    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      console.warn('Token verification error:', error);
      clearAuth();
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });

      const { token: newToken, user: userData } = response.data;

      // Save to AsyncStorage
      await AsyncStorage.setItem('aams_token', newToken);
      await AsyncStorage.setItem('aams_user', JSON.stringify(userData));

      // Set in context
      setToken(newToken);
      setUser(userData);

      // Set axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint if needed
      try {
        await axios.post(`${API_URL}/api/auth/logout`);
      } catch (e) {
        // Ignore errors
      }

      clearAuth();
    } catch (error) {
      console.warn('Logout error:', error);
    }
  };

  const clearAuth = async () => {
    await AsyncStorage.removeItem('aams_token');
    await AsyncStorage.removeItem('aams_user');
    setUser(null);
    setToken(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const register = async (data: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, data);
      const { token: newToken, user: userData } = response.data;

      await AsyncStorage.setItem('aams_token', newToken);
      await AsyncStorage.setItem('aams_user', JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);

      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    register,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
