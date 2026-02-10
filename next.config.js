/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  reactStrictMode: false,
  // Next.js 16 optimizations
  experimental: {
    // Enable React 19 features
  },
};

module.exports = nextConfig;
