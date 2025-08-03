/** @type {import('next').NextConfig} */
const nextConfig = {
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

module.exports = nextConfig