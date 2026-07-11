import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Product/collection image uploads go through a Server Action, so raise the
    // 1 MB default body cap to allow real photos (upload validation caps files
    // at 5 MB; the extra headroom covers multipart overhead).
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      // Supabase Storage public buckets, so admin-added product images hosted
      // on the project's storage render through next/image.
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
