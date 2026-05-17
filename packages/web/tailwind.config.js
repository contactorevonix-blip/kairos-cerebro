/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        accent:         '#00d97e',
        'accent-hover': '#00e888',
        bg:             '#080808',
        'bg-elevated':  '#0f0f0f',
        'bg-card':      '#111111',
        // shadcn CSS variable tokens
        border:      'hsl(var(--border) / <alpha-value>)',
        input:       'hsl(var(--input) / <alpha-value>)',
        ring:        'hsl(var(--ring) / <alpha-value>)',
        background:  'hsl(var(--background) / <alpha-value>)',
        foreground:  'hsl(var(--foreground) / <alpha-value>)',
        primary: {
          DEFAULT:    'hsl(var(--primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary) / <alpha-value>)',
          foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted) / <alpha-value>)',
          foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive) / <alpha-value>)',
          foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover) / <alpha-value>)',
          foreground: 'hsl(var(--popover-foreground) / <alpha-value>)',
        },
        card: {
          DEFAULT:    'hsl(var(--card) / <alpha-value>)',
          foreground: 'hsl(var(--card-foreground) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      letterSpacing: {
        tighter: '-0.03em',
        tight:   '-0.02em',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '28px',
      },
      maxWidth: {
        content: '1100px',
      },
      animation: {
        'fade-up':   'fade-up 0.55s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in':   'fade-in 0.55s cubic-bezier(0.16,1,0.3,1) both',
        'glow':      'glow-pulse 3s ease-in-out infinite',
        'blink':     'blink 1s step-end infinite',
        'kc-slide':  'kc-slide 0.45s cubic-bezier(0.34,1.56,0.64,1) 1.5s both',
      },
    },
  },
  plugins: [],
};
