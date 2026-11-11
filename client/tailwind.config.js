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
        brand: {
          black: 'rgb(var(--ink) / <alpha-value>)',
          white: 'rgb(var(--surface) / <alpha-value>)',
          offwhite: 'rgb(var(--page) / <alpha-value>)',
          charcoal: 'rgb(var(--body) / <alpha-value>)',
          accent: 'rgb(var(--accent) / <alpha-value>)',
          accentHover: 'rgb(var(--accent-hover) / <alpha-value>)',
          onAccent: 'rgb(var(--on-accent) / <alpha-value>)',
          muted: 'rgb(var(--muted) / <alpha-value>)',
          border: 'rgb(var(--line) / <alpha-value>)',
          night: '#0a0a0a',
          snow: '#ffffff',
        },
        gray: { 50: 'rgb(var(--gray-50) / <alpha-value>)', 100: 'rgb(var(--gray-100) / <alpha-value>)', 200: 'rgb(var(--gray-200) / <alpha-value>)', 300: 'rgb(var(--gray-300) / <alpha-value>)', 400: 'rgb(var(--gray-400) / <alpha-value>)', 500: 'rgb(var(--gray-500) / <alpha-value>)', 600: 'rgb(var(--gray-600) / <alpha-value>)', 700: 'rgb(var(--gray-700) / <alpha-value>)', 900: 'rgb(var(--gray-900) / <alpha-value>)' },
        red: { 50: 'rgb(var(--red-50) / <alpha-value>)', 100: 'rgb(var(--red-100) / <alpha-value>)', 200: 'rgb(var(--red-200) / <alpha-value>)', 300: 'rgb(var(--red-300) / <alpha-value>)', 500: 'rgb(var(--red-500) / <alpha-value>)', 600: 'rgb(var(--red-600) / <alpha-value>)', 700: 'rgb(var(--red-700) / <alpha-value>)', 800: 'rgb(var(--red-800) / <alpha-value>)' },
        green: { 50: 'rgb(var(--green-50) / <alpha-value>)', 100: 'rgb(var(--green-100) / <alpha-value>)', 200: 'rgb(var(--green-200) / <alpha-value>)', 600: 'rgb(var(--green-600) / <alpha-value>)', 700: 'rgb(var(--green-700) / <alpha-value>)', 800: 'rgb(var(--green-800) / <alpha-value>)' },
        amber: { 50: 'rgb(var(--amber-50) / <alpha-value>)', 100: 'rgb(var(--amber-100) / <alpha-value>)', 600: 'rgb(var(--amber-600) / <alpha-value>)', 700: 'rgb(var(--amber-700) / <alpha-value>)', 800: 'rgb(var(--amber-800) / <alpha-value>)' },
        blue: { 50: 'rgb(var(--blue-50) / <alpha-value>)', 700: 'rgb(var(--blue-700) / <alpha-value>)', 900: 'rgb(var(--blue-900) / <alpha-value>)' },
        purple: { 50: 'rgb(var(--purple-50) / <alpha-value>)', 700: 'rgb(var(--purple-700) / <alpha-value>)' },
        indigo: { 50: 'rgb(var(--indigo-50) / <alpha-value>)', 700: 'rgb(var(--indigo-700) / <alpha-value>)' },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'ui-serif', 'Georgia', 'serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
