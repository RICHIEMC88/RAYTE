import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import CartShell from "@/components/cart-shell";
import BottomNav from "@/components/bottom-nav";
import ThemeApplier from "@/components/theme-applier";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Rayte — Todo lo que quieras, en minutos",
  description: "Comida de tus restaurantes favoritos, mercado, farmacia y más, entregado en minutos.",
};

/* La página NUNCA cambia de tamaño con gestos (doble toque / pellizco / teclado):
   el usuario reportó que al reservar la página se quedaba "en zoom" y tenía que
   ajustarla con los dedos. Bloqueamos el zoom del viewport por completo. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  interactiveWidget: "resizes-visual",
};

/* Sirve TODAS las páginas sin caché: el usuario siempre ve la última versión
   (antes las páginas pregeneradas salían con caché de 1 año y el CDN daba versiones viejas) */
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${nunito.variable} font-display antialiased`}>
        {children}
        <ThemeApplier />
        <CartShell />
        <BottomNav />
      </body>
    </html>
  );
}
