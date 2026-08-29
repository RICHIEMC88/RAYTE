"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Banknote, Bike, CarFront, Check, CircleCheck, Clock3, MapPin, Package, Phone,
  ShieldCheck, Star, Store, User, Zap, Sparkles, Navigation, DollarSign, ChevronRight
} from "lucide-react";
import { formatMXN } from "@/lib/utils";

type Driver = { id: number; name: string; vehicle: string; plate: string; rating: number; trips: number; photo?: string };
type LiveOrder = {
  id: number;
  code: string;
  restaurantName: string;
  customerName: string;
  address: string;
  items: { name: string; qty: number }[];
  deliveryFee: number;
  tip: number;
  total: number;
  status: string;
  placedAt: string;
  driverId: number | null;
};

const DRIVER_PROFILES: Record<number, { bio: string; badge: string; color: string }> = {
  1: { bio: "Especialista en entregas ultra rápidas en motocicleta", badge: "Moto Express", color: "#fbbf24" },
  2: { bio: "Socia conductora verificada en Rayte Mujer y moto urbana", badge: "🌸 Rayte Mujer", color: "#ec4899" },
  3: { bio: "Conductor certificado en viajes de confort y entregas seguras", badge: "Carro Confort", color: "#60a5fa" },
  4: { bio: "Capacidad para grupos, equipaje y pedidos voluminosos", badge: "Carro XL", color: "#34d399" },
};

