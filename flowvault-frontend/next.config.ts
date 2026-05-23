import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.prod.website-files.com",
      },
    ],
  },
  // Transpile Stacks packages to fix production build issues
  transpilePackages: [
    "@stacks/transactions",
    "@stacks/connect",
    "@stacks/network",
    "@stacks/common",
    "@stacks/encryption",
    "@stacks/auth",
  ],
};

export default nextConfig;
