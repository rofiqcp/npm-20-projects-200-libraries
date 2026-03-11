/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        twitter: {
          blue: '#1d9bf0',
          darkBlue: '#1a8cd8',
          black: '#0f1419',
          darkGray: '#1e2732',
          gray: '#536471',
          lightGray: '#eff3f4',
          border: '#2f3336',
        },
      },
    },
  },
  plugins: [],
};
