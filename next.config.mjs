/** @type {import('next').NextConfig} */
const nextConfig = {
  /* ─── Image Optimisation ─── */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Admin adds device/game image URLs from various sources
      },
    ],
  },

  /* ─── Security Headers ─── */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },

  /* ─── Production Optimisations ─── */
  poweredByHeader: false, // Remove X-Powered-By header
  reactStrictMode: true,
};

export default nextConfig;
