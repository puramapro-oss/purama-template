import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@purama/smarana'],
  experimental: {
    externalDir: true,
    serverComponentsExternalPackages: [],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'auth.purama.dev' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
}

export default nextConfig
