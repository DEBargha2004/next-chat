/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'img.clerk.com',
      'firebasestorage.googleapis.com'
    ],
    minimumCacheTTL : 60
  }
}

module.exports = nextConfig
