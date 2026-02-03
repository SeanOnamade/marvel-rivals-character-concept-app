/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'marvel-dark': '#1a1a1a',
        'marvel-metal': '#2a2a2a',
        'marvel-yellow': '#f4c430',
        'marvel-accent': '#ffd700',
        'marvel-border': '#3a3a3a',
      },
      fontFamily: {
        'marvel': ['Rajdhani', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 10px rgba(244, 196, 48, 0.5)',
        'glow-strong': '0 0 20px rgba(244, 196, 48, 0.8)',
      },
    },
  },
  plugins: [],
}
