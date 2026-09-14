import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      colors: {
        lumo: {
          "ink-deep": "var(--lumo-ink-deep)",
          ink: "var(--lumo-ink)",
          "ink-soft": "var(--lumo-ink-soft)",
          turquoise: "var(--lumo-turquoise)",
          mint: "var(--lumo-mint)",
          lime: "var(--lumo-lime)",
          frost: "var(--lumo-background)",
          slate: "var(--lumo-text-muted)",
          "surface-soft": "var(--lumo-surface-soft)",
          ai: "var(--lumo-ai)",
        },
        border: "var(--lumo-border)",
        background: "var(--lumo-background)",
        foreground: "var(--lumo-text)",
        muted: {
          DEFAULT: "var(--lumo-surface-soft)",
          foreground: "var(--lumo-text-muted)",
        },
        card: {
          DEFAULT: "var(--lumo-surface)",
          foreground: "var(--lumo-text)",
        },
        primary: {
          DEFAULT: "var(--lumo-ink)",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "var(--lumo-turquoise)",
          foreground: "var(--lumo-ink)",
        },
        ai: {
          DEFAULT: "var(--lumo-ai)",
          foreground: "var(--lumo-ink)",
        },
        success: "var(--lumo-success)",
        warning: "var(--lumo-warning)",
        danger: "var(--lumo-danger)",
        info: "var(--lumo-info)",
      },
      borderRadius: {
        sm: "8px",
        DEFAULT: "12px",
        lg: "14px",
        xl: "16px",
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgb(6 43 36 / 0.04), 0 1px 6px -1px rgb(6 43 36 / 0.08)",
        popover: "0 8px 24px -4px rgb(6 43 36 / 0.16)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in-right": {
          from: { transform: "translateX(8px)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;