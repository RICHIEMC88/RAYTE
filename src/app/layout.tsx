import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import AppShellChrome from "@/components/app-shell-chrome";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Rayte — Todo lo que quieras, en minutos",
  description: "Comida de tus restaurantes favoritos, mercado, farmacia y más, entregado en minutos.",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${nunito.variable} font-display antialiased`}>
        {children}
        <AppShellChrome />
      </body>
    </html>
  );
}
