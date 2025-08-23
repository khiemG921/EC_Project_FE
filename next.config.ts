import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    // Allow deploy even if env lacks type packages
    ignoreBuildErrors: true,
  },
  async rewrites() {
    const API_BASE = (globalThis as any)?.process?.env?.NEXT_PUBLIC_API_URL || 'https://ecprojectbe-production.up.railway.app';
    return {
      // Ensure our internal proxy routes are handled locally, not forwarded
      beforeFiles: [
        { source: '/api/proxy/:path*', destination: '/api/proxy/:path*' },
      ],
      // Forward all other /api/* calls to backend
      afterFiles: [
        { source: '/api/:path*', destination: `${API_BASE}/api/:path*` },
      ],
      fallback: [],
    };
  },

  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
