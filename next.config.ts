import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Service / profile images come from ImgBB, Unsplash, Google and user-provided URLs,
  // so plain <img> tags are used and no remote image config is required.
  poweredByHeader: false,
};

export default nextConfig;
