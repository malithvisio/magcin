import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize CSS loading
  experimental: {
    optimizeCss: true,
  },

  // Optimize images
  images: {
    domains: [
      'randomuser.me',
      'firebasestorage.googleapis.com',
      'images.unsplash.com',
    ],
  },

  // Optimize bundle
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Disable ESLint during build for now
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript checking during build for now
  typescript: {
    ignoreBuildErrors: true,
  },

  // Optimize CSS extraction
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimize CSS loading
      config.optimization.splitChunks.cacheGroups.styles = {
        name: 'styles',
        test: /\.(css|scss)$/,
        chunks: 'all',
        enforce: true,
      };
    }

    // Add module resolution for @ alias
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': resolve(__dirname),
    };

    return config;
  },
};

export default nextConfig;
