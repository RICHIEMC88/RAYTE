import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite que el preview (proxy *.e2b.app y Cloudflare) funcione sin bloqueos
  allowedDevOrigins: ["*.e2b.app", "*.trycloudflare.com", "localhost:3000"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
    ],
  },
  // Caché de HTML: ANTES aquí se forzaba "no-store" en TODO el HTML para
  // evitar versiones viejas. Ahora el control de frescura lo hace Next por
  // ruta: páginas públicas con revalidate=10 (caché de borde 10 s) y páginas
  // dinámicas/personales que Next ya sirve sin caché. Con "no-store", cada
  // navegación se renderizaba en vivo (~1 s de espera y la imagen "brinca")
  // → eliminado.
  async headers() {
    return [
      {
        source: "/((?!_next/static|_next/image|favicon|icon|tiendas|servicios/[^/]*\\.jpg).)*",
        headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
      },
    ];
  },
};

export default nextConfig;
