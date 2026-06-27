/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@studfy/shared'],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
