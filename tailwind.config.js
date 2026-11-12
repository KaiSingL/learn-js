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
        // Concept studio theme tokens (src/studio) — CSS vars defined in
        // studio.css; the cs-* family flips with prefers-color-scheme,
        // the cs-chip-* family is light in both modes. See the token
        // comment at the top of studio.css.
        "cs-paper": "var(--cs-paper)",
        "cs-ink": "var(--cs-ink)",
        "cs-muted": "var(--cs-muted)",
        "cs-faint": "var(--cs-faint)",
        "cs-line": "var(--cs-line)",
        "cs-chip": "var(--cs-chip)",
        "cs-chip-soft": "var(--cs-chip-soft)",
        "cs-chip-line": "var(--cs-chip-line)",
        "cs-chip-edge": "var(--cs-chip-edge)",
        "cs-chip-ink": "var(--cs-chip-ink)",
        "cs-chip-muted": "var(--cs-chip-muted)",
        "cs-chip-faint": "var(--cs-chip-faint)",
        "cs-chip-strong": "var(--cs-chip-strong)",
        "cs-chip-strong-ink": "var(--cs-chip-strong-ink)",
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
