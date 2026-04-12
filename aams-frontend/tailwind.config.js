/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Lumina Backgrounds ──
        bg: {
          base:     '#0F1117',
          surface:  '#161B27',
          elevated: '#1E2535',
          hover:    '#252D40',
          active:   '#2D3650',
        },
        // ── Lumina Accent ──
        accent: {
          DEFAULT:   '#6C8EFF',
          primary:   '#6C8EFF',
          secondary: '#A78BFA',
          glow:      'rgba(108,142,255,0.15)',
        },
        // ── Lumina Borders ──
        border: {
          subtle:  'rgba(255,255,255,0.06)',
          default: 'rgba(255,255,255,0.10)',
          strong:  'rgba(255,255,255,0.18)',
          accent:  'rgba(108,142,255,0.40)',
        },
        // ── Lumina Text ──
        txt: {
          primary:   '#E8EAF0',
          secondary: '#9BA3B8',
          muted:     '#5A6380',
          inverse:   '#0F1117',
        },
        // ── Status ──
        success: '#34D399',
        warning: '#FBBF24',
        danger:  '#F87171',
        info:    '#60A5FA',
      },

      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },

      borderRadius: {
        sm:   '6px',
        md:   '10px',
        lg:   '16px',
        xl:   '24px',
        full: '9999px',
      },

      boxShadow: {
        card:   '0 4px 24px rgba(0,0,0,0.40)',
        modal:  '0 8px 48px rgba(0,0,0,0.60)',
        glow:   '0 0 24px rgba(108,142,255,0.20)',
        glass:  '0 8px 32px rgba(0,0,0,0.30)',
        'glow-sm': '0 0 14px rgba(108,142,255,0.30)',
      },

      animation: {
        'float':       'float 3s ease-in-out infinite',
        'glow-pulse':  'glow-pulse 2s ease-in-out infinite',
        'shimmer':     'shimmer 1.6s infinite',
        'fade-up':     'fadeUp 0.5s ease forwards',
        'slide-in':    'slideIn 0.4s ease forwards',
        'scale-in':    'scaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        'fade-in':     'fadeIn 0.3s ease',
        'slide-up':    'slideUp 0.3s ease',
        'shake':       'shake 0.4s ease',
        'spin':        'spin 0.8s linear infinite',
      },

      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(108,142,255,0.15)' },
          '50%':      { boxShadow: '0 0 20px 4px rgba(108,142,255,0.15)' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to:   { backgroundPosition:  '200% 0' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-24px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shake: {
          '0%, 100%':  { transform: 'translateX(0)' },
          '20%, 60%':  { transform: 'translateX(-6px)' },
          '40%, 80%':  { transform: 'translateX(6px)' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
      },

      spacing: {
        '128': '32rem',
        '144': '36rem',
      },

      backdropBlur: {
        xs: '4px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
