/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // SIGBUS fix: disable webpack build worker, use Turbopack instead
  experimental: {
    webpackBuildWorker: false,
  },
}

export default nextConfig
