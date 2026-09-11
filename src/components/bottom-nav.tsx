"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ReceiptText, User, CarFront, Utensils, CalendarDays, Stethoscope, X, Zap, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const items = [
  { href: "/", label: "Inicio", icon: Home, match: (p: string) => p === "/" },
  { href: "/buscar", label: "Buscar", icon: Search, match: (p: string) => p.startsWith("/buscar") || p.startsWith("/restaurante") },
  { href: "/viajes", label: "Viajes", icon: CarFront, match: (p: string) => p.startsWith("/viajes") },
  { href: "/pedidos", label: "Pedidos", icon: ReceiptText, match: (p: string) => p.startsWith("/pedidos") || p.startsWith("/pedido") },
  { href: "/cuenta", label: "Cuenta", icon: User, match: (p: string) => p.startsWith("/cuenta") },
];

/* Los 4 servicios de Rayte, cada uno con el color de su sección */
const quick = [
  { href: "/buscar", label: "Comida", desc: "Restaurantes, panaderías y más", icon: Utensils, color: "#ea580c", soft: "#ffedd5", match: (p: string) => p.startsWith("/restaurante") || p.startsWith("/buscar") },
  { href: "/viajes", label: "Rayte", desc: "Viaja por la ciudad", icon: CarFront, color: "#d97706", soft: "#fef3c7", match: (p: string) => p.startsWith("/viajes") },
  { href: "/servicios", label: "Citas y Servicios", desc: "Belleza, hogar y más", icon: CalendarDays, color: "#7c3aed", soft: "#f3e8ff", match: (p: string) => p.startsWith("/servicios") && !p.includes("cat=salud") },
  { href: "/medicos", label: "Salud", desc: "Médicos y farmacias 24h", icon: Stethoscope, color: "#1d6ae5", soft: "#e8f1fe", match: (p: string) => p.startsWith("/medicos") },
];

