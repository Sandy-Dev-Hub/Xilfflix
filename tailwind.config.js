/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'xf-bg': '#141414',
        'xf-secondary': '#181818',
        'xf-card': '#1F1F1F',
        'xf-text': '#FFFFFF',
        'xf-muted': '#B3B3B3',
        'xf-subtle': '#808080',
        'xf-red': '#E50914',
        'xf-red-hover': '#F40612',
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        fadeIn: 'fadeIn 0.5s ease forwards',
        slideUp: 'slideUp 0.5s ease forwards',
      },
    },
  },
  plugins: [],
}
