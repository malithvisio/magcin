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
    return config;
  },
};

export default nextConfig;
