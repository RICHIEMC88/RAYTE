"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Bike, CalendarDays, Check, ChefHat, CircleCheck, Home, MapPin, MessageCircle, Phone, Star, Camera } from "lucide-react";
import { useOrders, orderStep, orderIsScheduled, ORDER_STEPS, type Order } from "@/store/orders";
import { formatMXN } from "@/lib/utils";

const ROUTE = "M 36 196 C 120 40, 250 240, 368 88";
const STEP_ICONS = [CircleCheck, ChefHat, Bike, Home];

type ApiDriver = { id: number; name: string; vehicle: string; plate: string; rating: number } | null;
type ApiOrder = {
  code: string;
  restaurantName: string;
  items: { key: string; name: string; price: number; qty: number; options?: string }[];
  subtotal: number; deliveryFee: number; serviceFee: number; tip: number; total: number;
  customerName: string; phone: string; address: string; payment: string;
  status: "placed" | "preparing" | "ready" | "on_way" | "delivered";
  etaMin: number; etaMax: number;
  scheduledFor: string | null; placedAt: string; onWayAt: string | null; deliveredAt: string | null;
  rating: number | null;
  driver: ApiDriver;
};

const FALLBACK_DRIVERS = [
  { name: "Andrés M.", vehicle: "Moto", plate: "RY-421", rating: 4.9 },
  { name: "Carolina R.", vehicle: "Moto", plate: "RY-133", rating: 4.8 },
  { name: "Jorge L.", vehicle: "Carro", plate: "RY-809", rating: 4.9 },
  { name: "María F.", vehicle: "Bicicleta", plate: "RY-265", rating: 4.7 },
];

const STEP_OF_STATUS: Record<ApiOrder["status"], number> = {
  placed: 0, preparing: 1, ready: 1, on_way: 2, delivered: 3,
};

