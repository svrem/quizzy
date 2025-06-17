/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'answer-button-inactive': 'var(--answer-button-inactive)',
        'answer-button-active': 'var(--answer-button-active)',
        'answer-button-hover': 'var(--answer-button-hover)',
      },
    },
  },
  plugins: [],
};
