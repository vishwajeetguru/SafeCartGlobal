import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        elixir: {
          50: "#f2f7ed",
          100: "#e2edd8",
          500: "#4a7c3a",
          600: "#3a6330",
          900: "#1a2e18",
        },
      },
      animation: {
        "scroll-dot": "scrollDot 2s ease-in-out infinite",
        "scroll-line": "scrollLine 2s ease-in-out infinite",
        "fade-up": "fadeUp 1s ease-out both",
      },
      keyframes: {
        scrollDot: {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "70%": { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "0" },
        },
        scrollLine: {
          "0%": { transform: "scaleY(0)", transformOrigin: "top" },
          "45%": { transform: "scaleY(1)", transformOrigin: "top" },
          "55%": { transform: "scaleY(1)", transformOrigin: "bottom" },
          "100%": { transform: "scaleY(0)", transformOrigin: "bottom" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
