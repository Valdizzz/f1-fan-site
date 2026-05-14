/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        petronas: '#00A19B',
      },
      animation: {
        'pulse-slow': 'pulse 20s infinite ease-in-out',
      },
    },
  },
  plugins: [],
}