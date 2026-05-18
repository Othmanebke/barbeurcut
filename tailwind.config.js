/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand:     '#C68E17',   // amber gold — moodboard
        brandDark: '#9A6B10',   // deep gold hover
        brandLight:'#F0DFA0',   // pale gold tint
        dark:      '#4A2F1A',   // deep warm brown — moodboard
        darkMid:   '#3D2710',   // slightly darker brown for navbar
        beige:     '#D2C0A5',   // warm beige — moodboard
        cream:     '#FFF8E7',   // off-white cream — moodboard
        creamMid:  '#F0E9D6',   // slightly deeper cream
        muted:     '#8C7A6B',   // warm grey
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
        warm: '0 24px 64px rgba(74, 47, 26, 0.18)',
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
