/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    const apiBase = process.env.KAIROS_API_URL || 'http://localhost:8787';
    return [
      {
        source: '/api/:path*',
        destination: `${apiBase}/api/:path*`,
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
