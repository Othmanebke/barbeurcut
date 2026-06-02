/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand:     '#FFFFFF',   // blanc — accent principal
        brandDark: '#D8D0C8',   // blanc cassé — hover
        brandLight:'rgba(255,255,255,0.12)',
        dark:      '#5C4031',   // Shimmer On brown — fond principal
        darkMid:   '#4A3225',   // légèrement plus sombre
        denim:     '#405568',   // Dark Denim — cartes / sections
        denimDark: '#344558',   // hover denim
        cream:     '#F4EFEA',   // texte secondaire
        creamMid:  '#E8E0D8',   // variante
        muted:     'rgba(244,239,234,0.50)',
        beige:     '#6A5A4E',   // bordures subtiles
        white:     '#FFFFFF',
      },
      borderRadius: {
        none:    '0',
        DEFAULT: '0',
        sm:      '0',
        md:      '0',
        lg:      '0',
        xl:      '0',
        '2xl':   '0',
        '3xl':   '0',
        full:    '9999px',
      },
      fontFamily: {
        sans:    ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        warm: '0 24px 64px rgba(92, 64, 49, 0.30)',
        gold: '0 8px 32px rgba(255,255,255,0.12)',
      },
      keyframes: {
        'line-grow': {
          '0%':   { width: '0%' },
          '100%': { width: '100%' },
        },
      },
      animation: {
        'line-grow': 'line-grow 1.2s ease forwards',
      },
    },
  },
  plugins: [],
};
