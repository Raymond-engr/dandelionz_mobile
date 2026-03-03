/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "system-blue-light": "#030482",
        "system-blue-dark": "#000011",
        "system-red": "#FF4D4D",
        "system-yellow": "#FFD43B",
        "system-bg": "#F9FAFB",
        "system-divider": "#F5F7FA",
      },
      borderRadius: {
        dandelion: "10px", // --radius in design system
      },
    },
  },
  plugins: [],
};
