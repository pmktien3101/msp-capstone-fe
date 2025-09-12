import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Optimize CSS loading
  experimental: {
    optimizeCss: true,
  },
  // Compress responses
  compress: true,
  // Enable static optimization
  trailingSlash: false,
  // Optimize fonts
  optimizeFonts: true,
};

export default nextConfig;
