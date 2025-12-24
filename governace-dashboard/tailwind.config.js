/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          600: "#16a34a",
          700: "#15803d",
        },
      },
    },
  },
  plugins: [],
};
