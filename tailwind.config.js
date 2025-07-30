/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      animation: {
        'glow-border': 'borderGlow 3.5s ease-in-out infinite',
        'shine': 'shineEffect 2.5s ease-in-out infinite',
      },
      keyframes: {
        borderGlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        shineEffect: {
          '0%': { opacity: 0.4 },
          '50%': { opacity: 1 },
          '100%': { opacity: 0.4 },
        },
      },
    },
  },
  plugins: [],
};
