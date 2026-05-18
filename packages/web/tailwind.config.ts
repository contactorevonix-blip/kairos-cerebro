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
      // ─── FONTES ──────────────────────────────────────
      fontFamily: {
        sans:    ["Inter",          "ui-sans-serif", "system-ui", "sans-serif"],
        mono:    ["JetBrains Mono", "ui-monospace",  "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
        serif:   ["Fraunces",       "ui-serif",       "Georgia", "serif"],
        display: ["Inter",          "ui-sans-serif", "system-ui", "sans-serif"],
      },

      // ─── CORES ────────────────────────────────────────
      colors: {
        background: "#000000",
        canvas:     "rgba(20,21,23,0.6)",

        // Escala cinzenta Radix (modo escuro — specs Resend)
        gray: {
          1:  "#141517",
          2:  "#191b1e",
          3:  "#212629",
          4:  "#293034",
          5:  "#333b3e",
          6:  "#3b4345",
          7:  "#434a4d",
          8:  "#52595b",
          9:  "#6e7679",
          10: "#878d8f",
          11: "#a1a4a5",
          12: "#f0f0f0",
        },

        // Escala slate alpha (bordas vidro)
        slate: {
          1:  "#00000000",
          2:  "#d8f4f609",
          3:  "#ddeaf814",
          4:  "#d3edf81d",
          5:  "#d9edfe25",
          6:  "#d6ebfd30",    // borda padrão de card
          7:  "#d9edff40",
          8:  "#d9edff5d",    // borda forte / hover
          9:  "#dfebfd6d",
          10: "#e5edfd7b",
          11: "#f1f7feb5",
          12: "#fcfdffef",
        },

        // Acento KAIROS verde
        accent: {
          DEFAULT: "#00DC82",
          dim:     "rgba(0,220,130,0.12)",
          glow:    "rgba(0,220,130,0.25)",
        },

        // Brand colors complementares
        brand: {
          blue:   "#3b82f6",
          cyan:   "#06b6d4",
          violet: "#8b5cf6",
        },

        // Bordas semânticas
        border: {
          DEFAULT:   "rgba(214,235,253,0.19)",
          subtle:    "rgba(214,235,253,0.08)",
          strong:    "rgba(217,237,255,0.36)",
          accent:    "rgba(0,220,130,0.35)",
          panel:     "#262A2D",
          "btn-glass": "rgba(255,255,255,0.05)",
        },
      },

      // ─── RAIOS ────────────────────────────────────────
      borderRadius: {
        xs:    "0.125rem",    /*  2px */
        sm:    "0.25rem",     /*  4px */
        md:    "0.375rem",    /*  6px */
        lg:    "0.5rem",      /*  8px */
        xl:    "0.75rem",     /* 12px */
        "2xl": "1rem",        /* 16px — botões, icon boxes */
        "3xl": "1.5rem",      /* 24px — secções */
        "4xl": "2rem",        /* 32px */
      },

      // ─── TIPOGRAFIA ───────────────────────────────────
      fontSize: {
        "2xs": ["0.625rem",  { lineHeight: "1" }],
        xs:    ["0.75rem",   { lineHeight: "1.333" }],
        sm:    ["0.875rem",  { lineHeight: "1.428" }],
        base:  ["1rem",      { lineHeight: "1.5" }],
        lg:    ["1.125rem",  { lineHeight: "1.555" }],
        xl:    ["1.25rem",   { lineHeight: "1.4" }],
        "2xl": ["1.5rem",    { lineHeight: "1.333" }],
        "3xl": ["1.875rem",  { lineHeight: "1.2" }],
        "4xl": ["2.25rem",   { lineHeight: "1.111" }],
        "5xl": ["3rem",      { lineHeight: "1" }],
        "6xl": ["3.75rem",   { lineHeight: "1" }],
        "7xl": ["4.5rem",    { lineHeight: "1" }],
        "9xl": ["8rem",      { lineHeight: "1" }],      // H1 hero máximo
      },

      // ─── LARGURAS MÁXIMAS ──────────────────────────────
      maxWidth: {
        "5xl": "64rem",    /* 1024px — conteúdo padrão */
        "6xl": "72rem",    /* 1152px */
        "7xl": "80rem",    /* 1280px — hero / layout máximo */
      },

      // ─── EASING ────────────────────────────────────────
      transitionTimingFunction: {
        DEFAULT:   "cubic-bezier(0.4, 0, 0.2, 1)",
        cinematic: "cubic-bezier(0.16, 1, 0.3, 1)",
        spring:    "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },

      // ─── IMAGENS DE FUNDO ──────────────────────────────
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":  "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-glow":       "radial-gradient(70% 80% at 50% 0%, rgba(0,220,130,0.09) 0%, rgba(59,130,246,0.03) 55%, transparent 100%)",
        "glass-gradient":  "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
      },

      // ─── SOMBRAS ───────────────────────────────────────
      boxShadow: {
        "glow-green": "0 0 40px rgba(0,220,130,0.2)",
        "glow-blue":  "0 0 40px rgba(59,130,246,0.2)",
        "glow-sm":    "0 0 20px rgba(0,220,130,0.12)",
        "glow-lg":    "0 0 80px rgba(0,220,130,0.25)",
        "card":       "0 4px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
        "btn-dark":   "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)",
      },

      // ─── KEYFRAMES ─────────────────────────────────────
      keyframes: {
        // Resend-style entradas
        "hero-text-slide-up-fade": {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0px)" },
        },
        "webgl-scale-in-fade": {
          "0%":   { opacity: "0", transform: "scale(0.7)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "open-scale-up-fade": {
          "0%":   { opacity: "0", transform: "scale(0.98) translateY(5px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0px)" },
        },
        "open-scale-in-fade": {
          "0%":   { opacity: "0", transform: "scale(0.98)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "header-slide-down-fade": {
          "0%":   { opacity: "0", transform: "translateY(-16px)" },
          "100%": { opacity: "1", transform: "translateY(0px)" },
        },
        "open-slide-down-fade": {
          "0%":   { opacity: "0", transform: "translateY(-4px)" },
          "100%": { opacity: "1", transform: "translateY(0px)" },
        },
        // Utilitárias
        "fade-in":   { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "fade-out":  { "0%": { opacity: "1" }, "100%": { opacity: "0" } },
        "slide-up-fade": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "scroll-x": {
          "0%":   { transform: "translate(0px)" },
          "100%": { transform: "translate(calc(-100% - 2rem))" },
        },
        "shine": {
          "0%":   { backgroundPosition: "0% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "ai-shimmer-text": {
          "0%":   { backgroundPosition: "100% center" },
          "100%": { backgroundPosition: "0% center" },
        },
        "disco": {
          "0%":   { transform: "translateY(-50%) rotate(0deg)" },
          "100%": { transform: "translateY(-50%) rotate(360deg)" },
        },
        "plop": {
          "0%, 100%": { opacity: "0.2" },
          "20%":       { opacity: "1" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":       { transform: "translateY(-12px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0,220,130,0.15)" },
          "50%":       { boxShadow: "0 0 50px rgba(0,220,130,0.4)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
      },

      // ─── ANIMAÇÕES ─────────────────────────────────────
      animation: {
        // Resend-style
        "hero-text":         "hero-text-slide-up-fade 1s cubic-bezier(0.16,1,0.3,1) both",
        "webgl-in":          "webgl-scale-in-fade 1s cubic-bezier(0.16,1,0.3,1) both",
        "scale-up-fade":     "open-scale-up-fade 1.5s cubic-bezier(0.16,1,0.3,1) both",
        "scale-in-fade":     "open-scale-in-fade 0.2s ease-in-out",
        "header-in":         "header-slide-down-fade 0.8s cubic-bezier(0.16,1,0.3,1) both",
        "slide-down-fade":   "open-slide-down-fade 0.2s ease-out",
        // Utilitárias
        "fade-in":           "fade-in 0.2s ease-in-out",
        "fade-out":          "fade-out 0.2s ease-in-out",
        "slide-up":          "slide-up-fade 0.4s cubic-bezier(0.16,1,0.3,1) both",
        "scroll-x":          "scroll-x 30s linear infinite",
        "shine":             "shine 3s linear infinite",
        "ai-shimmer":        "ai-shimmer-text 2s linear infinite",
        "disco":             "disco 3s linear infinite",
        "plop":              "plop 1s ease-in-out 0.1s infinite",
        "float":             "float 4s ease-in-out infinite",
        "pulse-glow":        "pulse-glow 3s ease-in-out infinite",
        "accordion-down":    "accordion-down 0.3s ease-in-out",
        "accordion-up":      "accordion-up 0.3s ease-in-out",
        // marquee alias
        "marquee":           "scroll-x 30s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
