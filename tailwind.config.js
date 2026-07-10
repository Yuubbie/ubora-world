/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#16233F",
        ink2: "#1F3A66",
        paper: "#F3F5F4",
        gold: "#C99A2E",
        golddeep: "#8C6D1F",
        green: "#2E7D5B",
        coral: "#B23A2E",
        line: "#DCE1E6",
        muted: "#5B6570",
      },
    },
  },
  plugins: [],
};
