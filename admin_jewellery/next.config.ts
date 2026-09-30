import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/admin",
  turbopack: {
    root: __dirname,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
