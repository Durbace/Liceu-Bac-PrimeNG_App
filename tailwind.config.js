/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      animation: {
        'glow-border': 'borderGlow 3.5s ease-in-out infinite',
        'shine': 'shineEffect 2.5s ease-in-out infinite',
        'fade-in': 'fadeIn 1s ease-out forwards',
        'typewriter': 'typewriter 3s steps(30) 1s forwards, blinkCursor 1s steps(2, start) infinite',
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
        fadeIn: { 
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        typewriter: {
          '0%': { width: '0', opacity: 0 },
          '1%': { opacity: 1 },
          '100%': { width: '100%' }
        },
        blinkCursor: {
          '0%, 100%': { borderColor: 'transparent' },
          '50%': { borderColor: '#6B21A8' },
        },
      },
    },
  },
  plugins: [],
};
