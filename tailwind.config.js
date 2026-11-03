/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      colors: {
        ink: "#0E0E10",
        card: "#17171A",
        card2: "#101012",
        line: "#26262B",
        paper: "#EAEAEA",
        muted: "#9A9AA0",
        accent: "#FFC52C",
        danger: "#FF4D4D",
        good: "#3DD68C",
        sky: "#7DD3FC",
      },
      fontFamily: {
        sans: ["Geist", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: {
        card: "12px",
        panel: "10px",
      },
      maxWidth: {
        prose: "62ch",
      },
    },
  },
  plugins: [],
};
