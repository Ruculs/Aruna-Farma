/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  productionBrowserSourceMaps: false,
  output: 'standalone',
  experimental: {
    webpackBuildWorker: false,
    workerThreads: false,
    cpus: 1,
  },
  webpack: (config, { dev }) => {
    if (!dev) {
      config.parallelism = 1;
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