export default function PedidoPage() {
  const params = useParams();
  const code = params.code as string;
  const orders = useOrders((s) => s.orders);
  const ratings = useOrders((s) => s.ratings);
  const rateOrderLocal = useOrders((s) => s.rateOrder);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  /* ── Pedido REAL desde la base de datos (con sondeo en vivo) ── */
  const [api, setApi] = useState<ApiOrder | null>(null);
  const [apiTried, setApiTried] = useState(false);
  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/orders?code=${encodeURIComponent(code)}`, { cache: "no-store" });
        if (!stop && res.ok) {
          const data = await res.json();
          setApi(data.order);
        }
      } catch { /* offline: usa respaldo local */ }
      if (!stop) setApiTried(true);
    };
    load();
    const t = setInterval(() => {
      // deja de sondear cuando ya se entregó
      setApi((prev) => {
        if (!prev || prev.status !== "delivered") load();
        return prev;
      });
    }, 4000);
    return () => { stop = true; clearInterval(t); };
  }, [code]);

  const localOrder: Order | undefined = useMemo(() => orders.find((o) => o.code === code), [orders, code]);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const fallbackDriver = useMemo(() => {
    let h = 0;
    for (const c of code) h = (h * 31 + c.charCodeAt(0)) % 997;
    return FALLBACK_DRIVERS[h % FALLBACK_DRIVERS.length];
  }, [code]);

  if (!mounted) return null;
  if (!api && !apiTried) return null;

  if (!api && !localOrder) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-8 text-center">
        <span className="text-4xl font-black italic text-brand">Ups</span>
        <p className="text-lg font-black">Pedido no encontrado</p>
        <p className="max-w-xs text-sm font-bold text-ink-soft">No encontramos el pedido {code}.</p>
        <Link href="/pedidos" className="mt-2 rounded-full bg-brand px-6 py-3 text-sm font-black text-white">Ver mis pedidos</Link>
      </div>
    );
  }

  /* Normaliza: el pedido de la DB manda; el local es respaldo sin conexión */
  const o = api
    ? {
        code: api.code,
        storeName: api.restaurantName,
        items: api.items,
        subtotal: api.subtotal, deliveryFee: api.deliveryFee, serviceFee: api.serviceFee, tip: api.tip, total: api.total,
        customerName: api.customerName, phone: api.phone, address: api.address, payment: api.payment,
        etaMin: api.etaMin, etaMax: api.etaMax,
        scheduledFor: api.scheduledFor ?? undefined,
        placedAt: new Date(api.placedAt).getTime(),
        onWayAt: api.onWayAt ? new Date(api.onWayAt).getTime() : null,
        step: STEP_OF_STATUS[api.status],
        ready: api.status === "ready",
        rating: api.rating ?? 0,
        driver: api.driver,
      }
    : {
        code: localOrder!.code,
        storeName: localOrder!.restaurant.name,
        items: localOrder!.items,
        subtotal: localOrder!.subtotal, deliveryFee: localOrder!.deliveryFee, serviceFee: localOrder!.serviceFee, tip: localOrder!.tip, total: localOrder!.total,
        customerName: localOrder!.customerName, phone: localOrder!.phone, address: localOrder!.address, payment: localOrder!.payment,
        etaMin: localOrder!.etaMin, etaMax: localOrder!.etaMax,
        scheduledFor: localOrder!.scheduledFor,
        placedAt: localOrder!.placedAt,
        onWayAt: null,
        step: orderStep(localOrder!, now),
        ready: false,
        rating: ratings[code] ?? 0,
        driver: null,
      };

  const step = o.step;
  const upcoming = !!o.scheduledFor && now < new Date(o.scheduledFor).getTime();
  const schedDate = o.scheduledFor ? new Date(o.scheduledFor) : null;
  const schedFull = schedDate
    ? new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" }).format(schedDate)
    : "";
  const schedShort = schedDate ? new Intl.DateTimeFormat("es-MX", { hour: "numeric", minute: "2-digit" }).format(schedDate) : "";

  const tripProgress = step >= 3 ? 1 : step === 2 && o.onWayAt ? Math.max(0.02, Math.min(0.96, (now - o.onWayAt) / 90000)) : step === 2 ? 0.3 : 0;
  const elapsed = (now - o.placedAt) / 1000;
  const minsLeft = Math.max(1, Math.round(o.etaMax - elapsed / 60 * 2.2));

  const driver = o.driver ?? fallbackDriver;
  const showDriver = step >= 2 && !upcoming;
  const myRating = o.rating || (ratings[code] ?? 0);

  const rate = async (n: number) => {
    rateOrderLocal(code, n);
    if (api) {
      try {
        await fetch("/api/orders", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "rate", code, rating: n }),
        });
        setApi((prev) => (prev ? { ...prev, rating: n } : prev));
      } catch { /* queda guardado localmente */ }
    }
  };

  const itemCount = o.items.reduce((a, i) => a + i.qty, 0);

  return (
    <div className="min-h-screen bg-white pb-20 sm:pb-24">
      <header className="sticky top-0 z-40 border-b bg-white">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-4">
          <Link href="/pedidos" aria-label="Volver" className="flex h-9 w-9 items-center justify-center rounded-full bg-mist"><ArrowLeft className="h-5 w-5" /></Link>
          <div className="flex-1">
            <h1 className="text-lg font-black tracking-tight">Pedido {o.code}</h1>
            <p className="text-[12.5px] font-bold text-ink-soft">{o.storeName} · {itemCount} productos {api && <span className="text-[#0ea55b]">· en vivo</span>}</p>
          </div>
          <span className={`rounded-full px-3 py-1.5 text-[11.5px] font-black ${step === 3 && !upcoming ? "bg-[#e6f8ee] text-[#0ea55b]" : "bg-brand-soft text-brand"}`}>
            {upcoming ? "Programado" : step === 3 ? "Entregado" : `Llega en ~${minsLeft} min`}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-lg space-y-4 px-4 pt-5">
        <section className="overflow-hidden rounded-[26px] border">
          <RouteMap progress={tripProgress} step={step} ready={o.ready} note={upcoming ? `Programado para ${schedShort}` : undefined} />
          {showDriver && (
            <div className="flex items-center justify-between gap-3 bg-white p-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-[15px] font-black text-white">{driver.name[0]}</span>
                <div className="min-w-0">
                  <p className="truncate text-[14.5px] font-black">{driver.name}</p>
                  <p className="text-[12px] font-bold text-ink-soft">{driver.vehicle} · {driver.plate} · <Star className="mb-0.5 inline h-3 w-3 fill-amber-pop text-amber-pop" /> {driver.rating}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button aria-label="Chat" className="flex h-10 w-10 items-center justify-center rounded-full bg-mist transition hover:bg-black/10"><MessageCircle className="h-4.5 w-4.5" /></button>
                <button aria-label="Llamar" className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white transition hover:bg-brand-dark"><Phone className="h-4.5 w-4.5" /></button>
              </div>
            </div>
          )}
        </section>

        {upcoming && schedDate && (
          <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="rounded-[26px] border-2 border-dashed border-brand/40 bg-brand-soft/60 p-6 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand text-white shadow-[0_10px_24px_var(--brand-glow)]">
              <CalendarDays className="h-8 w-8" />
            </span>
            <p className="mt-3 text-lg font-black">Pedido programado</p>
            <p className="mt-1 text-[13.5px] font-bold text-ink">{schedFull}</p>
            <p className="mt-2 text-[12.5px] font-bold text-ink-soft">Lo preparamos a esa hora y llega en ~{o.etaMin}-{o.etaMax} min. Te avisamos cuando salga el repartidor.</p>
          </motion.section>
        )}

        <section className="rounded-[26px] border p-5">
          <p className="text-[15px] font-black">Estado del pedido</p>
          <ol className="mt-4 space-y-0">
            {ORDER_STEPS.map((s, i) => {
              const Icon = STEP_ICONS[i];
              const reached = i <= step;
              return (
                <li key={s.label} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <motion.span initial={false} animate={{ scale: reached ? 1 : 0.85 }} className={`flex h-9 w-9 items-center justify-center rounded-full ${reached ? "bg-brand text-white" : "bg-mist text-ink-soft"}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </motion.span>
                    {i < ORDER_STEPS.length - 1 && <span className={`w-0.5 flex-1 ${i < step ? "bg-brand" : "bg-mist"}`} style={{ minHeight: 22 }} />}
                  </div>
                  <div className="pb-4">
                    <p className={`pt-1.5 text-[14px] ${reached ? "font-black" : "font-bold text-ink-soft"}`}>
                      {upcoming && i === 0 ? `Programado · ${schedShort}` : i === 1 && o.ready ? "Listo, esperando repartidor" : s.label}
                    </p>
                    {i === step && i < 3 && !upcoming && <p className="text-[12px] font-bold text-brand">En curso...</p>}
                    {upcoming && i === 0 && schedFull && <p className="text-[12px] font-bold text-brand capitalize">{schedFull}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {step === 3 && (
          <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="rounded-[26px] border-2 border-brand/25 bg-brand-soft/60 p-5 text-center">
            <p className="text-[15px] font-black">¿Cómo estuvo tu pedido?</p>
            <div className="mt-3 flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => rate(n)} aria-label={`${n} estrellas`} className="transition active:scale-90">
                  <Star className={`h-8 w-8 ${myRating >= n ? "fill-amber-pop text-amber-pop" : "text-black/20"}`} />
                </button>
              ))}
            </div>
            {myRating > 0 && <p className="mt-2 flex items-center justify-center gap-1 text-[13px] font-black text-brand"><Check className="h-4 w-4" /> ¡Gracias por calificar!</p>}
          </motion.section>
        )}

        <section className="rounded-[26px] border p-5">
          <p className="text-[15px] font-black">Resumen</p>
          <div className="mt-3 space-y-1.5">
            {o.items.map((i) => (
              <div key={i.key} className="flex justify-between text-[13.5px] font-bold">
                <span className="text-ink-soft">{i.qty}× {i.name}{i.options ? ` (${i.options})` : ""}</span>
                <span>{formatMXN(i.price * i.qty)}</span>
              </div>
            ))}
            <div className="mt-2 space-y-1 border-t border-black/5 pt-2 text-[13px] font-bold text-ink-soft">
              <div className="flex justify-between"><span>Envío</span><span className="text-ink">{o.deliveryFee === 0 ? "Gratis" : formatMXN(o.deliveryFee)}</span></div>
              <div className="flex justify-between"><span>Tarifa de servicio</span><span className="text-ink">{formatMXN(o.serviceFee)}</span></div>
              {o.tip > 0 && <div className="flex justify-between"><span>Propina</span><span className="text-ink">{formatMXN(o.tip)}</span></div>}
              <div className="flex justify-between border-t border-black/5 pt-2 text-[15.5px] font-black text-ink"><span>Total</span><span>{formatMXN(o.total)}</span></div>
            </div>
          </div>
          <div className="mt-4 space-y-1.5 rounded-2xl bg-mist p-4 text-[13px] font-bold text-ink-soft">
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0 text-brand" /> <span className="truncate text-ink">{o.address}</span></p>
            <p>Recibe: {o.customerName} · {o.phone}</p>
            <p>Pago: {o.payment}</p>

            {localOrder?.refPhoto && (
              <div className="mt-2.5 flex items-center gap-3 rounded-xl bg-white p-2.5 border border-black/5">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                  <Image src={localOrder.refPhoto} alt="Fachada" fill className="object-cover" sizes="48px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-black text-ink flex items-center gap-1">
                    <Camera className="h-3.5 w-3.5 text-brand" /> Foto de fachada adjunta
                  </p>
                  <p className="text-[11px] font-bold text-ink-soft truncate">Compartida con tu repartidor</p>
                </div>
              </div>
            )}
          </div>
        </section>

        <Link href="/" className="block rounded-full bg-ink px-5 py-4 text-center text-[15px] font-black text-white transition hover:bg-black">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

