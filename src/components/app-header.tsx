"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ChevronDown, Search, Zap, Bell, X, BadgePercent, ReceiptText, CalendarDays } from "lucide-react";
import { useCart } from "@/store/cart";

const NOTIFS = [
  { icon: ReceiptText, color: "var(--brand)", bg: "var(--brand-soft)", title: "Tu pedido está en camino", body: "Andrés M. llegó al restaurante", href: "/pedidos" },
  { icon: BadgePercent, color: "#0ea55b", bg: "#e6f8ee", title: "50% en tu primer pedido", body: "Usa el código HOLA50 en La Brasa Smash", href: "/restaurante/la-brasa-smash" },
  { icon: CalendarDays, color: "#7c3aed", bg: "#f2ecff", title: "¿Agenda un servicio?", body: "Barbería, masajes y más a domicilio", href: "/servicios" },
];

export default function AppHeader() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const address = useCart((s) => s.address);
  const setAddress = useCart((s) => s.setAddress);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [bellOpen, setBellOpen] = useState(false);
  const [unread, setUnread] = useState(true);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40">
      <div className="relative overflow-hidden bg-gradient-to-br from-brand via-brand-hard to-[var(--brand-accent)] pt-[env(safe-area-inset-top)] transition-all duration-300">
        <div className="pointer-events-none absolute -top-16 -right-10 h-48 w-48 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute top-10 -right-4 h-20 w-20 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-black/5" />

        <div className="relative mx-auto max-w-6xl px-4 py-2.5 sm:py-3.5">
          {/* ── Vista Desktop / Tablet (md+): Todo optimizado en una sola barra horizontal ── */}
          <div className="hidden md:flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 select-none shrink-0">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white shadow-md">
                <Zap className="h-5 w-5 fill-brand text-brand" />
              </span>
              <span className="text-[26px] font-black tracking-tight text-white italic">rayte</span>
            </Link>

            {/* Buscador central amplio */}
            <div className="flex-1 max-w-xl">
              <button
                onClick={() => router.push("/buscar")}
                className="flex w-full items-center gap-2.5 rounded-full bg-white px-4 py-2.5 text-left shadow-md transition hover:shadow-lg"
              >
                <Search className="h-4.5 w-4.5 shrink-0 text-brand" strokeWidth={2.6} />
                <span className="truncate text-[13.5px] font-bold text-ink-soft">
                  Buscar platillos, panaderías, citas, médicos...
                </span>
              </button>
            </div>

            {/* Dirección + Notificaciones */}
            <div className="flex items-center gap-3 shrink-0">
              {editing ? (
                <form
                  className="flex items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (draft.trim()) setAddress(draft.trim());
                    setEditing(false);
                  }}
                >
                  <input
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Escribe tu dirección"
                    className="w-56 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-ink shadow-md outline-none"
                  />
                  <button className="rounded-full bg-ink px-3 py-1.5 text-xs font-black text-white">OK</button>
                </form>
              ) : (
                <button
                  onClick={() => {
                    setDraft(address);
                    setEditing(true);
                  }}
                  className="flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-2 text-white backdrop-blur transition hover:bg-white/25"
                >
                  <MapPin className="h-4 w-4 shrink-0 text-white" strokeWidth={2.6} />
                  <span className="max-w-[180px] truncate text-[12.5px] font-extrabold">
                    {mounted ? address : "Blvd. Aeropuerto 125, León, GTO"}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-80" />
                </button>
              )}

              <div className="relative">
                <button
                  onClick={() => {
                    setBellOpen((v) => !v);
                    setUnread(false);
                  }}
                  className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                  aria-label="Notificaciones"
                >
                  <Bell className="h-4.5 w-4.5" />
                  {unread && <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-amber-pop ring-2 ring-brand-hard" />}
                </button>
                <AnimatePresence>
                  {bellOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setBellOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        className="absolute right-0 z-50 mt-3 w-[320px] overflow-hidden rounded-[22px] border border-black/5 bg-white shadow-2xl text-ink"
                      >
                        <div className="flex items-center justify-between px-4 py-3">
                          <p className="text-[14px] font-black text-ink">Notificaciones</p>
                          <button onClick={() => setBellOpen(false)} aria-label="Cerrar" className="flex h-7 w-7 items-center justify-center rounded-full bg-mist"><X className="h-4 w-4" /></button>
                        </div>
                        <div className="max-h-[320px] overflow-y-auto">
                          {NOTIFS.map((n) => (
                            <Link key={n.title} href={n.href} onClick={() => setBellOpen(false)} className="flex items-start gap-3 border-t border-black/5 px-4 py-3 transition hover:bg-mist/60">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: n.bg, color: n.color }}><n.icon className="h-4.5 w-4.5" /></span>
                              <span className="min-w-0">
                                <span className="block text-[13.5px] font-black text-ink">{n.title}</span>
                                <span className="block text-[12px] font-bold text-ink-soft">{n.body}</span>
                              </span>
                            </Link>
                          ))}
                        </div>
                        <Link href="/pedidos" onClick={() => setBellOpen(false)} className="block bg-mist/60 px-4 py-3 text-center text-[12.5px] font-black text-brand">Ver mis pedidos</Link>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* ── Vista Móvil: Barra compacta integrada (Logo + Dirección + Campana en 1 línea) ── */}
          <div className="md:hidden">
            <div className="flex items-center justify-between gap-2">
              <Link href="/" className="flex items-center gap-1.5 select-none shrink-0">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm">
                  <Zap className="h-4.5 w-4.5 fill-brand text-brand" />
                </span>
                <span className="text-[22px] font-black tracking-tight text-white italic">rayte</span>
              </Link>

              {/* Dirección compacta al centro */}
              <div className="min-w-0 flex-1 px-1">
                {editing ? (
                  <form
                    className="flex items-center gap-1"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (draft.trim()) setAddress(draft.trim());
                      setEditing(false);
                    }}
                  >
                    <input
                      autoFocus
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Dirección"
                      className="w-full rounded-full bg-white px-3 py-1 text-xs font-bold text-ink outline-none"
                    />
                    <button className="rounded-full bg-ink px-2.5 py-1 text-xs font-black text-white">OK</button>
                  </form>
                ) : (
                  <button
                    onClick={() => {
                      setDraft(address);
                      setEditing(true);
                    }}
                    className="flex w-full items-center justify-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-white backdrop-blur"
                  >
                    <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={2.6} />
                    <span className="max-w-[160px] truncate text-[12px] font-extrabold">
                      {mounted ? address : "León, GTO"}
                    </span>
                    <ChevronDown className="h-3 w-3 shrink-0 opacity-80" />
                  </button>
                )}
              </div>

              {/* Campana */}
              <div className="relative shrink-0">
                <button
                  onClick={() => {
                    setBellOpen((v) => !v);
                    setUnread(false);
                  }}
                  className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                  aria-label="Notificaciones"
                >
                  <Bell className="h-4 w-4" />
                  {unread && <span className="absolute top-1 right-1.5 h-2 w-2 rounded-full bg-amber-pop ring-2 ring-brand-hard" />}
                </button>
                <AnimatePresence>
                  {bellOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setBellOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        className="absolute right-0 z-50 mt-2 w-[290px] overflow-hidden rounded-[22px] border border-black/5 bg-white shadow-2xl text-ink"
                      >
                        <div className="flex items-center justify-between px-4 py-3">
                          <p className="text-[13.5px] font-black text-ink">Notificaciones</p>
                          <button onClick={() => setBellOpen(false)} aria-label="Cerrar" className="flex h-7 w-7 items-center justify-center rounded-full bg-mist"><X className="h-4 w-4" /></button>
                        </div>
                        <div className="max-h-[280px] overflow-y-auto">
                          {NOTIFS.map((n) => (
                            <Link key={n.title} href={n.href} onClick={() => setBellOpen(false)} className="flex items-start gap-2.5 border-t border-black/5 px-3.5 py-2.5 transition hover:bg-mist/60">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: n.bg, color: n.color }}><n.icon className="h-4 w-4" /></span>
                              <span className="min-w-0">
                                <span className="block text-[13px] font-black text-ink">{n.title}</span>
                                <span className="block text-[11px] font-bold text-ink-soft">{n.body}</span>
                              </span>
                            </Link>
                          ))}
                        </div>
                        <Link href="/pedidos" onClick={() => setBellOpen(false)} className="block bg-mist/60 px-4 py-2.5 text-center text-[12px] font-black text-brand">Ver mis pedidos</Link>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Buscador optimizado inmediatamente abajo */}
            <div className="mt-2">
              <button
                onClick={() => router.push("/buscar")}
                className="flex w-full items-center gap-2 rounded-full bg-white px-3.5 py-2.5 text-left shadow-md active:scale-[0.99]"
              >
                <Search className="h-4.5 w-4.5 shrink-0 text-brand" strokeWidth={2.6} />
                <span className="truncate text-[13px] font-bold text-ink-soft">
                  Buscar platillos, panaderías, citas, médicos...
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
