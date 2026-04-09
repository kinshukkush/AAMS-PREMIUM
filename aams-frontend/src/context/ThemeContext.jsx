import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('aams-theme') || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    // Remove both classes first
    root.classList.remove('dark', 'light');
    // Add the current theme class
    root.classList.add(theme);
    // Also set data attribute for compatibility
    root.setAttribute('data-theme', theme);
    localStorage.setItem('aams-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
