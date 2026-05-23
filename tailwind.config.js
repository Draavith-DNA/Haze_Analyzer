/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "primary": "#5af0b3",
        "primary-container": "#34d399",
        "secondary": "#ffc640",
        "secondary-container": "#e3aa00",
        "tertiary": "#ffccad",
        "tertiary-container": "#ffa668",
        "error": "#ffb4ab",
        "error-container": "#93000a",
        "background": "#0b1326",
        "surface": "#0b1326",
        "surface-bright": "#31394d",
        "surface-container-lowest": "#060e20",
        "surface-container-low": "#131b2e",
        "surface-container": "#171f33",
        "surface-container-high": "#222a3d",
        "surface-container-highest": "#2d3449",
        "on-background": "#dae2fd",
        "on-surface": "#dae2fd",
        "on-surface-variant": "#bbcac0",
        "inverse-surface": "#dae2fd",
        "inverse-on-surface": "#283044",
        "outline": "#85948b",
        "outline-variant": "#3c4a42",
        "surface-tint": "#45dfa4",
        "surface-dim": "#0b1326",
        "on-primary": "#003825",
        "on-primary-container": "#00563b",
        "on-secondary": "#402d00",
        "on-secondary-container": "#5a4100",
        "on-tertiary": "#502400",
        "on-tertiary-container": "#783901",
        "on-error": "#690005",
        "on-error-container": "#ffdad6",
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem",
      },
      spacing: {
        "unit": "4px",
        "gutter": "16px",
        "margin-desktop": "32px",
        "container-max": "1440px",
        "margin-mobile": "16px",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        "headline": ['Inter', 'sans-serif'],
        "data": ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'blink': 'blink-animation 1.5s steps(2, start) infinite',
        'scanline': 'scanline-animation 8s linear infinite',
      },
      keyframes: {
        'blink-animation': {
          'to': { visibility: 'hidden' },
        },
        'scanline-animation': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        }
      }
    },
  },
  plugins: [],
}
