/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0B6FA8', 50: '#E9F3F9', 100: '#CBE4F1', 600: '#095A87', 700: '#074567' },
        coral: { DEFAULT: '#E90895', 50: '#FDEAF5', 100: '#F6C9E4' },
        gold: { DEFAULT: '#E8B84B', 50: '#FBF3E4' },
        // Fond des barres latérales et des écrans de connexion : le bleu nuit
        // du logo, et non plus un noir neutre — même identité que le site.
        ink: '#072742',
        ardoise: '#0B3358',
      },
    },
  },
  plugins: [],
};
