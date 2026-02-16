import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Keep dev and production build artifacts separate so `next dev` can run
  // in parallel without interfering with `next build` output.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  }
};

export default nextConfig;
