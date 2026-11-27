/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        grion: {
          50: '#f2fbe9',
          100: '#e0f5c8',
          200: '#c4ea98',
          300: '#a2dc62',
          400: '#7ddc1f',
          500: '#58c20a',
          600: '#3d9100',
          700: '#2f6d1c',
          800: '#245417',
          900: '#1a3c14',
        },
        forest: '#1f4d2b',
        gold: { 400: '#ffd43b', 500: '#ffc800', 600: '#d19f00' },
        sky: { soft: '#cfeeff' },
      },
      fontFamily: {
        display: ['KOTRAHOPE', 'sans-serif'],
        sans: ['KOTRAHOPE', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        talk: {
          '0%, 100%': { transform: 'translateY(0) scale(1, 1)' },
          '25%': { transform: 'translateY(-16px) scale(1.04, 0.96)' },
          '45%': { transform: 'translateY(0) scale(0.97, 1.03)' },
          '65%': { transform: 'translateY(-6px) scale(1, 1)' },
          '85%': { transform: 'translateY(0) scale(1, 1)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-8px)' },
          '40%': { transform: 'translateX(8px)' },
          '60%': { transform: 'translateX(-5px)' },
          '80%': { transform: 'translateX(5px)' },
        },
        pop: {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '70%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(125,220,31,0.65)' },
          '50%': { boxShadow: '0 0 0 18px rgba(125,220,31,0)' },
        },
        confetti: {
          '0%': { transform: 'translateY(-12vh) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(105vh) rotate(720deg)', opacity: '0.9' },
        },
        burst: {
          '0%': { transform: 'scale(0.4) rotate(0deg)', opacity: '0' },
          '60%': { opacity: '1' },
          '100%': { transform: 'scale(1.6) rotate(25deg)', opacity: '0' },
        },
      },
      animation: {
        float: 'float 3.2s ease-in-out infinite',
        talk: 'talk 1.4s ease-in-out infinite',
        shake: 'shake 0.45s ease-in-out',
        pop: 'pop 0.4s ease-out both',
        slideUp: 'slideUp 0.28s ease-out both',
        fadeIn: 'fadeIn 0.25s ease-out both',
        glow: 'glow 1.8s ease-out infinite',
        confetti: 'confetti 3.2s linear infinite',
        burst: 'burst 1.4s ease-out infinite',
      },
    },
  },
  plugins: [],
};
