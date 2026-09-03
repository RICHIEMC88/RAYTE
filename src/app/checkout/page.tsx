"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Banknote, CreditCard, Landmark, MapPin, ShoppingBag, Zap, CalendarDays, Clock3, Camera, Check, X, Receipt } from "lucide-react";
import { useCart, cartSubtotal, cartCount, type CartItem, type CartRestaurant } from "@/store/cart";
import { useOrders, type Order } from "@/store/orders";
import { formatMXN, serviceFeeFor } from "@/lib/utils";
import PaymentModal, { type PaymentResult, type PaymentMethod } from "@/components/payment-modal";

const PAYMENTS = [
  { id: "Efectivo", icon: Banknote, hint: "Pagas en efectivo al recibir", kind: "cash" as const },
  { id: "Mercado Pago", icon: CreditCard, hint: "Tarjeta, OXXO o transferencia", kind: "mp" as const, mpMethod: "card" as PaymentMethod },
  { id: "OXXO", icon: Receipt, hint: "Paga en efectivo en tiendas OXXO", kind: "mp" as const, mpMethod: "oxxo" as PaymentMethod },
  { id: "SPEI", icon: Landmark, hint: "Transferencia desde tu banco", kind: "mp" as const, mpMethod: "transfer" as PaymentMethod },
];
const TIPS = [0, 10, 15, 25];
const CHECKOUT_DRAFT_KEY = "rayte-checkout-draft";

type CheckoutDraft = {
  items: CartItem[];
  restaurant: CartRestaurant;
  address: string;
  customerName: string;
  phone: string;
  schedulePref: string | null;
};

const SLOTS: string[] = Array.from({ length: 28 }, (_, i) =>
  `${String(8 + Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`,
);

