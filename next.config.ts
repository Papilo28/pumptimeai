import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output — required for Railway/Docker deployments
  output: "standalone",

  // Allow cross-origin requests from pumptimeai.com (Hostinger landing page)
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: process.env.NEXT_PUBLIC_LANDING_URL || "https://pumptimeai.com" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
          { key: "Access-Control-Allow-Credentials", value: "true" },
        ],
      },
    ];
  },

  // Redirect app root to the Hostinger landing page
  async redirects() {
    return [
      {
        source: "/",
        destination: process.env.NEXT_PUBLIC_LANDING_URL || "https://pumptimeai.com",
        permanent: false,
        // Only redirect when NOT already on the login or dashboard path
      },
    ];
  },
};

export default nextConfig;
