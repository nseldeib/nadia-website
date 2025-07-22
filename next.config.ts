import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: '/nadia-website',
  assetPrefix: '/nadia-website/',
  images: {
    unoptimized: true
  }
};

export default nextConfig;
