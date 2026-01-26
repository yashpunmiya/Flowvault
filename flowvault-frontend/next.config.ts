import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
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