function RouteMap({ progress, step, ready, note }: { progress: number; step: number; ready?: boolean; note?: string }) {
  const routeRef = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(0);
  const [pt, setPt] = useState({ x: 36, y: 196 });

  useEffect(() => {
    const p = routeRef.current;
    if (!p) return;
    const L = p.getTotalLength();
    setLen(L);
  }, []);

  useEffect(() => {
    const p = routeRef.current;
    if (!p) return;
    const L = p.getTotalLength();
    const i = p.getPointAtLength(progress * L);
    setPt({ x: i.x, y: i.y });
  }, [progress]);

  return (
    <div className="relative bg-[#fafafa]">
      <svg viewBox="0 0 400 240" className="block w-full">
        <defs>
          <pattern id="ped-grid" width="26" height="26" patternUnits="userSpaceOnUse">
            <path d="M 26 0 L 0 0 0 26" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="400" height="240" fill="url(#ped-grid)" />
        <path d={ROUTE} stroke="#e5e7eb" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d={ROUTE} ref={routeRef} strokeWidth="7" fill="none" strokeLinecap="round" strokeDasharray={len ? `${len * progress} ${len}` : "0 9999"} style={{ stroke: "var(--brand)", transition: "stroke-dasharray 1s linear" }} />
        <path d={ROUTE} stroke="#ffffff" strokeWidth="2.5" fill="none" strokeDasharray="8 18" className="route-dash" strokeLinecap="round" />
        <circle cx="36" cy="196" r="10" fill="#1f2937" />
        <text x="36" y="201" textAnchor="middle" fontSize="11">🏠</text>
        <circle cx="368" cy="88" r="10" fill="#0ea55b" />
        <text x="368" y="93" textAnchor="middle" fontSize="11">🏁</text>
        {step >= 2 && (
          <g>
            <circle cx={pt.x} cy={pt.y} r="14" fill="var(--brand-glow)" className="courier-ring" />
            <circle cx={pt.x} cy={pt.y} r="11" style={{ fill: "var(--brand)" }} stroke="#fff" strokeWidth="2.5" />
            <text x={pt.x} y={pt.y + 4} textAnchor="middle" fontSize="11">{step === 3 ? "🎉" : "🏍️"}</text>
          </g>
        )}
      </svg>
      {step < 2 && (
        <span className="absolute top-3 left-3 rounded-full bg-white px-3 py-1 text-[11px] font-black text-ink-soft shadow-sm">
          {note ?? (step === 0 ? "Confirmando con la tienda..." : ready ? "Listo, esperando repartidor..." : "Preparando tu pedido...")}
        </span>
      )}
    </div>
  );
}
