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
          primary: '#6366F1',
          'primary-hover': '#4F46E5',
          accent: '#06B6D4',
          'accent-hover': '#0891B2',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#F43F5E',
          bg: '#0B1020',
          surface: '#111827',
          'surface-card': 'rgba(17, 24, 39, 0.7)',
          'surface-border': 'rgba(255, 255, 255, 0.08)',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse-glow 6s ease-in-out infinite alternate',
        'float-slow': 'float 7s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-glow': {
          '0%': { opacity: '0.4', transform: 'scale(0.98)' },
          '100%': { opacity: '0.8', transform: 'scale(1.02)' },
        },
        float: {
          '0%': { transform: 'translateY(0px)' },
          '100%': { transform: 'translateY(-12px)' },
        },
      },
    },
  },
  plugins: [],
}
