/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'swalay-music-files.s3.ap-south-1.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    middleware: true, // Enable middleware
  },
  webpack: (config, { isServer }) => {
    // This will make webpack not use eval() in production
    if (!isServer) {
      config.optimization.minimize = true;
    }
    return config;
  },
};

export default nextConfig;
