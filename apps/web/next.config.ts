import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    // Pin the workspace root to this repo; otherwise Next.js gets confused
    // by an unrelated package-lock.json higher up in the user's home folder.
    root: path.join(__dirname, "..", ".."),
  },
};

export default nextConfig;
