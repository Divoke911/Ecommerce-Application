/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#e8f0fe',
          100: '#c5d8fc',
          500: '#2874f0',
          600: '#1a5dc8',
          700: '#1347a0',
        }
      }
    },
  },
  plugins: [],
}