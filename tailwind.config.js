/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./**/*.{html,js,jsx,ts,tsx}",  // Target all your JS, JSX, TS, and HTML files
    "!./node_modules/**/*",         // Exclude node_modules to prevent performance issues
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
