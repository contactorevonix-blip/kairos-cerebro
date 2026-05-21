/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const apiBase = process.env.KAIROS_API_URL || 'http://localhost:8787';
    return [
      // Rotas locais (Next.js handlers) — NÃO reescrever:
      //   /api/keys, /api/checks, /api/stats, /api/demo, /api/chat, /api/health
      // Proxy apenas para rotas do sniper-api backend:
      {
        source: '/api/v1/:path*',
        destination: `${apiBase}/api/v1/:path*`,
      },
      {
        source: '/billing/:path*',
        destination: `${apiBase}/billing/:path*`,
      },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  poweredByHeader: false,
};

module.exports = nextConfig;
