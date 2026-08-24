/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '**.notrevoienews.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
    ],
  },
};

module.exports = nextConfig;
