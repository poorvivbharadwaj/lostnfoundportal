/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#070711',
          800: '#0f0f1a',
          700: '#13131f',
          600: '#1a1a2e',
          500: '#22223a',
          400: '#2d2d4a',
          300: '#3a3a5c',
        },
        accent: {
          purple: '#6366f1',
          violet: '#7c3aed',
          blue: '#3b82f6',
          light: '#a5b4fc',
          glow: '#818cf8',
        },
        found: '#10b981',
        lost: '#f59e0b',
        danger: '#ef4444',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideIn: { from: { opacity: 0, transform: 'translateX(-20px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        pulseGlow: { '0%, 100%': { boxShadow: '0 0 5px #6366f1' }, '50%': { boxShadow: '0 0 20px #6366f1, 0 0 40px #6366f1' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
};
