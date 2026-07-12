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
      letterSpacing: {
        tight: "-0.02em",
        tighter: "-0.03em",
      },
      boxShadow: {
        card: "0 1px 2px rgba(22,35,63,0.04), 0 8px 24px rgba(22,35,63,0.06)",
        cardHover: "0 4px 8px rgba(22,35,63,0.06), 0 16px 32px rgba(22,35,63,0.10)",
        button: "0 1px 2px rgba(22,35,63,0.10), 0 2px 8px rgba(22,35,63,0.06)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeUpScale: {
          "0%": { opacity: "0", transform: "translateY(16px) scale(0.96)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-up-scale": "fadeUpScale 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [],
};