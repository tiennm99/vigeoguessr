import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    domains: ['graph.mapillary.com', 'maps.google.com', 'unpkg.com'],
    unoptimized: true
  },
  experimental: {
    optimizePackageImports: ['maplibre-gl', 'mapillary-js']
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  }
}

export default nextConfig