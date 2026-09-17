import Link from "next/link";
import { Home, Search } from "lucide-react";

/* 404 de marca: cualquier URL/slug inexistente cae aquí con salida clara
   (antes era la página genérica de Next, sin botones). */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-8 text-center">
      <span className="text-6xl">🧭</span>
      <h1 className="text-2xl font-black tracking-tight text-ink">Página no encontrada</h1>
      <p className="max-w-xs text-sm font-bold text-ink-soft">
        La página que buscas no existe o ya no está disponible en Rayte.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-black text-white shadow-[0_10px_24px_var(--brand-glow)] transition hover:bg-brand-dark"
        >
          <Home className="h-4 w-4" /> Volver al inicio
        </Link>
        <Link
          href="/buscar"
          className="flex items-center gap-2 rounded-full bg-mist px-5 py-3 text-sm font-black text-ink transition hover:bg-black/[0.08]"
        >
          <Search className="h-4 w-4" /> Explorar
        </Link>
      </div>
    </div>
  );
}
