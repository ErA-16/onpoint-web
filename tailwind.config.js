/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#E62B2B",
          hover: "#FF3131",
          dark: "#B71C1C",
        },
        surface: "#F8F8F6",
      },
      borderRadius: {
        xl2: "10px",
      },
    },
  },
  plugins: [],
};
