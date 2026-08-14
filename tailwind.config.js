/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'], // For UI elements
        arabic: ['"Noto Naskh Arabic"', '"Amiri"', 'serif'], // For Book content
      },
      colors: {
        reader: {
          paper: '#fdfcf8', // Kindle-like paper
          white: '#ffffff',
          sage: '#e8ece1',
          sepia: '#f4ecd8',
          dark: '#121212',
          text: {
            light: '#1a1a1a', // standard text
            dark: '#e0e0e0',
          }
        },
        brand: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#a37c6c', // Main theme color, a premium brownish-gold
          600: '#8c6b5d',
          700: '#75594e',
          800: '#5e483e',
          900: '#47362f',
        }
      },
      boxShadow: {
        'clay': 'inset 2px 2px 5px rgba(255,255,255,0.7), inset -3px -3px 7px rgba(0,0,0,0.04), 4px 4px 10px rgba(0,0,0,0.03)',
        'clay-active': 'inset 4px 4px 8px rgba(0,0,0,0.05), inset -4px -4px 8px rgba(255,255,255,0.7)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' }
        }
      }
    },
  },
  plugins: [],
}
