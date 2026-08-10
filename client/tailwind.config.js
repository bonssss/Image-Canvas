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
        brand: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#111111',
          600: '#000000',
          700: '#0f172a',
          800: '#020617',
          900: '#000000',
        },
        unsplash: {
          black: '#111111',
          dark: '#1a1a1a',
          gray: '#767676',
          lightgray: '#d1d5db',
          border: '#e5e5e5',
          bg: '#f8f8f8',
        },
        dark: {
          bg: '#111111',
          surface: '#181818',
          card: '#202020',
          border: '#2a2a2a',
          hover: '#262626',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.97)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out forwards',
        scaleUp: 'scaleUp 0.2s ease-out forwards',
      },
    },
  },
  plugins: [],
}
