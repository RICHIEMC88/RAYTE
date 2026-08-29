import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite que el preview (proxy *.e2b.app y Cloudflare) funcione sin bloqueos
  allowedDevOrigins: ["*.e2b.app", "*.trycloudflare.com", "localhost:3000"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
    ],
  },
  // Sin caché para el HTML → siempre se visualiza la última versión
  async headers() {
    return [
      {
        source: "/((?!_next/static|_next/image|favicon|icon|tiendas|servicios/[^/]*\\.jpg).)*",
        headers: [
          { key: "Cache-Control", value: "no-store, must-revalidate" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
    ];
  },
};

export default nextConfig;