export default function ConductorPage() {
  const [drivers, setDrivers] = useState<Driver[] | null>(null);
  const [driverId, setDriverId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"servicios" | "ganancias" | "vehiculo">("servicios");
  const [online, setOnline] = useState(true);
  const [available, setAvailable] = useState<LiveOrder[]>([]);
  const [mine, setMine] = useState<LiveOrder[]>([]);
  const [busy, setBusy] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const driver = drivers?.find((d) => d.id === driverId) ?? null;
  const profile = driverId ? (DRIVER_PROFILES[driverId] ?? DRIVER_PROFILES[1]) : DRIVER_PROFILES[1];

  useEffect(() => {
    fetch("/api/drivers").then(async (r) => {
      if (r.ok) {
        const data = await r.json();
        setDrivers(data.drivers);
        const saved = Number(localStorage.getItem("rayte-conductor") || 0);
        if (data.drivers.some((d: Driver) => d.id === saved)) setDriverId(saved);
      }
    }).catch(() => setDrivers([]));
  }, []);

  useEffect(() => {
    if (driverId) localStorage.setItem("rayte-conductor", String(driverId));
  }, [driverId]);

  /* Sondeo en vivo: entregas disponibles + mis entregas */
  const load = useCallback(async () => {
    if (!driverId) return;
    try {
      const [a, m] = await Promise.all([
        fetch("/api/orders?available=1", { cache: "no-store" }),
        fetch(`/api/orders?driver=${driverId}`, { cache: "no-store" }),
      ]);
      if (a.ok) setAvailable((await a.json()).orders);
      if (m.ok) setMine((await m.json()).orders);
    } catch { /* reintenta */ }
  }, [driverId]);

  useEffect(() => {
    if (!online || !driverId) {
      if (timer.current) clearInterval(timer.current);
      return;
    }
    load();
    timer.current = setInterval(load, 5000);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [online, driverId, load]);

  const claim = async (o: LiveOrder) => {
    if (!driverId || busy) return;
    setBusy(o.id);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "claim", code: o.code, driverId }),
      });
      if (res.ok) await load();
    } finally {
      setBusy(null);
    }
  };

  const deliver = async (o: LiveOrder) => {
    if (!driverId || busy) return;
    setBusy(o.id);
    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deliver", code: o.code, driverId }),
      });
      await load();
    } finally {
      setBusy(null);
    }
  };

  const today = new Date().toDateString();
  const deliveredToday = mine.filter((o) => o.status === "delivered" && new Date(o.placedAt).toDateString() === today);
  const active = mine.filter((o) => o.status === "on_way");
  const ganadoHoy = deliveredToday.reduce((a, o) => a + o.deliveryFee + o.tip + 1500, 0);
  const propinasHoy = deliveredToday.reduce((a, o) => a + o.tip, 0);
  const estimadoSemana = ganadoHoy * 5.5 + 45000;

  /* ---------- Pantalla 1: elegir conductor ---------- */
  if (!driverId) {
    return (
      <div className="min-h-screen bg-[#16121b] pb-20 sm:pb-24 text-white">
        <header className="mx-auto flex max-w-lg items-center gap-3 px-4 pt-6 pb-2">
          <Link href="/cuenta" aria-label="Volver" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"><ArrowLeft className="h-5 w-5" /></Link>
          <div>
            <h1 className="text-xl font-black tracking-tight">Portal de Conductores</h1>
            <p className="text-[12px] font-bold text-white/60">Selecciona tu perfil de conductor para entrar a tu dashboard</p>
          </div>
        </header>
        <div className="mx-auto max-w-lg space-y-3 px-4 pt-4">
          {!drivers && <p className="rounded-2xl bg-white/5 px-4 py-8 text-center text-[13px] font-bold text-white/60">Cargando conductores...</p>}
          {drivers?.map((d) => {
            const prof = DRIVER_PROFILES[d.id] ?? DRIVER_PROFILES[1];
            return (
              <button
                key={d.id}
                onClick={() => setDriverId(d.id)}
                className="flex w-full items-center gap-3.5 rounded-[24px] border border-white/10 bg-white/[0.05] p-4 text-left transition hover:border-amber-pop/60 hover:bg-white/[0.08] active:scale-[0.98]"
              >
                <span
                  className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl text-[18px] font-black shadow-md"
                  style={{ backgroundColor: prof.color, color: "#16121b" }}
                >
                  {d.name[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[16px] font-black">{d.name}</p>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-black bg-white/10 text-white/90">
                      {prof.badge}
                    </span>
                  </div>
                  <p className="text-[12px] font-bold text-white/60 mt-0.5">
                    {d.vehicle} · Placas {d.plate} · <Star className="mb-0.5 inline h-3 w-3 fill-amber-pop text-amber-pop" /> {d.rating}
                  </p>
                  <p className="text-[11px] font-semibold text-white/40 mt-0.5">{prof.bio}</p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-white/40" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ---------- Pantalla 2: Dashboard personal del conductor ---------- */
  return (
    <div className="min-h-screen bg-[#16121b] pb-24 text-white">
      {/* Header personalizado del conductor */}
      <header className="sticky top-0 z-40 bg-[#1d1824]/95 border-b border-white/10 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/cuenta" aria-label="Volver a cuenta" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-[16px] font-black shadow-md"
              style={{ backgroundColor: profile.color, color: "#16121b" }}
            >
              {driver?.name[0]}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="truncate text-[15.5px] font-black leading-tight">{driver?.name}</p>
                <span className="rounded-full px-2 py-0.2 text-[9.5px] font-black bg-white/15 text-white/90">
                  {profile.badge}
                </span>
              </div>
              <p className="text-[11.5px] font-bold text-white/60 truncate">
                {driver?.vehicle} · {driver?.plate} · <Star className="mb-0.5 inline h-3 w-3 fill-amber-pop text-amber-pop" /> {driver?.rating}
              </p>
            </div>
          </div>

          <button
            onClick={() => { setDriverId(null); setOnline(false); }}
            className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-[11.5px] font-black transition hover:bg-white/20"
          >
            Cambiar
          </button>
        </div>

        {/* Pestañas del Dashboard del conductor */}
        <div className="mx-auto max-w-lg flex gap-1 px-4 pt-1 pb-2">
          {[
            { id: "servicios", label: "Servicios en vivo" },
            { id: "ganancias", label: "Mis Ganancias" },
            { id: "vehiculo", label: "Mi Perfil & Auto" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as typeof activeTab)}
              className={`flex-1 rounded-xl py-2 text-[12px] font-black transition ${
                activeTab === t.id
                  ? "bg-amber-pop text-[#16121b] shadow-sm"
                  : "bg-white/[0.04] text-white/60 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <div className="mx-auto max-w-lg space-y-4 px-4 pt-4">
        {/* Switch de Estado Conectado / Desconectado */}
        <section className="flex items-center justify-between rounded-[26px] border border-white/10 bg-white/[0.05] p-4.5 backdrop-blur">
          <div>
            <p className="text-[11.5px] font-black text-white/50 uppercase tracking-wide">Tu disponibilidad</p>
            <p className={`mt-0.5 text-[20px] font-black ${online ? "text-[#4ade80]" : "text-white/60"}`}>
              {online ? "🟢 Conectado y recibiendo viajes" : "⚪ Desconectado"}
            </p>
            <p className="text-[11.5px] font-bold text-white/60">
              {online ? "Buscando pedidos y pasajeros en tu zona" : "Toca el interruptor para comenzar a ganar"}
            </p>
          </div>
          <button
            onClick={() => setOnline((v) => !v)}
            aria-label="Conectarse"
            className={`relative h-10 w-18 shrink-0 rounded-full transition ${online ? "bg-[#0ea55b]" : "bg-white/15"}`}
          >
            <motion.span
              layout
              className={`absolute top-1 h-8 w-8 rounded-full bg-white shadow-md ${online ? "right-1" : "left-1"}`}
            />
          </button>
        </section>

        {activeTab === "servicios" && (
          <>
            {/* Resumen rápido de hoy */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="rounded-[22px] bg-amber-pop p-3.5 text-[#16121b] shadow-sm">
                <p className="text-[10px] font-black uppercase opacity-70">Ganado hoy</p>
                <p className="text-[16px] font-black">{formatMXN(ganadoHoy)}</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/[0.05] p-3.5">
                <p className="text-[10px] font-black text-white/50 uppercase">Entregas</p>
                <p className="text-[16px] font-black">{deliveredToday.length}</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/[0.05] p-3.5">
                <p className="text-[10px] font-black text-white/50 uppercase">En curso</p>
                <p className="text-[16px] font-black text-amber-pop">{active.length}</p>
              </div>
            </div>

            {/* Mis entregas en curso */}
            {online && active.length > 0 && (
              <section className="rounded-[26px] border border-amber-pop/40 bg-amber-pop/10 p-5">
                <p className="flex items-center gap-2 text-[15px] font-black text-white">
                  <Package className="h-4.5 w-4.5 text-amber-pop" /> Entrega asignada a ti
                </p>
                <div className="mt-3 space-y-2.5">
                  {active.map((o) => (
                    <div key={o.id} className="rounded-[20px] border border-white/10 bg-[#16121b] p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[14.5px] font-black">{o.code} · {o.customerName}</p>
                        <span className="rounded-full bg-amber-pop/20 px-2.5 py-1 text-[10.5px] font-black text-amber-pop">
                          En camino
                        </span>
                      </div>
                      <p className="mt-1 flex items-center gap-1.5 text-[12px] font-bold text-white/70">
                        <Store className="h-3.5 w-3.5 shrink-0" /> {o.restaurantName}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[12px] font-bold text-white/70">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-brand" /> {o.address}
                      </p>
                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/10">
                        <span className="text-[13.5px] font-black text-amber-pop">
                          Ganancia: {formatMXN(o.deliveryFee + o.tip + 1500)}
                        </span>
                        <button
                          onClick={() => deliver(o)}
                          disabled={busy === o.id}
                          className="rounded-full bg-[#0ea55b] px-4 py-2 text-[12px] font-black text-white transition active:scale-95 disabled:opacity-50 shadow-md"
                        >
                          Marcar entregado
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Entregas y viajes disponibles para tomar */}
            <section className="rounded-[26px] border border-white/10 bg-white/[0.05] p-5">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-[15px] font-black">
                  Pedidos y viajes disponibles
                  {online && <span className="h-2 w-2 animate-pulse rounded-full bg-[#4ade80]" />}
                </p>
                <span className="text-[11px] font-bold text-white/50">{available.length} disponibles</span>
              </div>

              {!online ? (
                <p className="mt-3 rounded-2xl bg-white/5 px-4 py-6 text-center text-[13px] font-bold text-white/60">
                  Conéctate con el switch arriba para recibir pedidos y viajes en tiempo real.
                </p>
              ) : available.length === 0 ? (
                <div className="mt-3 rounded-2xl bg-white/5 px-4 py-8 text-center">
                  <Navigation className="mx-auto h-8 w-8 text-amber-pop animate-bounce mb-2 opacity-80" />
                  <p className="text-[14px] font-black">Buscando solicitudes en tu zona...</p>
                  <p className="text-[12px] font-bold text-white/50 mt-1">En cuanto una tienda marque listo un pedido o un cliente pida rayte, aparecerá aquí.</p>
                </div>
              ) : (
                <div className="mt-3 space-y-2.5">
                  {available.map((o) => (
                    <div key={o.id} className="rounded-[20px] border border-white/10 bg-[#1d1824] p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[14px] font-black">{o.code} · {o.restaurantName}</p>
                        <span className={`rounded-full px-2.5 py-1 text-[10.5px] font-black ${o.status === "ready" ? "bg-[#4ade80]/15 text-[#4ade80]" : "bg-white/10 text-white/60"}`}>
                          {o.status === "ready" ? "Listo para recoger" : "Preparándose"}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-1 text-[12px] font-bold text-white/60">{o.items.map((i) => `${i.qty}× ${i.name}`).join(" · ")}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[12px] font-bold text-white/70"><MapPin className="h-3.5 w-3.5 shrink-0" /> {o.address}</p>
                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/10">
                        <span className="text-[13px] font-black text-amber-pop">Ganas {formatMXN(o.deliveryFee + o.tip + 1500)}</span>
                        <button
                          onClick={() => claim(o)}
                          disabled={busy === o.id}
                          className="rounded-full bg-amber-pop px-4 py-2 text-[12px] font-black text-[#16121b] transition active:scale-95 disabled:opacity-50 shadow-sm"
                        >
                          {busy === o.id ? "Tomando..." : "Tomar pedido"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === "ganancias" && (
          <div className="space-y-4">
            <div className="rounded-[26px] bg-gradient-to-br from-amber-pop to-amber-500 p-6 text-[#16121b] shadow-xl">
              <p className="text-[12px] font-black uppercase tracking-wider opacity-80">Ganancias de {driver?.name}</p>
              <p className="text-[32px] font-black leading-tight mt-1">{formatMXN(ganadoHoy)}</p>
              <div className="mt-4 flex items-center gap-4 text-[13px] font-bold border-t border-[#16121b]/20 pt-3">
                <p>Propinas hoy: <span className="font-black">{formatMXN(propinasHoy)}</span></p>
                <p>Viajes hoy: <span className="font-black">{deliveredToday.length}</span></p>
              </div>
            </div>

            <section className="rounded-[26px] border border-white/10 bg-white/[0.05] p-5">
              <p className="text-[15px] font-black">Historial de entregas completadas hoy</p>
              {deliveredToday.length === 0 ? (
                <p className="mt-3 rounded-2xl bg-white/5 px-4 py-6 text-center text-[12.5px] font-bold text-white/50">
                  Aún no has completado entregas hoy. Conéctate para empezar.
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  {deliveredToday.map((o) => (
                    <div key={o.id} className="flex items-center justify-between rounded-2xl bg-white/[0.04] px-4 py-3 border border-white/5">
                      <div>
                        <p className="text-[13.5px] font-black">{o.code} · {o.restaurantName}</p>
                        <p className="text-[11.5px] font-bold text-white/50">Cliente: {o.customerName} · {o.address}</p>
                      </div>
                      <span className="shrink-0 text-[14px] font-black text-[#4ade80]">+{formatMXN(o.deliveryFee + o.tip + 1500)}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === "vehiculo" && (
          <div className="space-y-4">
            <section className="rounded-[26px] border border-white/10 bg-white/[0.05] p-5 space-y-3">
              <p className="text-[15px] font-black">Ficha del vehículo y conductor</p>
              <div className="space-y-2 text-[13px] font-bold">
                <p className="flex justify-between"><span className="text-white/60">Conductor:</span> <span className="font-black text-white">{driver?.name}</span></p>
                <p className="flex justify-between"><span className="text-white/60">Vehículo:</span> <span className="font-black text-amber-pop">{driver?.vehicle}</span></p>
                <p className="flex justify-between"><span className="text-white/60">Placas:</span> <span className="font-black text-white">{driver?.plate}</span></p>
                <p className="flex justify-between"><span className="text-white/60">Calificación:</span> <span className="font-black text-amber-pop">★ {driver?.rating} ({driver?.trips} viajes)</span></p>
                <p className="flex justify-between"><span className="text-white/60">Modalidad:</span> <span className="font-black text-pink-300">{profile.badge}</span></p>
                <p className="flex justify-between"><span className="text-white/60">Estatus:</span> <span className="font-black text-[#4ade80]">✓ Conductor Verificado Rayte</span></p>
              </div>
            </section>

            <section className="rounded-[26px] border border-white/10 bg-white/[0.05] p-5">
              <p className="text-[15px] font-black">Documentos y Seguridad</p>
              <div className="mt-3 space-y-2 text-[12.5px] font-bold text-white/70">
                <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#4ade80]" /> Licencia de conducir vigente</p>
                <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#4ade80]" /> Seguro de cobertura amplia activo</p>
                <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#4ade80]" /> Carta de no antecedentes penales</p>
              </div>
            </section>
          </div>
        )}

        <p className="pb-2 text-center text-[11px] font-black tracking-widest text-white/30 uppercase">
          Rayte Driver · Dashboard Personal de {driver?.name}
        </p>
      </div>
    </div>
  );
}
