import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false, // Disable strict mode to prevent double renders
  // Disable Fast Refresh temporarily for debugging
  experimental: {
    // @ts-ignore
    fastRefresh: false
  }
};

export default nextConfig;
