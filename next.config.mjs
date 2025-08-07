/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["docxtemplater", "pizzip"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Prevent bundling of server-only libraries in client build
      config.externals.push({
        docxtemplater: 'commonjs2 docxtemplater',
        pizzip: 'commonjs2 pizzip',
      });
    }
    return config;
  },
};

export default nextConfig;
