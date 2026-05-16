/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        accent: '#00d97e',
        'accent-hover': '#00e888',
        surface: '#111111',
        'surface-2': '#181818',
        border: 'rgba(255,255,255,0.07)',
        'border-strong': 'rgba(255,255,255,0.12)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      letterSpacing: {
        tighter: '-0.03em',
        tight: '-0.02em',
      },
    },
  },
  plugins: [],
};
