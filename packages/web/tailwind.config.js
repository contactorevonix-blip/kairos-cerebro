/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // ── Kairos Design Tokens ──────────────────────────
        kc: {
          black:          '#000000',
          's1':           '#0a0a0a',
          's2':           '#111111',
          's3':           '#1a1a1a',
          border:         '#1f1f1f',
          'border-light': '#2a2a2a',
          green:          '#00DC82',
          'green-dim':    'rgba(0,220,130,0.12)',
          'green-border': 'rgba(0,220,130,0.18)',
          'green-glow':   'rgba(0,220,130,0.25)',
          'text-1':       '#ffffff',
          'text-2':       '#888888',
          'text-3':       '#444444',
          red:            '#FF4444',
          'red-dim':      'rgba(255,68,68,0.12)',
          yellow:         '#FFB800',
        },
        // ── shadcn tokens (mantidos para componentes UI) ──
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
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      fontSize: {
        'hero': ['clamp(56px,8vw,96px)', { lineHeight: '1.0', letterSpacing: '-0.03em', fontWeight: '700' }],
        'h2':   ['clamp(32px,4vw,48px)',  { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h3':   ['24px',                  { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body': ['15px',                  { lineHeight: '1.6', letterSpacing: '-0.01em' }],
        'sm':   ['13px',                  { lineHeight: '1.5' }],
        'label':['12px',                  { lineHeight: '1', letterSpacing: '0.08em', fontWeight: '500' }],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '28px',
        'pill': '9999px',
      },
      maxWidth: {
        content: '1200px',
      },
      animation: {
        'marquee':    'marquee 20s linear infinite',
        'glow-pulse': 'glow-pulse 2.5s ease-in-out infinite',
        'fade-up':    'fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in':    'fade-in 0.4s cubic-bezier(0.16,1,0.3,1) both',
        'blink':      'blink 1s step-end infinite',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'glow-pulse': {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(0,220,130,0)' },
          '50%':     { boxShadow: '0 0 20px 4px rgba(0,220,130,0.25)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        blink: {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
