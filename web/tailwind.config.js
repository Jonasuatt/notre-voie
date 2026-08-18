/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Palette reprise de la maquette produit fournie (notre-voie-maquette-produit.html)
        navy: '#0B6FA8',
        navy2: '#0E8FD6',
        coral: '#E6008C',
        gold: '#E8B84B',
        cream: '#F7F7F5',
        ink: '#14141F',
        muted: '#6B7280',
        line: '#E7E7EA',
      },
      fontFamily: {
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-space-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};
