/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff8f5',
          100: '#ffede6',
          500: '#ff671f',
          600: '#e65c1c',
          700: '#cc5219',
        }
      }
    },
  },
  plugins: [],
}
