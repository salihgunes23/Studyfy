// GitHub Pages (statik export) için yapılandırma.
// CI, project-pages alt yolu için PAGES_BASE_PATH=/Studyfy enjekte eder.
const basePath = process.env.PAGES_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
  // Lint/tip hatalarının statik yayını bloklamaması için (CI ayrı lint job'u var).
  eslint: { ignoreDuringBuilds: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
