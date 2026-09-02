"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays, ChevronRight, CreditCard, Check, HelpCircle, LogIn, LogOut, MapPin, ReceiptText,
  Stethoscope, Store, Bike, UserPlus, UserRound, Zap, Heart, Clock3, Plus, Trash2, ShieldCheck, Banknote, Landmark
} from "lucide-react";
import { useCart } from "@/store/cart";
import { useOrders } from "@/store/orders";
import { useFavorites } from "@/store/favorites";
import { useTheme, PALETTES, paletteById } from "@/store/theme";
import { formatMXN } from "@/lib/utils";
import BackButton from "@/components/back-button";

type Appointment = {
  id: string;
  code: string;
  serviceName: string;
  startAt: string;
  price: number;
  mode: string;
  status: string;
  proName?: string;
};

type SessionUser = { id: number; name: string; phone: string; address: string };

export default function CuentaPage() {
  const { customerName, phone, address, setCustomer, setAddress } = useCart();
  const orders = useOrders((s) => s.orders);
  const favorites = useFavorites((s) => s.favorites);
  const paletteId = useTheme((s) => s.paletteId);
  const setPalette = useTheme((s) => s.setPalette);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [clientTab, setClientTab] = useState<"perfil" | "pedidos" | "citas" | "favoritos" | "pagos">("perfil");

  const [name, setName] = useState("");
  const [tel, setTel] = useState("");
  const [addr, setAddr] = useState("");
  const [saved, setSaved] = useState(false);

  /* ── Sesión real (cookie httpOnly + PostgreSQL) ── */
  const [user, setUser] = useState<SessionUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [authPass, setAuthPass] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (!mounted) return;
    fetch("/api/auth")
      .then(async (r) => {
        const data = r.ok ? await r.json() : { user: null };
        if (data.user) {
          setUser(data.user);
          setCustomer(data.user.name, data.user.phone);
          if (data.user.address) setAddress(data.user.address);
        }
      })
      .catch(() => {})
      .finally(() => setAuthChecked(true));
  }, [mounted]);

  const [appts, setAppts] = useState<Appointment[] | null>(null);
  const [loadingAppts, setLoadingAppts] = useState(false);

  useEffect(() => {
    if (mounted) {
      setName(customerName);
      setTel(phone);
      setAddr(address);
    }
  }, [mounted, customerName, phone, address]);

  const loadAppts = useCallback(async () => {
    if (!tel.trim()) return;
    setLoadingAppts(true);
    try {
      const res = await fetch(`/api/appointments?phone=${encodeURIComponent(tel.trim())}`);
      setAppts(res.ok ? await res.json() : []);
    } catch {
      setAppts([]);
    } finally {
      setLoadingAppts(false);
    }
  }, [tel]);

  useEffect(() => {
    if (mounted && tel.trim()) loadAppts();
  }, [mounted, tel, loadAppts]);

  if (!mounted) return null;

  const submitAuth = async () => {
    setAuthError("");
    if (!tel.trim() || authPass.length < 4 || (authMode === "register" && !name.trim())) {
      setAuthError(authMode === "register" ? "Nombre, teléfono y contraseña (mín. 4 caracteres)." : "Teléfono y contraseña (mín. 4 caracteres).");
      return;
    }
    setAuthBusy(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          authMode === "register"
            ? { action: "register", name: name.trim(), phone: tel.trim(), password: authPass, address: addr.trim() }
            : { action: "login", phone: tel.trim(), password: authPass },
        ),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error ?? "Algo salió mal.");
        return;
      }
      setUser(data.user);
      setAuthPass("");
      setCustomer(data.user.name, data.user.phone);
      if (data.user.address) setAddress(data.user.address);
    } catch {
      setAuthError("Sin conexión. Intenta de nuevo.");
    } finally {
      setAuthBusy(false);
    }
  };

  const logout = async () => {
    await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) });
    setUser(null);
  };

  const save = async () => {
    setCustomer(name.trim(), tel.trim());
    setAddress(addr.trim());
    if (user) {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", name: name.trim(), address: addr.trim() }),
      }).catch(() => {});
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const initials = (customerName || user?.name || "Cliente").slice(0, 2).toUpperCase();
  const spent = orders.reduce((a, o) => a + o.total, 0);

  return (
    <div className="min-h-screen bg-mist/40 pb-28">
      {/* Header del Panel de Cliente */}
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3 px-4 py-3.5">
          <div className="flex items-center gap-3">
            <BackButton fallback="/" />
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-[var(--brand-accent)] text-[15px] font-black text-white shadow-sm">
              {initials}
            </span>
            <div>
              <h1 className="text-[17px] font-black tracking-tight text-ink leading-tight">
                {customerName || user?.name || "Mi Cuenta"}
              </h1>
              <p className="text-[11.5px] font-bold text-ink-soft">Panel de Cliente Rayte</p>
            </div>
          </div>

          <Link href="/" className="rounded-full bg-brand px-3.5 py-1.5 text-[12px] font-black text-white transition hover:bg-brand-dark active:scale-95 shadow-sm">
            Explorar
          </Link>
        </div>

        {/* Pestañas del Panel de Cliente */}
        <div className="no-scrollbar -mx-0 flex gap-1.5 overflow-x-auto px-4 pb-2 pt-1">
          {[
            { id: "perfil", label: "👤 Mi Perfil" },
            { id: "pedidos", label: `🛍️ Pedidos (${orders.length})` },
            { id: "citas", label: `📅 Mis Citas ${appts ? `(${appts.length})` : ""}` },
            { id: "favoritos", label: `❤️ Favoritos (${favorites.length})` },
            { id: "pagos", label: "💳 Pagos & Seguridad" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setClientTab(t.id as typeof clientTab)}
              className={`shrink-0 rounded-xl px-3.5 py-1.5 text-[12px] font-black transition ${
                clientTab === t.id
                  ? "bg-ink text-white shadow-sm"
                  : "bg-mist text-ink-soft hover:text-ink hover:bg-black/[0.06]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <div className="mx-auto max-w-xl space-y-4 px-4 pt-4">
        {/* ── Selector de Roles / Tipos de cuenta ── */}
        <section className="rounded-[26px] bg-white p-4 shadow-sm border border-black/5">
          <p className="text-[12px] font-black tracking-wide text-ink-soft uppercase">Cambiar de portal</p>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <button
              onClick={() => setClientTab("perfil")}
              className={`flex items-center gap-3 rounded-[20px] border p-3 text-left transition ${
                clientTab === "perfil" ? "border-brand bg-brand-soft ring-2 ring-brand/20" : "border-black/10 bg-white"
              }`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                <UserRound className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-black text-ink">Cliente</p>
                <p className="truncate text-[10.5px] font-bold text-ink-soft">Panel activo</p>
              </div>
            </button>

            <Link href="/socio" className="flex items-center gap-3 rounded-[20px] border border-black/10 bg-white p-3 text-left transition hover:border-[#0ea55b]/40 hover:bg-[#e6f8ee]/30 active:scale-[0.98]">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#e6f8ee] text-[#0ea55b]">
                <Store className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-black text-ink">Socio Negocio</p>
                <p className="truncate text-[10.5px] font-bold text-ink-soft">Gestionar tienda</p>
              </div>
            </Link>

            <Link href="/profesional" className="flex items-center gap-3 rounded-[20px] border border-black/10 bg-white p-3 text-left transition hover:border-[#1d6ae5]/40 hover:bg-[#e8f1fe]/30 active:scale-[0.98]">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#e8f1fe] text-[#1d6ae5]">
                <Stethoscope className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-black text-ink">Profesional</p>
                <p className="truncate text-[10.5px] font-bold text-ink-soft">Citas y médicos</p>
              </div>
            </Link>

            <Link href="/conductor" className="flex items-center gap-3 rounded-[20px] border border-black/10 bg-white p-3 text-left transition hover:border-amber-pop/40 hover:bg-amber-50 active:scale-[0.98]">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-pop/20 text-amber-700">
                <Bike className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-black text-ink">Conductor</p>
                <p className="truncate text-[10.5px] font-bold text-ink-soft">Entrega y gana</p>
              </div>
            </Link>
          </div>
        </section>

        {/* ── TAB 1: MI PERFIL Y DATOS ── */}
        {clientTab === "perfil" && (
          <div className="space-y-4">
            {/* Resumen del cliente */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[22px] bg-white p-4 shadow-sm border border-black/5">
                <p className="text-[11px] font-black text-ink-soft uppercase">Total gastado</p>
                <p className="text-xl font-black text-ink mt-0.5">{formatMXN(spent)}</p>
              </div>
              <div className="rounded-[22px] bg-white p-4 shadow-sm border border-black/5">
                <p className="text-[11px] font-black text-ink-soft uppercase">Nivel Rayte</p>
                <p className="flex items-center gap-1 text-lg font-black text-brand mt-0.5">
                  <Zap className="h-4.5 w-4.5 fill-brand" /> Turbo Amigo
                </p>
              </div>
            </div>

            {/* Sesión de usuario */}
            {authChecked && !user && (
              <section className="rounded-[26px] border-2 border-brand/25 bg-brand-soft/40 p-5">
                <div className="flex items-center gap-2">
                  {authMode === "register" ? <UserPlus className="h-5 w-5 text-brand" /> : <LogIn className="h-5 w-5 text-brand" />}
                  <p className="text-[15px] font-black">{authMode === "register" ? "Crea tu cuenta Rayte" : "Inicia sesión"}</p>
                </div>
                <p className="mt-1 text-[12.5px] font-bold text-ink-soft">Tus pedidos y favoritos te siguen en cualquier dispositivo.</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button onClick={() => { setAuthMode("register"); setAuthError(""); }} className={`rounded-2xl border py-2.5 text-[13px] font-black transition ${authMode === "register" ? "border-brand bg-white text-brand" : "border-black/10 text-ink-soft"}`}>Crear cuenta</button>
                  <button onClick={() => { setAuthMode("login"); setAuthError(""); }} className={`rounded-2xl border py-2.5 text-[13px] font-black transition ${authMode === "login" ? "border-brand bg-white text-brand" : "border-black/10 text-ink-soft"}`}>Ya tengo cuenta</button>
                </div>
                <div className="mt-3 space-y-2.5">
                  {authMode === "register" && (
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre completo" className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-[14px] font-bold outline-none focus:border-brand" />
                  )}
                  <input value={tel} onChange={(e) => setTel(e.target.value)} placeholder="Teléfono" inputMode="tel" className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-[14px] font-bold outline-none focus:border-brand" />
                  <input value={authPass} onChange={(e) => setAuthPass(e.target.value)} placeholder="Contraseña" type="password" className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-[14px] font-bold outline-none focus:border-brand" />
                </div>
                {authError && <p className="mt-2 rounded-2xl bg-brand-soft px-4 py-2.5 text-[12.5px] font-black text-brand">{authError}</p>}
                <motion.button whileTap={{ scale: 0.98 }} onClick={submitAuth} disabled={authBusy} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3.5 text-[14px] font-black text-white transition hover:bg-brand-dark disabled:opacity-60 shadow-md">
                  {authBusy ? "Un momento..." : authMode === "register" ? "Crear mi cuenta" : "Entrar a mi cuenta"}
                </motion.button>
              </section>
            )}

            {user && (
              <section className="flex items-center justify-between rounded-[26px] border-2 border-[#0ea55b]/25 bg-[#e6f8ee]/60 px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <Check className="h-5 w-5 text-[#0ea55b]" />
                  <div>
                    <p className="text-[14px] font-black text-ink">Sesión iniciada</p>
                    <p className="text-[12px] font-bold text-ink-soft">{user.name} · {user.phone}</p>
                  </div>
                </div>
                <button onClick={logout} className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[12px] font-black text-ink shadow-sm transition hover:bg-mist">
                  <LogOut className="h-3.5 w-3.5" /> Salir
                </button>
              </section>
            )}

            {/* Editar Datos Personales */}
            <section className="rounded-[26px] bg-white p-5 shadow-sm border border-black/5">
              <p className="text-[15px] font-black text-ink">Mis datos de contacto y entrega</p>
              <div className="mt-3 space-y-2.5">
                <div>
                  <label className="text-[11.5px] font-bold text-ink-soft">Nombre de contacto</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" className="w-full mt-1 rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none focus:border-brand" />
                </div>
                <div>
                  <label className="text-[11.5px] font-bold text-ink-soft">Teléfono</label>
                  <input value={tel} onChange={(e) => setTel(e.target.value)} placeholder="Teléfono" inputMode="tel" className="w-full mt-1 rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none focus:border-brand" />
                </div>
                <div>
                  <label className="text-[11.5px] font-bold text-ink-soft">Dirección principal</label>
                  <div className="relative mt-1">
                    <MapPin className="absolute top-3.5 left-4 h-4.5 w-4.5 text-brand" />
                    <input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="Dirección principal" className="w-full rounded-2xl border border-black/10 bg-mist py-3 pr-4 pl-11 text-[14px] font-bold outline-none focus:border-brand" />
                  </div>
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.98 }} onClick={save} className={`mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[14px] font-black text-white transition ${saved ? "bg-[#0ea55b]" : "bg-brand hover:bg-brand-dark"} shadow-md`}>
                {saved ? <><Check className="h-4.5 w-4.5" /> Guardado con éxito</> : "Guardar mis datos"}
              </motion.button>
            </section>
          </div>
        )}

        {/* ── TAB 2: MIS PEDIDOS ── */}
        {clientTab === "pedidos" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[15px] font-black text-ink">Tus pedidos ({orders.length})</p>
              <Link href="/pedidos" className="text-[12px] font-bold text-brand hover:underline">Ver seguimiento en vivo</Link>
            </div>

            {orders.length === 0 ? (
              <div className="rounded-[26px] bg-white p-8 text-center border border-black/5 shadow-sm">
                <ReceiptText className="mx-auto h-10 w-10 text-brand mb-2 opacity-80" />
                <p className="text-[15px] font-black text-ink">Aún no has realizado pedidos</p>
                <p className="text-[12.5px] font-bold text-ink-soft mt-1">Explora restaurantes y panaderías para hacer tu primer pedido.</p>
                <Link href="/" className="inline-block mt-4 rounded-full bg-brand px-5 py-2.5 text-[15px] font-black text-white">Explorar comida</Link>
              </div>
            ) : (
              orders.map((o) => (
                <div key={o.code} className="rounded-[22px] bg-white p-4 border border-black/5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[14.5px] font-black text-ink">{o.restaurant.name}</p>
                      <p className="text-[11.5px] font-bold text-ink-soft">Código: {o.code} · {o.payment}</p>
                    </div>
                    <span className="text-[15px] font-black text-brand">{formatMXN(o.total)}</span>
                  </div>
                  <p className="text-[12px] font-semibold text-ink-soft mt-2 line-clamp-1">
                    {o.items.map((i) => `${i.qty}× ${i.name}`).join(" · ")}
                  </p>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-black/5">
                    <span className="text-[11px] font-bold text-ink-soft">
                      {new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(o.placedAt))}
                    </span>
                    <Link href={`/pedido/${o.code}`} className="rounded-full bg-mist px-3 py-1.5 text-[11.5px] font-black text-brand hover:bg-brand-soft">
                      Ver en vivo →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── TAB 3: MIS CITAS DE SERVICIOS ── */}
        {clientTab === "citas" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[15px] font-black text-ink">Tus citas agendadas</p>
              <button onClick={loadAppts} className="text-[12px] font-bold text-brand hover:underline">Refrescar</button>
            </div>

            {loadingAppts && <p className="text-[12px] font-bold text-ink-soft">Buscando tus citas...</p>}

            {appts && appts.length === 0 ? (
              <div className="rounded-[26px] bg-white p-8 text-center border border-black/5 shadow-sm">
                <CalendarDays className="mx-auto h-10 w-10 text-[#7c3aed] mb-2 opacity-80" />
                <p className="text-[15px] font-black text-ink">No tienes citas agendadas</p>
                <p className="text-[12.5px] font-bold text-ink-soft mt-1">Agenda citas de belleza, bienestar, hogar, mascotas o médicos.</p>
                <Link href="/servicios" className="inline-block mt-4 rounded-full bg-ink px-5 py-2.5 text-[15px] font-black text-white">Ver servicios</Link>
              </div>
            ) : (
              appts?.map((a) => (
                <div key={a.id} className="rounded-[22px] bg-white p-4 border border-black/5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[14.5px] font-black text-ink">{a.serviceName}</p>
                      <p className="text-[12px] font-bold text-ink-soft">
                        {new Intl.DateTimeFormat("es-MX", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(a.startAt))} · Código: {a.code}
                      </p>
                    </div>
                    <span className="text-[14px] font-black text-ink">{formatMXN(a.price)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11.5px] font-bold text-ink-soft">
                    <span>{a.mode === "domicilio" ? "🛵 A domicilio" : "🏪 En el local"}</span>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10.5px] font-black text-emerald-600">Confirmada</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── TAB 4: MIS FAVORITOS ── */}
        {clientTab === "favoritos" && (
          <div className="space-y-3">
            <p className="text-[15px] font-black text-ink">Tiendas favoritas guardadas ({favorites.length})</p>
            {favorites.length === 0 ? (
              <div className="rounded-[26px] bg-white p-8 text-center border border-black/5 shadow-sm">
                <Heart className="mx-auto h-10 w-10 text-brand mb-2 opacity-80" />
                <p className="text-[15px] font-black text-ink">No tienes favoritos aún</p>
                <p className="text-[12.5px] font-bold text-ink-soft mt-1">Toca el corazón en cualquier tienda o platillo para guardarlo aquí.</p>
                <Link href="/" className="inline-block mt-4 rounded-full bg-brand px-5 py-2.5 text-[15px] font-black text-white">Explorar tiendas</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {favorites.map((slug) => (
                  <Link
                    key={slug}
                    href={`/restaurante/${slug}`}
                    className="flex items-center justify-between rounded-2xl bg-white p-3.5 border border-black/5 shadow-sm transition hover:border-brand"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-soft text-brand">
                        <Heart className="h-4.5 w-4.5 fill-brand" />
                      </span>
                      <p className="text-[14px] font-black capitalize text-ink">{slug.replace(/-/g, " ")}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-ink-soft" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 5: PAGOS & SEGURIDAD ── */}
        {clientTab === "pagos" && (
          <div className="space-y-4">
            <section className="rounded-[26px] bg-white p-5 shadow-sm border border-black/5 space-y-3">
              <p className="text-[15px] font-black text-ink">Métodos de pago guardados</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-mist border border-black/5">
                  <div className="flex items-center gap-2.5">
                    <Banknote className="h-5 w-5 text-[#0ea55b]" />
                    <div>
                      <p className="text-[13px] font-black text-ink">Efectivo</p>
                      <p className="text-[11px] font-bold text-ink-soft">Pago contra entrega en mano</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-[#0ea55b]">Predeterminado</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-mist border border-black/5">
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="h-5 w-5 text-amber-pop" />
                    <div>
                      <p className="text-[13px] font-black text-ink">Tarjeta Visa •••• 4821</p>
                      <p className="text-[11px] font-bold text-ink-soft">Vence 09/28 · Débito</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-ink-soft">Activa</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-mist border border-black/5">
                  <div className="flex items-center gap-2.5">
                    <Landmark className="h-5 w-5 text-sky-500" />
                    <div>
                      <p className="text-[13px] font-black text-ink">Transferencia / SPEI</p>
                      <p className="text-[11px] font-bold text-ink-soft">Disponible en entregas y viajes</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-ink-soft">Activa</span>
                </div>
              </div>
            </section>

            {/* Selector de color */}
            <section className="rounded-[26px] bg-white p-5 shadow-sm border border-black/5">
              <p className="text-[15px] font-black text-ink">🎨 Color de la app Rayte</p>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {PALETTES.map((p) => {
                  const active = paletteById(paletteId).id === p.id;
                  return (
                    <button key={p.id} onClick={() => setPalette(p.id)} className="flex flex-col items-center gap-1">
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-full transition active:scale-90"
                        style={{ backgroundColor: p.brand, boxShadow: active ? `0 0 0 2px #fff, 0 0 0 4px ${p.brand}` : undefined }}
                      >
                        {active && <Check className="h-4 w-4 text-white" strokeWidth={3.5} />}
                      </span>
                      <span className={`text-[10px] font-black truncate max-w-[55px] ${active ? "text-ink" : "text-ink-soft"}`}>{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        <p className="pt-2 text-center text-[11px] font-bold text-ink-soft/70">Rayte · Portal de Cliente v1.28</p>
      </div>
    </div>
  );
}
