/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand:     '#C68E17',   // gold accent
        brandDark: '#9A6B10',   // deep gold hover
        brandLight:'#F0DFA0',   // pale gold tint
        dark:      '#5C4031',   // Shimmer On — fond principal
        darkMid:   '#4A3225',   // légèrement plus sombre
        denim:     '#405568',   // Dark Denim — cartes / sections UI
        denimDark: '#344558',   // hover denim
        cream:     '#F4EFEA',   // texte secondaire
        creamMid:  '#E8E0D8',   // variante cream
        muted:     '#C4B4A8',   // texte atténué sur fond sombre
        beige:     '#7A6255',   // séparateurs / bordures
        white:     '#FFFFFF',   // texte principal / boutons
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
        gold: '0 8px 32px rgba(198, 142, 23, 0.25)',
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
