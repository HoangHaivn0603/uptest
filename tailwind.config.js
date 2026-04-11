/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'traditional-red': {
          DEFAULT: '#B91C1C',
          dark: '#991B1B',
          light: '#EF4444',
        },
        'traditional-gold': {
          DEFAULT: '#FBBF24',
          dark: '#D97706',
          light: '#FDE68A',
        },
        'viet-black': '#111827',
        'viet-cream': '#FFFBEB',
      },
      fontFamily: {
        serif: ['"Crimson Pro"', 'serif'],
        sans: ['"Outfit"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
