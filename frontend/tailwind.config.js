// frontend/tailwind.config.js

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          light: "#4b9ce2",
          dark: "#1e3a8a",
        },
      },
    },
  },
  plugins: [],
};
