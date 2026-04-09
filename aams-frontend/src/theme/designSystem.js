/**
 * AAMS Design System - Theme Configuration
 * Premium SaaS aesthetic with glassmorphism and smooth animations
 */

export const colors = {
  // Light Mode Colors
  light: {
    background: '#ffffff',
    surface: '#f9fafb',
    surfaceAlt: '#f3f4f6',
    border: '#e5e7eb',
    text: {
      primary: '#111827',
      secondary: '#6b7280',
      tertiary: '#9ca3af',
    },
    status: {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
    },
  },

  // Dark Mode Colors (Deep navy with purple/blue tints)
  dark: {
    background: '#0f1629', // Deep navy base
    surface: '#1a2850',   // Navy surface
    surfaceAlt: '#263d6b', // Lighter navy
    border: '#3d5a8a',    // Navy border with purple tint
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      tertiary: '#94a3b8',
    },
    status: {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#38bdf8',
    },
  },

  // Brand Colors
  brand: {
    primary: '#6b6fff',   // Deep purple-blue
    primaryDark: '#4a3ae3',
    secondary: '#a855f7', // Purple accent
    accent: '#06b6d4',    // Cyan accent
  },

  // Semantic Colors
  semantic: {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  },
};

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '2.5rem',
  '3xl': '3rem',
  '4xl': '4rem',
};

export const borderRadius = {
  sm: '0.25rem',
  md: '0.5rem',
  lg: '1rem',
  xl: '1.5rem',
  '2xl': '2rem',
  '3xl': '3rem',
  full: '9999px',
};

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  // Glass morphism shadows
  glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  glassDark: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
  // Glow effects
  glow: '0 0 20px rgba(106, 111, 255, 0.4)',
  glowPrimary: '0 0 30px rgba(106, 111, 255, 0.3)',
};

export const typography = {
  // Heading styles
  heading: {
    h1: {
      fontSize: '2.25rem',
      lineHeight: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '1.875rem',
      lineHeight: '2.25rem',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.5rem',
      lineHeight: '2rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.25rem',
      lineHeight: '1.75rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.125rem',
      lineHeight: '1.75rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      lineHeight: '1.5rem',
      fontWeight: 600,
    },
  },
  // Body text
  body: {
    lg: {
      fontSize: '1.125rem',
      lineHeight: '1.75rem',
    },
    base: {
      fontSize: '1rem',
      lineHeight: '1.5rem',
    },
    sm: {
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
    },
    xs: {
      fontSize: '0.75rem',
      lineHeight: '1rem',
    },
  },
};

export const transitions = {
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
  slower: '500ms',
  timing: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

export const animations = {
  // Page transitions
  pageEnter: {
    duration: 0.3,
    easing: 'easeInOut',
  },
  pageExit: {
    duration: 0.2,
    easing: 'easeIn',
  },
  // Component animations
  cardHover: {
    duration: 0.2,
    easing: 'easeOut',
  },
  buttonRipple: {
    duration: 0.6,
    easing: 'linear',
  },
  loadingShimmer: {
    duration: 2,
    easing: 'easeInOut',
    repeat: 'infinite',
  },
};

export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  offcanvas: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};

export default {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
  transitions,
  animations,
  breakpoints,
  zIndex,
};
