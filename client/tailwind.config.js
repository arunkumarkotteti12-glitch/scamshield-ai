/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c3d5fe',
          300: '#95b5fd',
          400: '#608afa',
          500: '#3b60f6',
          600: '#253ee8',
          700: '#1d2dd5',
          800: '#1e26ad',
          900: '#1e2489',
          950: '#0f1353',
        },
        dark: {
          900: '#090d16',
          800: '#111827',
          700: '#1f293d',
          600: '#374151'
        }
      },
      animation: {
        'radar-sweep': 'radarSweep 2.5s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'particle-float': 'particleFloat 4s ease-in-out infinite',
      },
      keyframes: {
        radarSweep: {
          '0%': { top: '0%' },
          '50%': { top: '100%' },
          '100%': { top: '0%' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.02)' },
        },
        particleFloat: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
