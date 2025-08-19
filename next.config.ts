import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
  destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://ecprojectbe-production.up.railway.app'}/api/:path*`,
      }
    ];
  },

  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
