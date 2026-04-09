/**
 * ThemeContext - Mobile Theme Management
 * Dark/light mode with AsyncStorage persistence
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export const colors = {
  light: {
    bg: '#ffffff',
    bg2: '#f3f4f6',
    bg3: '#e5e7eb',
    text: '#1f2937',
    text2: '#6b7280',
    border: '#d1d5db',
    primary: '#3b82f6',
    primary_hover: '#2563eb',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    card: '#ffffff'
  },
  dark: {
    bg: '#0f1629',
    bg2: '#1e293b',
    bg3: '#334155',
    text: '#f1f5f9',
    text2: '#cbd5e1',
    border: '#475569',
    primary: '#3b82f6',
    primary_hover: '#60a5fa',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    card: '#1e293b'
  }
};

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  colors: typeof colors['light'];
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemTheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem('aams_theme');
      if (saved) {
        setThemeState(saved as Theme);
      }
    } catch (error) {
      console.warn('Error loading theme:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem('aams_theme', newTheme);
    } catch (error) {
      console.warn('Error saving theme:', error);
    }
  };

  const isDark =
    theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  const value: ThemeContextType = {
    theme,
    isDark,
    colors: isDark ? colors.dark : colors.light,
    setTheme
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
