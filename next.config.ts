import type { NextConfig } from "next";

const rawBackend =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://project-courier-service.vercel.app";

const cleanBackend = rawBackend
  .trim()
  .replace(/\/api\/v1\/?$/, "")
  .replace(/\/+$/, "");

const BACKEND_URL =
  process.env.NODE_ENV === "production" &&
  (cleanBackend.includes("localhost") || cleanBackend.includes("127.0.0.1"))
    ? "https://project-courier-service.vercel.app"
    : cleanBackend;

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${BACKEND_URL}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
