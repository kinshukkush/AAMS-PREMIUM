import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('system');
  const [isDark, setIsDark] = useState(false);

  // Initialize theme from localStorage and system preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem('aams_theme') || 'system';
    setTheme(savedTheme);

    // Apply initial theme
    applyTheme(savedTheme);

    // Listen for system dark mode changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (savedTheme === 'system') {
        setIsDark(mediaQuery.matches);
        document.documentElement.classList.toggle('dark', mediaQuery.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const applyTheme = (themeMode) => {
    const root = document.documentElement;
    let isDarkMode = false;

    if (themeMode === 'dark') {
      isDarkMode = true;
    } else if (themeMode === 'light') {
      isDarkMode = false;
    } else {
      // System mode
      isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    setIsDark(isDarkMode);
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('aams_theme', newTheme);
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
