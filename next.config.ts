import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  typescript: {
    // We run tsc --noEmit separately, so skip during build to avoid memory issues
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
