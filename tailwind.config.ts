import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#8A1515',
          redhover: '#6B1010',
          gold: '#F59E0B',
          goldhover: '#D97706',
          cream: '#FFFBF5',
          card: '#FFFFFF',
          dark: '#2D3748',
          muted: '#718096',
          border: '#E2E8F0',
        },
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'Poppins', 'sans-serif'],
        serif: ['var(--font-lora)', 'Lora', 'serif'],
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        card: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
