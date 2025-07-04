/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'theme-accent-color': 'var(--theme-accent-color)',
        'base-text-color': 'var(--base-text-color)',
        'answer-button-inactive': 'var(--answer-button-inactive)',
        'answer-button-active': 'var(--answer-button-active)',
        'answer-button-hover': 'var(--answer-button-hover)',
        'secondary-background-color': 'var(--secondary-background-color)',
      },
      animation: {
        'fade-in-slide': 'fadeInSlide 0.5s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        fadeInSlide: {
          '0%': {
            opacity: '0',
            transform: 'translateY(-30%)', // Optional: adds a slight upward movement
          },

          '100%': { opacity: '1', transform: 'translateY(0)' }, // Optional: resets the position
        },
        fadeIn: {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
      },
    },
  },
  plugins: [],
};
