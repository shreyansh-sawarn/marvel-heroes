/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        marvel: {
          red: '#E23636',
          darkRed: '#961111',
          gold: '#F3D403',
          darkGold: '#B89700',
          blue: '#0B3C5D',
          skyBlue: '#00B4D8',
          spideyRed: '#E62429',
          spideyBlue: '#0A2540',
          comicDark: '#0D0E15',
          comicNavy: '#13182C',
          comicBorder: '#232946',
        }
      },
      fontFamily: {
        comic: ['"Bangers"', '"Impact"', 'system-ui', 'sans-serif'],
        display: ['"Montserrat"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.08)' },
        },
        thwipPop: {
          '0%': { transform: 'scale(0) rotate(-15deg)', opacity: '0' },
          '50%': { transform: 'scale(1.2) rotate(5deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(-3deg)', opacity: '1' },
        },
        spiderSense: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.15)' },
          '100%': { opacity: '0', transform: 'scale(1.4)' },
        }
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        pulseGlow: 'pulseGlow 2.5s ease-in-out infinite',
        thwipPop: 'thwipPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        spiderSense: 'spiderSense 1.2s ease-out infinite',
      }
    },
  },
  plugins: [],
}
