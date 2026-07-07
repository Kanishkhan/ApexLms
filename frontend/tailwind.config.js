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
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d6e0ff',
          300: '#b3c7ff',
          350: '#9cb5ff',
          400: '#85a3ff',
          450: '#6c8cff',
          500: '#5476ff',
          550: '#4463eb',
          600: '#3350eb',
          650: '#2b45dc',
          700: '#263bcf',
          800: '#2331a7',
          900: '#222d85',
          950: '#15194f',
        },
        slate: {
          105: '#eff3f8',
          150: '#eaedf2',
          250: '#d7dee8',
          255: '#d0d9e5',
          350: '#b3c1d1',
          355: '#aebfd2',
          405: '#8a9ab0',
          450: '#7c8ba1',
          550: '#55647a',
          555: '#4e5c73',
          650: '#3d4b5f',
          750: '#293548',
          850: '#162031',
          905: '#0d1322',
          950: '#0b0f19',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
