/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        // ── KairosCheck Design Tokens (via CSS variables OKLCH) ──
        'kc-bg':         'var(--kc-bg-base)',
        'kc-surface':    'var(--kc-bg-surface)',
        'kc-elevated':   'var(--kc-bg-elevated)',
        'kc-border':     'var(--kc-border-normal)',
        'kc-text':       'var(--kc-text-primary)',
        'kc-text-2':     'var(--kc-text-secondary)',
        'kc-text-muted': 'var(--kc-text-muted)',
        'kc-accent':     'var(--kc-accent)',
        'kc-success':    'var(--kc-success)',
        'kc-warning':    'var(--kc-warning)',
        'kc-danger':     'var(--kc-danger)',
        // ── shadcn/ui tokens ──
        border:      'oklch(var(--border) / <alpha-value>)',
        input:       'oklch(var(--input) / <alpha-value>)',
        ring:        'oklch(var(--ring) / <alpha-value>)',
        background:  'oklch(var(--background) / <alpha-value>)',
        foreground:  'oklch(var(--foreground) / <alpha-value>)',
        primary: {
          DEFAULT:    'oklch(var(--primary) / <alpha-value>)',
          foreground: 'oklch(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT:    'oklch(var(--secondary) / <alpha-value>)',
          foreground: 'oklch(var(--secondary-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT:    'oklch(var(--muted) / <alpha-value>)',
          foreground: 'oklch(var(--muted-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT:    'oklch(var(--destructive) / <alpha-value>)',
          foreground: 'oklch(0.985 0 0 / <alpha-value>)',
        },
        accent: {
          DEFAULT:    'oklch(var(--accent) / <alpha-value>)',
          foreground: 'oklch(var(--accent-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT:    'oklch(var(--popover) / <alpha-value>)',
          foreground: 'oklch(var(--popover-foreground) / <alpha-value>)',
        },
        card: {
          DEFAULT:    'oklch(var(--card) / <alpha-value>)',
          foreground: 'oklch(var(--card-foreground) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans:  ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono:  ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      fontSize: {
        'hero':  ['clamp(48px,7vw,80px)',  { lineHeight: '1.0',  letterSpacing: '-0.03em', fontWeight: '800' }],
        'h2':    ['clamp(28px,4vw,44px)',  { lineHeight: '1.1',  letterSpacing: '-0.02em', fontWeight: '700' }],
        'h3':    ['clamp(20px,3vw,28px)',  { lineHeight: '1.3',  letterSpacing: '-0.01em', fontWeight: '600' }],
        'body':  ['16px',                  { lineHeight: '1.6',  letterSpacing: '-0.005em' }],
        'body-sm': ['14px',               { lineHeight: '1.5' }],
        'label': ['12px',                  { lineHeight: '1',    letterSpacing: '0.06em',  fontWeight: '500' }],
      },
      borderRadius: {
        lg:   'var(--radius)',
        md:   'calc(var(--radius) - 2px)',
        sm:   'calc(var(--radius) - 4px)',
        xl:   'calc(var(--radius) + 4px)',
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '28px',
      },
      maxWidth: {
        content: '1280px',
        prose:   '768px',
        form:    '480px',
      },
      animation: {
        // Shadcn/tailwindcss-animate base
        'accordion-down':  'accordion-down 0.2s ease-out',
        'accordion-up':    'accordion-up 0.2s ease-out',
        // KairosCheck custom
        'fade-up':         'fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in':         'fade-in 0.3s cubic-bezier(0.16,1,0.3,1) both',
        'cursor-blink':    'cursor-blink 0.7s step-end infinite',
        'typing-dots':     'typing-dots 1.4s ease-in-out infinite',
        'score-fill':      'score-fill 0.8s cubic-bezier(0.16,1,0.3,1) both',
        'glow-pulse':      'glow-pulse 2.5s ease-in-out infinite',
        'bounce-dots':     'bounce-dots 1.2s ease-in-out infinite',
        'aurora':          'aurora 8s ease-in-out infinite alternate',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'cursor-blink': {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0' },
        },
        'score-fill': {
          from: { width: '0%' },
          to:   { width: 'var(--score-width)' },
        },
        'glow-pulse': {
          '0%,100%': { opacity: '0.4' },
          '50%':     { opacity: '0.8' },
        },
        'bounce-dots': {
          '0%,80%,100%': { transform: 'scale(0)' },
          '40%':          { transform: 'scale(1)' },
        },
        'aurora': {
          '0%':   { transform: 'scale(1) rotate(0deg)' },
          '100%': { transform: 'scale(1.05) rotate(3deg)' },
        },
      },
      boxShadow: {
        'kc-card':  '0 4px 24px -4px rgb(0 0 0 / 0.4)',
        'kc-float': '0 8px 32px -8px rgb(0 0 0 / 0.6), 0 0 0 1px rgb(255 255 255 / 0.06)',
        'kc-glow':  '0 0 20px 0 oklch(62.3% 0.214 259.815 / 0.3)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
