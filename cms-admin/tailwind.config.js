/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0B6FA8', 50: '#E9F3F9', 100: '#CBE4F1', 600: '#095A87', 700: '#074567' },
        coral: { DEFAULT: '#E6008C', 50: '#FDEAF5', 100: '#F6C9E4' },
        gold: { DEFAULT: '#E8B84B', 50: '#FBF3E4' },
        ink: '#14141F',
      },
    },
  },
  plugins: [],
};
