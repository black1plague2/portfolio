/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf4f0',
          100: '#fae3d6',
          200: '#f5c3a9',
          300: '#ee9a72',
          400: '#e6703a',
          500: '#d9531e',
          600: '#c04015',
          700: '#9f3012',
          800: '#812916',
          900: '#6a2417',
        },
        heritage: {
          maroon: '#7A1E1E',
          mustard: '#C89B3C',
          indigo: '#1F3A5F',
          beige: '#F5EFE6',
          charcoal: '#2B2B2B',
        },
        saas: {
          navy: '#1E2A38',
          orange: '#E67E22',
          gray: '#F4F6F8',
          gold: '#C9A227',
          slate: '#2C3E50',
        },
        handloom: {
          cream: '#f9f3e8',
          gold: '#c8a84b',
          brown: '#6b3a2a',
          green: '#2c5f2e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['"Playfair Display"', 'serif'],
      },
    },
  },
  plugins: [],
};
