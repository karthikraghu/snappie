import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      allowedOrigins: ["*.ngrok-free.dev"],
    },
  },
  // This unblocks Turbopack HMR specifically
  allowedDevOrigins: ["gravel-presoak-axis.ngrok-free.dev"],
};

export default nextConfig;
