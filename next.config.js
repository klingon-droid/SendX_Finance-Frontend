/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  experimental: {
    fontLoaders: [
      { loader: '@next/font/google', options: { timeout: 20000 } } // Increase timeout to 20 seconds
    ],
  }
};

module.exports = nextConfig;
