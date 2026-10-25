import type { NextConfig } from "next";

const review = process.env.NEXT_PUBLIC_REVIEW_EXPORT === "1";
const staticExport = review || process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
if (basePath && !/^\/[a-zA-Z0-9_-]+$/.test(basePath)) throw new Error("Review base path must be a single URL directory.");

const config: NextConfig = {
  poweredByHeader: false,
  basePath,
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    deviceSizes: [480, 960, 1600, 2048],
    imageSizes: [64, 96, 192],
  },
  ...(staticExport ? { output: "export", trailingSlash: review } : {}),
  allowedDevOrigins: ["127.0.0.1"],
  ...(!staticExport && { async redirects() {
    return [{ source: "/projects/:slug", destination: "/portfolio/:slug", permanent: true }];
  },
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "DENY" },
      ],
    }];
  } }),
};

export default config;
