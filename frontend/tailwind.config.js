/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "e-black": "#171613",
        "e-hover": "#8f603c",
        atelier: {
          paper: "#f3eee5",
          canvas: "#e8dfd1",
          ink: "#201d19",
          muted: "#746c60",
          clay: "#a76d48",
          olive: "#69715a",
          line: "#d8cebf",
          night: "#191a17",
          "night-surface": "#242521",
          "night-line": "#41413a",
        },
      },
      fontFamily: {
        display: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["DM Sans", "Arial", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["clamp(3.5rem, 9vw, 8rem)", { lineHeight: "0.88", letterSpacing: "-0.055em" }],
        "display-lg": ["clamp(2.75rem, 6vw, 5.5rem)", { lineHeight: "0.94", letterSpacing: "-0.045em" }],
        "display-md": ["clamp(2rem, 4vw, 3.5rem)", { lineHeight: "1", letterSpacing: "-0.035em" }],
      },
      borderRadius: {
        atelier: "0.25rem",
        "atelier-lg": "0.75rem",
      },
      boxShadow: {
        atelier: "0 18px 60px rgba(32, 29, 25, 0.12)",
        float: "0 24px 70px rgba(32, 29, 25, 0.18)",
      },
      zIndex: {
        header: "50",
        overlay: "90",
        drawer: "100",
        toast: "120",
      },
      transitionDuration: {
        micro: "180ms",
        standard: "320ms",
        emphasis: "560ms",
      },
    },
  },
  plugins: [],
}