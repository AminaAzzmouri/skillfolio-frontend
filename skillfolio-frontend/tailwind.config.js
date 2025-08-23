/* Docs: see docs/tailwind.config.js.md */

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0EA5E9",   // Sky Blue
        secondary: "#22C55E", // Green
        background: "#0F172A", // Deep Navy
        text: "#F1F5F9",       // Light Gray
        accent: "#EAB308",     // Yellow
      },
      fontFamily: {
        heading: ['"Roboto Mono"', "monospace"],
        body: ['Roboto', "sans-serif"],
      },
    },
  },
  plugins: [],
}
