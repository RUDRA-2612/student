const { PrismaPlugin } = require('@prisma/nextjs-monorepo-workaround-plugin')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins.push(new PrismaPlugin())
    }
    return config
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
