import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@aiwardrobe/shared-web'],
  outputFileTracingRoot: new URL('../../', import.meta.url).pathname,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'placehold.co' }],
  },
};
export default nextConfig;
