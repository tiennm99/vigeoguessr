/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['graph.mapillary.com', 'maps.google.com', 'unpkg.com'],
    unoptimized: true
  },
  experimental: {
    optimizePackageImports: ['leaflet', '@photo-sphere-viewer/core']
  }
}

module.exports = nextConfig