/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"SF Pro Display"',
          '"SF Pro Text"',
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        // Theme-aware tokens (values live in index.css)
        canvas: "var(--bg)",
        ink: "var(--text)",
        muted: "var(--muted)",
        accent: { DEFAULT: "#0a84ff", soft: "#64d2ff" },
        macro: {
          protein: "#ff375f",
          fat: "#ff9f0a",
          carbs: "#30b0ff",
          fiber: "#30d158",
        },
      },
      borderRadius: {
        "4xl": "2rem",
      },
      keyframes: {
        float: {
          "0%": { transform: "translate3d(0,0,0) scale(1)" },
          "100%": { transform: "translate3d(40px,-50px,0) scale(1.1)" },
        },
        scan: {
          "0%": { top: "6%" },
          "100%": { top: "94%" },
        },
      },
      animation: {
        float: "float 18s ease-in-out infinite alternate",
        "float-slow": "float 26s ease-in-out infinite alternate",
        scan: "scan 2.4s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [],
};