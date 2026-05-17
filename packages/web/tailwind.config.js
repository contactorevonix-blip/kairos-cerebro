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
