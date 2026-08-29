"use client";

import Link from "next/link";
import { RefreshCw, Home } from "lucide-react";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-8 text-center">
      <span className="text-5xl">😵‍💫</span>
      <h1 className="text-2xl font-black tracking-tight">¡Ups! Algo se atravesó</h1>
      <p className="max-w-xs text-sm font-bold text-ink-soft">
        No pudimos cargar esta parte de Rayte. Prueba de nuevo o vuelve al inicio.
      </p>
      <div className="mt-2 flex gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-black text-white shadow-[0_10px_24px_var(--brand-glow)] transition hover:bg-brand-dark"
        >
          <RefreshCw className="h-4 w-4" /> Reintentar
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full bg-mist px-5 py-3 text-sm font-black text-ink transition hover:bg-black/[0.08]"
        >
          <Home className="h-4 w-4" /> Inicio
        </Link>
      </div>
    </div>
  );
}