/* ── Menú lateral (asa) para páginas SIN barra inferior ── */
function SideMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-[3px]"
          />
        )}
      </AnimatePresence>

      <div className="fixed top-16 left-0 z-[75]">
        {!open ? (
          <motion.button
            onClick={() => setOpen(true)}
            whileTap={{ scale: 0.9 }}
            aria-label="Abrir menú de servicios Rayte"
            className="flex h-16 w-7 items-center justify-center rounded-r-2xl bg-ink/95 shadow-[0_6px_20px_rgba(0,0,0,0.35)] ring-2 ring-white/90 backdrop-blur"
          >
            <span className="flex flex-col items-center gap-0.5 text-white">
              <Zap className="h-3.5 w-3.5 fill-brand text-brand" />
              <ChevronRight className="h-4 w-4" strokeWidth={3} />
            </span>
          </motion.button>
        ) : (
          <motion.button
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={() => setOpen(false)}
            whileTap={{ scale: 0.9 }}
            aria-label="Cerrar menú"
            className="ml-3 flex h-11 w-11 items-center justify-center rounded-full bg-ink/95 text-white shadow-[0_10px_30px_rgba(0,0,0,0.4)] ring-2 ring-white/90"
          >
            <X className="h-5 w-5" strokeWidth={2.8} />
          </motion.button>
        )}

        <AnimatePresence>
          {open && (
            <div className="mt-2.5 ml-3 flex flex-col gap-2">
              {quick.map(({ href, label, desc, icon: Icon, color, soft, match }, i) => {
                const active = match(pathname);
                return (
                  <motion.div
                    key={label}
                    initial={{ x: -70, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -70, opacity: 0, transition: { delay: (quick.length - 1 - i) * 0.03 } }}
                    transition={{ type: "spring", stiffness: 420, damping: 30, delay: i * 0.06 }}
                  >
                    <Link
                      href={href}
                      className="flex w-[210px] items-center gap-3 rounded-[20px] border bg-white py-2.5 pr-4 pl-2.5 shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition active:scale-95"
                      style={{ borderColor: active ? color : "rgba(0,0,0,0.06)" }}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: soft }}>
                        <Icon className="h-5 w-5" style={{ color }} strokeWidth={2.5} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[14px] leading-tight font-black" style={{ color: active ? color : undefined }}>{label}</span>
                        <span className="block truncate text-[11px] font-bold text-ink-soft">{desc}</span>
                      </span>
                      {active && <span className="ml-auto h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => setMenuOpen(false), [pathname]);

  const navHidden =
    pathname.startsWith("/pedido/") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/socio") ||
    pathname.startsWith("/profesional") ||
    pathname.startsWith("/conductor");

  const sideMenuHidden = pathname.startsWith("/checkout") || pathname.startsWith("/pedido/");

  /* Páginas sin barra: el menú vive en el asa lateral, excepto en flujos críticos */
  if (navHidden) return sideMenuHidden ? null : <SideMenu pathname={pathname} />;

  return (
    <>
      {/* Hoja del menú: se despliega desde el botón flotante */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[3px]"
            />
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="fixed inset-x-4 bottom-20 z-[65] mx-auto max-w-md rounded-[28px] bg-ink/95 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur"
            >
              <p className="flex items-center gap-1.5 px-1 text-[11px] font-black tracking-widest text-white/60 uppercase">
                Ir a
              </p>
              <div className="mt-2 flex gap-1.5">
                {items.map(({ href, label, icon: Icon, match }) => {
                  const active = match(pathname);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl py-2.5 transition active:scale-95"
                      style={{ backgroundColor: active ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)" }}
                    >
                      <Icon className="h-5 w-5" style={{ color: active ? "#fb923c" : "rgba(255,255,255,0.85)" }} strokeWidth={active ? 2.6 : 2} />
                      <span className={`truncate text-[10.5px] font-extrabold ${active ? "text-white" : "text-white/65"}`}>{label}</span>
                    </Link>
                  );
                })}
              </div>

              <p className="mt-4 flex items-center gap-1.5 px-1 text-[11px] font-black tracking-widest text-white/60 uppercase">
                <Zap className="h-3.5 w-3.5 fill-brand text-brand" /> Servicios Rayte
              </p>
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                {quick.map(({ href, label, desc, icon: Icon, color, soft, match }, i) => {
                  const active = match(pathname);
                  const lastOdd = i === quick.length - 1 && quick.length % 2 === 1;
                  return (
                    <motion.div key={label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.05 }} className={lastOdd ? "col-span-2" : ""}>
                      <Link
                        href={href}
                        className="flex items-center gap-2.5 rounded-[20px] border p-3 transition active:scale-95"
                        style={{ borderColor: active ? color : "rgba(255,255,255,0.10)", backgroundColor: active ? `${color}22` : "rgba(255,255,255,0.05)" }}
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: soft }}>
                          <Icon className="h-4.5 w-4.5" style={{ color }} strokeWidth={2.5} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[13.5px] leading-tight font-black text-white">{label}</span>
                          <span className="block truncate text-[10.5px] font-bold text-white/60">{desc}</span>
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Botón flotante: tab pegado al borde derecho (estilo "asa"), al primer clic
          se abre el menú. Sin animación de rebote: no estorba y no tapa contenido. */}
      <div className="fixed right-0 top-1/2 z-50 -translate-y-1/2">
        <motion.button
          onClick={() => setMenuOpen((v) => !v)}
          whileTap={{ scale: 0.94 }}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          className={`flex flex-col items-center justify-center gap-1.5 rounded-l-2xl bg-ink/95 shadow-[0_6px_20px_rgba(0,0,0,0.35)] ring-2 ring-white/90 backdrop-blur ${menuOpen ? "h-14 w-11" : "h-24 w-9"}`}
        >
          {menuOpen ? (
            <>
              <X className="h-5 w-5 text-white" strokeWidth={2.8} />
              <span className="text-[9px] font-black tracking-widest text-white/70">CERRAR</span>
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 fill-brand text-brand" strokeWidth={2.5} />
              <span className="text-[10px] font-black tracking-[0.18em] text-white [writing-mode:vertical-rl] rotate-180">MENÚ</span>
            </>
          )}
        </motion.button>
      </div>
    </>
  );
}
