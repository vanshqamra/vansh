/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  experimental: {
    // 🚫 prevents Next.js from exporting dynamic routes statically
    appDir: true,
  },
  output: 'standalone', // ✅ tell Next.js this is a server-rendered app
}

export default nextConfig
