/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: {
          base:    'hsl(var(--bg-base) / <alpha-value>)',
          surface: 'hsl(var(--bg-surface) / <alpha-value>)',
          card:    'hsl(var(--bg-card) / <alpha-value>)',
          input:   'hsl(var(--bg-input) / <alpha-value>)',
        },
        text: {
          primary: 'hsl(var(--text-primary) / <alpha-value>)',
          secondary: 'hsl(var(--text-secondary) / <alpha-value>)',
          muted: 'hsl(var(--text-secondary) / 0.5)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          hover:   'hsl(var(--accent-hover) / <alpha-value>)',
          muted:   'hsl(var(--accent-muted) / <alpha-value>)',
        },
        border: {
          DEFAULT: 'var(--border-subtle)',
          light:   'var(--border-light)',
        }
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        sans:    ['Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'xl':  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      keyframes: {
        fadeUp:    { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideIn:   { from: { opacity: '0', transform: 'translateX(-10px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        pulseGlow: { '0%, 100%': { opacity: '0.6' }, '50%': { opacity: '1' } },
        float:     { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
      },
      animation: {
        'fade-up':    'fadeUp 0.4s ease-out',
        'slide-in':   'slideIn 0.3s ease-out',
        'shimmer':    'shimmer 2.5s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float':      'float 4s ease-in-out infinite',
      },
      boxShadow: {
        'glow-sm':  '0 0 20px hsl(327 100% 62% / 0.25)',
        'glow':     '0 0 40px hsl(327 100% 62% / 0.3), 0 0 80px hsl(327 100% 62% / 0.1)',
        'glow-lg':  '0 0 60px hsl(327 100% 62% / 0.4), 0 0 120px hsl(327 100% 62% / 0.15)',
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, hsl(327 100% 62%), hsl(35 100% 65%))',
        'gradient-cta': 'linear-gradient(135deg, hsl(327 100% 62%) 0%, hsl(280 100% 65%) 100%)',
      }
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
  ],
};
