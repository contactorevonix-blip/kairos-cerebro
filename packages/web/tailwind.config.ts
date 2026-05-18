import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{ts,tsx,js,jsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono:    ["JetBrains Mono", "Fira Code", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        display: ["Cal Sans", "Inter", "ui-sans-serif", "sans-serif"],
      },

      colors: {
        background: "#000000",
        surface: {
          1: "#0a0a0b",
          2: "#111113",
          3: "#18191b",
        },
        gray: {
          1: "#0a0a0b",
          2: "#111113",
          3: "#18191b",
          4: "#1e1f22",
          5: "#252629",
          6: "#2c2d31",
          7: "#363739",
          8: "#4a4b4e",
          9: "#636466",
          10: "#7e8082",
          11: "#a0a2a5",
          12: "#ededef",
        },
        accent: {
          DEFAULT: "#3b82f6",
          dim:     "rgba(59,130,246,0.15)",
          glow:    "rgba(59,130,246,0.3)",
        },
        brand: {
          blue:    "#3b82f6",
          cyan:    "#06b6d4",
          violet:  "#8b5cf6",
          emerald: "#10b981",
        },
      },

      borderRadius: {
        xs:   "0.125rem",
        sm:   "0.25rem",
        md:   "0.375rem",
        lg:   "0.5rem",
        xl:   "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },

      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1" }],
        xs:    ["0.75rem",  { lineHeight: "1.33" }],
        sm:    ["0.875rem", { lineHeight: "1.43" }],
        base:  ["1rem",     { lineHeight: "1.6" }],
        lg:    ["1.125rem", { lineHeight: "1.56" }],
        xl:    ["1.25rem",  { lineHeight: "1.4" }],
        "2xl": ["1.5rem",   { lineHeight: "1.33" }],
        "3xl": ["1.875rem", { lineHeight: "1.2" }],
        "4xl": ["2.25rem",  { lineHeight: "1.11" }],
        "5xl": ["3rem",     { lineHeight: "1" }],
        "6xl": ["3.75rem",  { lineHeight: "1" }],
        "7xl": ["4.5rem",   { lineHeight: "1" }],
      },

      maxWidth: {
        "5xl": "64rem",
        "6xl": "72rem",
        "7xl": "80rem",
      },

      transitionTimingFunction: {
        DEFAULT:   "cubic-bezier(0.4, 0, 0.2, 1)",
        cinematic: "cubic-bezier(0.16, 1, 0.3, 1)",
        spring:    "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },

      keyframes: {
        "fade-in":       { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-up":      { from: { opacity: "0", transform: "translateY(20px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "scale-in":      { from: { opacity: "0", transform: "scale(0.96)" }, to: { opacity: "1", transform: "scale(1)" } },
        "hero-text-in":  { from: { opacity: "0", transform: "translateY(32px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "shield-in":     { from: { opacity: "0", transform: "scale(0.7)" }, to: { opacity: "1", transform: "scale(1)" } },
        "header-in":     { from: { opacity: "0", transform: "translateY(-16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "scroll-x":      { from: { transform: "translateX(0)" }, to: { transform: "translateX(calc(-100% - 2rem))" } },
        "shine":         { from: { backgroundPosition: "200% center" }, to: { backgroundPosition: "-200% center" } },
        "float":         { "0%, 100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-12px)" } },
        "pulse-glow":    { "0%, 100%": { boxShadow: "0 0 20px rgba(59,130,246,0.2)" }, "50%": { boxShadow: "0 0 50px rgba(59,130,246,0.5)" } },
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up":   { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },

      animation: {
        "fade-in":       "fade-in 0.2s ease-in-out",
        "slide-up":      "slide-up 0.4s cubic-bezier(0.16,1,0.3,1) both",
        "scale-in":      "scale-in 0.2s ease-in-out",
        "hero-text":     "hero-text-in 1s cubic-bezier(0.16,1,0.3,1) both",
        "shield-in":     "shield-in 1.2s cubic-bezier(0.16,1,0.3,1) both",
        "header-in":     "header-in 0.8s cubic-bezier(0.16,1,0.3,1) both",
        "scroll-x":      "scroll-x 30s linear infinite",
        "shine":         "shine 3s linear infinite",
        "float":         "float 4s ease-in-out infinite",
        "pulse-glow":    "pulse-glow 3s ease-in-out infinite",
        "accordion-down": "accordion-down 0.3s ease-in-out",
        "accordion-up":   "accordion-up 0.3s ease-in-out",
      },

      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":  "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-glow":       "radial-gradient(70% 80% at 50% 0%, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.04) 50%, transparent 100%)",
        "shield-glow":     "radial-gradient(60% 60% at 50% 50%, rgba(59,130,246,0.15) 0%, transparent 70%)",
        "glass-gradient":  "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
      },

      boxShadow: {
        "glow-blue": "0 0 40px rgba(59,130,246,0.2)",
        "glow-sm":   "0 0 20px rgba(59,130,246,0.15)",
        "glow-lg":   "0 0 80px rgba(59,130,246,0.25)",
        "card":      "0 4px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