function buildDays() {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base.getTime() + i * 86400000);
    const label = i === 0 ? "Hoy" : i === 1 ? "Mañana" : new Intl.DateTimeFormat("es-MX", { weekday: "short" }).format(d).replace(".", "");
    return { date: d, label, num: d.getDate() };
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, restaurant, address, customerName, phone, schedulePref, setAddress, setCustomer, clear } = useCart();
  const addOrder = useOrders((s) => s.addOrder);
  const [mounted, setMounted] = useState(false);
  const [draft, setDraft] = useState<CheckoutDraft | null>(null);
  useEffect(() => setMounted(true), []);

  const [name, setName] = useState("");
  const [tel, setTel] = useState("");
  const [addr, setAddr] = useState("");
  const [payment, setPayment] = useState(PAYMENTS[0].id);
  const [tip, setTip] = useState(0);
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [when, setWhen] = useState<"asap" | "schedule">("asap");
  const [days, setDays] = useState<{ date: Date; label: string; num: number }[] | null>(null);
  const [dayIdx, setDayIdx] = useState(0);
  const [slot, setSlot] = useState<string | null>(null);
  const [deliveryPhoto, setDeliveryPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const restoredFormRef = useRef(false);

  // Pago con Mercado Pago (simulado)
  const [showPayment, setShowPayment] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<PaymentMethod>("card");

  useEffect(() => {
    if (!mounted || restoredFormRef.current) return;

    let savedDraft: CheckoutDraft | null = null;
    try {
      const raw = sessionStorage.getItem(CHECKOUT_DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CheckoutDraft;
        if (parsed?.items?.length && parsed?.restaurant) {
          savedDraft = parsed;
          setDraft(parsed);
        }
      }
    } catch {
      // ignore draft parse issues
    }

    setName(customerName || savedDraft?.customerName || "");
    setTel(phone || savedDraft?.phone || "");
    setAddr(address || savedDraft?.address || "");
    restoredFormRef.current = true;
  }, [mounted, customerName, phone, address]);

  useEffect(() => {
    setDays(buildDays());
  }, []);

  useEffect(() => {
    if (!mounted || !restoredFormRef.current) return;
    setCustomer(name, tel);
    setAddress(addr);
  }, [mounted, name, tel, addr, setCustomer, setAddress]);

  useEffect(() => {
    if (!mounted || !restoredFormRef.current) return;

    const baseItems = items.length ? items : draft?.items ?? [];
    const baseRestaurant = restaurant ?? draft?.restaurant ?? null;
    if (!baseItems.length || !baseRestaurant) return;

    const nextDraft: CheckoutDraft = {
      items: baseItems,
      restaurant: baseRestaurant,
      address: addr,
      customerName: name,
      phone: tel,
      schedulePref: schedulePref ?? draft?.schedulePref ?? null,
    };

    setDraft(nextDraft);
    sessionStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(nextDraft));
  }, [mounted, items, restaurant, draft, addr, name, tel, schedulePref]);

  const activeSchedulePref = schedulePref ?? draft?.schedulePref ?? null;

  // Si el usuario programó el pedido desde la página del restaurante, precargarlo
  useEffect(() => {
    if (!mounted || !activeSchedulePref || !days) return;
    const d = new Date(activeSchedulePref);
    if (Number.isNaN(d.getTime()) || d.getTime() <= Date.now()) return;
    const idx = days.findIndex((x) => x.date.toDateString() === d.toDateString());
    if (idx === -1) return;
    setWhen("schedule");
    setDayIdx(idx);
    setSlot(`${String(d.getHours()).padStart(2, "0")}:${d.getMinutes() >= 30 ? "30" : "00"}`);
  }, [mounted, activeSchedulePref, days]);

  if (!mounted) return null;

  const activeItems = items.length ? items : draft?.items ?? [];
  const activeRestaurant = restaurant ?? draft?.restaurant ?? null;
  const subtotal = cartSubtotal(activeItems);
  const count = cartCount(activeItems);
  const serviceFee = serviceFeeFor(subtotal);
  const deliveryFee = activeRestaurant?.deliveryFee ?? 0;
  const total = subtotal + serviceFee + deliveryFee + tip;

  if (activeItems.length === 0 || !activeRestaurant) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-8 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-soft"><ShoppingBag className="h-10 w-10 text-brand" strokeWidth={1.8} /></div>
        <p className="text-xl font-black">No hay nada para pagar</p>
        <p className="max-w-xs text-sm font-bold text-ink-soft">Tu carrito está vacío. Agrega algo rico y vuelve.</p>
        <Link href="/" className="mt-2 rounded-full bg-brand px-6 py-3 text-sm font-black text-white">Explorar</Link>
      </div>
    );
  }

  /* Crea el pedido (PostgreSQL) tras validar / pagar. */
  const createOrder = async (paymentLabel: string, scheduledFor?: string) => {
    if (placing) return;
    setPlacing(true);
    let code = `RY-${Math.floor(1000 + Math.random() * 9000)}`;
    /* Pedido REAL: se guarda en PostgreSQL (la tienda lo ve en su panel) */
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: activeRestaurant.id,
          items: activeItems,
          subtotal,
          deliveryFee,
          serviceFee,
          tip,
          total,
          customerName: name.trim(),
          phone: tel.trim(),
          address: addr.trim(),
          payment: paymentLabel,
          scheduledFor,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        code = data.order.code;
      }
    } catch {
      /* sin conexión: el pedido local sigue funcionando como respaldo */
    }
    const order: Order = {
      code,
      items: activeItems,
      restaurant: activeRestaurant,
      subtotal,
      deliveryFee,
      serviceFee,
      tip,
      total,
      customerName: name.trim(),
      phone: tel.trim(),
      address: addr.trim(),
      payment: paymentLabel,
      placedAt: Date.now(),
      etaMin: activeRestaurant.timeMin ?? 25,
      etaMax: activeRestaurant.timeMax ?? 40,
      scheduledFor,
      refPhoto: deliveryPhoto || undefined,
    };
    addOrder(order);
    clear();
    sessionStorage.removeItem(CHECKOUT_DRAFT_KEY);
    router.push(`/pedido/${code}`);
  };

  /* Se ejecuta al confirmar en el checkout. */
  const confirm = async () => {
    setError("");
    if (!name.trim() || !tel.trim() || !addr.trim()) {
      setError("Completa tu nombre, teléfono y dirección.");
      return;
    }
    let scheduledFor: string | undefined;
    if (when === "schedule") {
      if (!slot || !days) {
        setError("Elige el día y la hora de entrega programada.");
        return;
      }
      const d = new Date(days[dayIdx].date);
      const [h, m] = slot.split(":").map(Number);
      d.setHours(h, m, 0, 0);
      if (d.getTime() <= Date.now()) {
        setError("La hora programada ya pasó. Elige otra.");
        return;
      }
      scheduledFor = d.toISOString();
    }

    const selected = PAYMENTS.find((p) => p.id === payment);

    // Pago en línea (Mercado Pago simulado) → abrir el modal primero
    if (selected?.kind === "mp") {
      setPendingPayment(selected.mpMethod ?? "card");
      setShowPayment(true);
      return;
    }

    // Efectivo contra entrega
    await createOrder("Efectivo", scheduledFor);
  };

  /* Al aprobar/registrar el pago en el modal → crear el pedido. */
  const onPaymentSuccess = (p: PaymentResult) => {
    let label = "Mercado Pago";
    if (p.method === "card" && p.card_mask) label = `Mercado Pago ${p.card_mask}`;
    if (p.method === "oxxo") label = "Mercado Pago · OXXO";
    if (p.method === "transfer") label = "Mercado Pago · SPEI";
    let scheduledFor: string | undefined;
    if (when === "schedule" && slot && days) {
      const d = new Date(days[dayIdx].date);
      const [h, m] = slot.split(":").map(Number);
      d.setHours(h, m, 0, 0);
      scheduledFor = d.toISOString();
    }
    createOrder(label, scheduledFor);
  };

  const schedLabel = () => {
    if (!slot || !days) return "";
    const d = new Date(days[dayIdx].date);
    const [h, m] = slot.split(":").map(Number);
    d.setHours(h, m, 0, 0);
    return new Intl.DateTimeFormat("es-MX", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(d);
  };

  const restaurantHref = activeRestaurant ? `/restaurante/${activeRestaurant.slug}` : "/";
  const goBackToRestaurant = () => {
    if (typeof window !== "undefined") {
      window.location.assign(restaurantHref);
      return;
    }
    router.push(restaurantHref);
  };

  return (
    <div className="min-h-screen bg-mist/60 pb-20 sm:pb-24">
      <header className="sticky top-0 z-[250] border-b bg-white">
        <div className="relative z-[260] mx-auto flex max-w-lg items-center gap-3 px-4 py-4">
          <button
            type="button"
            onClick={goBackToRestaurant}
            onPointerUp={goBackToRestaurant}
            aria-label="Volver al restaurante"
            className="relative z-[999] flex min-w-[88px] shrink-0 items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 shadow-sm transition hover:bg-mist active:scale-90"
          >
            <ArrowLeft className="h-5 w-5 text-ink" />
            <span className="text-[12px] font-black text-ink">Volver</span>
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tight">Checkout</h1>
            <p className="text-[12.5px] font-bold text-ink-soft">{count} productos de {activeRestaurant?.name}</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-lg space-y-4 px-4 pt-5">
        {items.length === 0 && draft?.items?.length ? (
          <div className="rounded-2xl border border-brand/15 bg-brand-soft/60 px-4 py-3 text-[12.5px] font-bold text-brand">
            Recuperamos tu resumen de pago para que puedas terminar tu pedido sin que se cierre.
          </div>
        ) : null}
        <section className="rounded-[26px] bg-white p-5 shadow-sm">
          <p className="text-[15px] font-black">¿A dónde lo llevamos?</p>
          <div className="mt-3 space-y-2.5">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de quien recibe" className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none focus:border-brand" />
            <input value={tel} onChange={(e) => setTel(e.target.value)} placeholder="Teléfono" inputMode="tel" className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none focus:border-brand" />
            <div className="relative">
              <MapPin className="absolute top-3.5 left-4 h-4.5 w-4.5 text-brand" />
              <input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="Dirección de entrega" className="w-full rounded-2xl border border-black/10 bg-mist py-3 pr-4 pl-11 text-[14px] font-bold outline-none focus:border-brand" />
            </div>
          </div>

          {/* 📸 Foto de fachada o entrada para el repartidor */}
          <div className="mt-3 rounded-2xl border border-black/5 bg-mist/60 p-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm text-ink-soft">
                  <Camera className="h-4.5 w-4.5 text-brand" />
                </span>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-black text-ink">Foto de la fachada o entrada <span className="text-ink-soft text-[11px] font-bold">(opcional)</span></p>
                  <p className="text-[11px] font-bold text-ink-soft truncate">Ayuda al repartidor a ubicar tu puerta rápido</p>
                </div>
              </div>

              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={fileRef}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      if (ev.target?.result) setDeliveryPhoto(ev.target.result as string);
                    };
                    reader.readAsDataURL(f);
                  }
                }}
              />

              {!deliveryPhoto ? (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex shrink-0 items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1.5 text-[11.5px] font-black text-brand transition hover:bg-brand/15 active:scale-95"
                >
                  <Camera className="h-3.5 w-3.5" /> Tomar foto
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setDeliveryPhoto(null)}
                  className="flex shrink-0 items-center gap-1 rounded-full bg-mist px-2.5 py-1 text-[11px] font-black text-ink-soft hover:text-brand"
                >
                  <X className="h-3.5 w-3.5" /> Quitar
                </button>
              )}
            </div>

            {deliveryPhoto && (
              <div className="mt-3 flex items-center gap-3 rounded-xl bg-white p-2 border border-black/5">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                  <Image src={deliveryPhoto} alt="Fachada" fill className="object-cover" sizes="48px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-black text-[#0ea55b] flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> Foto adjunta
                  </p>
                  <p className="text-[11px] font-bold text-ink-soft truncate">El repartidor verá tu fachada en su mapa</p>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[26px] bg-white p-5 shadow-sm">
          <p className="text-[15px] font-black">¿Cuándo lo quieres?</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={() => setWhen("asap")} className={`flex items-center justify-center gap-2 rounded-2xl border py-3.5 text-[14px] font-black transition active:scale-[0.97] ${when === "asap" ? "border-brand bg-brand-soft text-brand" : "border-black/10 text-ink"}`}>
              <Zap className="h-4.5 w-4.5" /> Lo antes posible
            </button>
            <button onClick={() => setWhen("schedule")} className={`flex items-center justify-center gap-2 rounded-2xl border py-3.5 text-[14px] font-black transition active:scale-[0.97] ${when === "schedule" ? "border-brand bg-brand-soft text-brand" : "border-black/10 text-ink"}`}>
              <CalendarDays className="h-4.5 w-4.5" /> Programar
            </button>
          </div>
          {when === "asap" ? (
            <p className="mt-2.5 flex items-center gap-1.5 text-[12.5px] font-bold text-ink-soft"><Clock3 className="h-4 w-4 text-brand" /> Llega en ~{activeRestaurant?.timeMin ?? 25}-{activeRestaurant?.timeMax ?? 40} min</p>
          ) : (
            <>
              <p className="mt-4 text-[12px] font-black text-ink-soft uppercase">Día</p>
              <div className="no-scrollbar -mx-1 mt-2 flex gap-2 overflow-x-auto px-1">
                {(days ?? Array.from({ length: 7 })).map((d, i) =>
                  d && "num" in d ? (
                    <button key={i} onClick={() => setDayIdx(i)} className={`flex w-[74px] shrink-0 flex-col items-center rounded-2xl border py-2.5 transition active:scale-95 ${dayIdx === i ? "border-brand bg-brand-soft" : "border-black/10"}`}>
                      <span className="text-[11px] font-black text-ink-soft capitalize">{d.label}</span>
                      <span className={`text-lg font-black ${dayIdx === i ? "text-brand" : ""}`}>{d.num}</span>
                    </button>
                  ) : (
                    <div key={i} className="h-[60px] w-[74px] shrink-0 animate-pulse rounded-2xl bg-mist" />
                  ),
                )}
              </div>
              <p className="mt-4 text-[12px] font-black text-ink-soft uppercase">Hora de entrega</p>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {SLOTS.map((s) => (
                  <button key={s} onClick={() => setSlot(s)} className={`rounded-xl border py-2 text-[12.5px] font-black transition active:scale-95 ${slot === s ? "border-brand bg-brand text-white" : "border-black/10 hover:border-brand/40"}`}>{s}</button>
                ))}
              </div>
              {slot && <p className="mt-2.5 text-[12.5px] font-bold text-brand">Entrega programada: {schedLabel()}</p>}
            </>
          )}
        </section>

        <section className="rounded-[26px] bg-white p-5 shadow-sm">
          <p className="text-[15px] font-black">Método de pago</p>
          <div className="mt-3 space-y-2">
            {PAYMENTS.map((p) => {
              const active = payment === p.id;
              const Icon = p.icon;
              return (
                <button key={p.id} onClick={() => setPayment(p.id)} className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${active ? "border-brand bg-brand-soft" : "border-black/10"}`}>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${active ? "bg-brand text-white" : "bg-mist text-ink"}`}><Icon className="h-5 w-5" /></span>
                  <span className="flex-1">
                    <span className="block text-[14px] font-extrabold">{p.id}</span>
                    <span className="block text-[12px] font-bold text-ink-soft">{p.hint}</span>
                  </span>
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${active ? "border-brand" : "border-black/20"}`}>{active && <span className="h-2.5 w-2.5 rounded-full bg-brand" />}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-[26px] bg-white p-5 shadow-sm">
          <p className="text-[15px] font-black">Propina para el repartidor</p>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {TIPS.map((t) => (
              <button key={t} onClick={() => setTip(t)} className={`rounded-2xl border py-2.5 text-[13px] font-black transition active:scale-95 ${tip === t ? "border-brand bg-brand text-white" : "border-black/10"}`}>
                {t === 0 ? "Sin" : formatMXN(t)}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[26px] bg-white p-5 shadow-sm">
          <div className="space-y-1.5 text-[13.5px] font-bold text-ink-soft">
            <div className="flex justify-between"><span>Entrega</span><span className="text-ink">{when === "asap" ? `Lo antes posible (~${activeRestaurant?.timeMin ?? 25}-${activeRestaurant?.timeMax ?? 40} min)` : slot ? schedLabel() : "Programada"}</span></div>
            <div className="flex justify-between"><span>Subtotal</span><span className="text-ink">{formatMXN(subtotal)}</span></div>
            <div className="flex justify-between"><span>Envío</span><span className="text-ink">{deliveryFee === 0 ? "Gratis" : formatMXN(deliveryFee)}</span></div>
            <div className="flex justify-between"><span>Tarifa de servicio</span><span className="text-ink">{formatMXN(serviceFee)}</span></div>
            {tip > 0 && <div className="flex justify-between"><span>Propina</span><span className="text-ink">{formatMXN(tip)}</span></div>}
            <div className="mt-2 flex justify-between border-t border-black/5 pt-3 text-[16px] font-black text-ink"><span>Total</span><span>{formatMXN(total)}</span></div>
          </div>
        </section>

        {error && <p className="rounded-2xl bg-brand-soft px-4 py-3 text-center text-[13.5px] font-black text-brand">{error}</p>}

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={confirm}
          disabled={placing}
          className="flex w-full items-center justify-between rounded-full bg-brand px-5 py-4 font-black text-white shadow-[0_12px_28px_var(--brand-glow)] transition hover:bg-brand-dark disabled:opacity-60"
        >
          <span className="flex items-center gap-2 text-[15px]"><Zap className="h-4.5 w-4.5 fill-white" /> {placing ? "Enviando pedido..." : "Confirmar pedido"}</span>
          <span>{formatMXN(total)}</span>
        </motion.button>
      </div>

      {/* Modal de pago Mercado Pago (simulado) */}
      <PaymentModal
        open={showPayment}
        amount={total}
        initialMethod={pendingPayment}
        customer={{ name: name.trim(), phone: tel.trim() }}
        onClose={() => { setShowPayment(false); setError(""); }}
        onSuccess={onPaymentSuccess}
      />
    </div>
  );
}
