/**
 * ThemeContext — Lumina Design System
 * Single permanent theme. Toggle UI removed; context kept for backward compatibility.
 */
import { createContext, useContext } from 'react';

const ThemeContext = createContext({ theme: 'lumina', toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  // Lumina is the permanent theme — no toggling.
  // The html element gets no class — globals.css handles everything.
  return (
    <ThemeContext.Provider value={{ theme: 'lumina', toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
