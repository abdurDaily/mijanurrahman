/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './js/**/*.js'],
  theme: {
    extend: {
      colors: {
        paper: '#F5F2EB',
        sand: '#EAE5DB',
        ink: '#171717',
        mute: '#6E6A62', // #77736B darkened slightly for WCAG AA on paper
        gold: { DEFAULT: '#A47B45', deep: '#7E5B2E', soft: '#C9A774' },
        night: { DEFAULT: '#151515', 2: '#1D1C1A', line: '#2C2A27' },
        ivory: '#F5F2EB',
      },
      fontFamily: {
        // Bengali fallbacks are listed so mixed-script text renders correctly per glyph.
        display: ['"Cormorant Garamond"', '"Noto Serif Bengali"', 'Georgia', 'serif'],
        sans: ['Inter', '"Hind Siliguri"', 'system-ui', 'sans-serif'],
        bnserif: ['"Noto Serif Bengali"', 'serif'],
        bn: ['"Hind Siliguri"', 'sans-serif'],
      },
      letterSpacing: { label: '0.22em' },
      maxWidth: { site: '1440px' },
      transitionTimingFunction: { expo: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    },
  },
  plugins: [],
};
