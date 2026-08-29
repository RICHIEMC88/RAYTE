"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import CrossSell, { type CrossSellItem } from "@/components/cross-sell";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, Bike, BusFront, CalendarDays, CalendarClock, CarFront, Check, ChevronDown, CircleDollarSign, Clock3,
  Loader2, MapPin, Phone, Stethoscope, ShieldCheck, Star, Utensils, X, Zap, ShieldAlert, Siren, AlertOctagon,
  Share2, CheckCheck, Camera, Sparkles, CreditCard, Banknote, Landmark, Flower2
} from "lucide-react";
import { useCart } from "@/store/cart";
import { formatMXN } from "@/lib/utils";

const VEHICLES = [
  {
    id: "moto",
    label: "Moto",
    price: 45,
    eta: 10,
    icon: Bike,
    desc: "Ágil para 1 pasajero",
    driverName: "Leo M.",
    vehicleLine: "Moto negra",
    plate: "RY-421",
  },
  {
    id: "carro",
    label: "Carro",
    price: 85,
    eta: 14,
    icon: CarFront,
    desc: "Comodidad para 4",
    driverName: "Jorge M.",
    vehicleLine: "Carro blanco",
    plate: "RY-809",
  },
  {
    id: "xl",
    label: "Carro XL",
    price: 125,
    eta: 18,
    icon: CarFront,
    desc: "Grupos y equipaje",
    driverName: "Andrea P.",
    vehicleLine: "SUV negra",
    plate: "RY-642",
  },
  {
    id: "van-12",
    label: "Camioneta 12 pasajeros",
    price: 220,
    eta: 22,
    icon: BusFront,
    desc: "Ideal para grupos grandes",
    driverName: "Miguel T.",
    vehicleLine: "Van ejecutiva blanca",
    plate: "RY-120",
  },
] as const;

type VehicleOption = (typeof VEHICLES)[number];

const ROUTE = "M 36 196 C 120 40, 250 240, 368 88";

/* ── Los 4 servicios de Rayte (carrusel para pantallas de confirmación) ── */
const APP_SERVICES = [
  { href: "/buscar", label: "Comida", desc: "Restaurantes y farmacias", icon: Utensils, from: "#ea580c", to: "#c2410c" },
  { href: "/viajes", label: "Rayte", desc: "Viaja por la ciudad", icon: CarFront, from: "#f59e0b", to: "#b45309" },
  { href: "/servicios", label: "Citas", desc: "Belleza, hogar y más", icon: CalendarDays, from: "#7c3aed", to: "#6d28d9" },
  { href: "/servicios?cat=salud", label: "Salud", desc: "Doctores a domicilio", icon: Stethoscope, from: "#1d6ae5", to: "#144bb8" },
];

function ServiceCarousel() {
  return (
    <div className="mt-6">
      <p className="text-[12px] font-black tracking-widest text-white/50 uppercase">Mientras tanto en Rayte</p>
      <div className="no-scrollbar -mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-1">
        {APP_SERVICES.map(({ href, label, desc, icon: Icon, from, to }) => (
          <Link
            key={label}
            href={href}
            className="w-[150px] shrink-0 rounded-[22px] p-4 transition active:scale-95"
            style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20">
              <Icon className="h-5 w-5 text-white" strokeWidth={2.4} />
            </span>
            <p className="mt-3 text-[15px] font-black text-white">{label}</p>
            <p className="mt-0.5 text-[11.5px] leading-tight font-bold text-white/80">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ── Estilo Uber: fechas (30 días) y horas en pasos de 10 min ── */
const DAYS_AHEAD = 30;
const MIN_LEAD_MIN = 20; // igual que Uber: la recogida más próxima es en ~20 min

function buildDates() {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  return Array.from({ length: DAYS_AHEAD }, (_, i) => {
    const d = new Date(base.getTime() + i * 86400000);
    const label =
      i === 0
        ? "Hoy"
        : i === 1
          ? "Mañana"
          : new Intl.DateTimeFormat("es-MX", { weekday: "short", day: "numeric", month: "short" }).format(d).replace(/\./g, "");
    return { date: d, label };
  });
}

function buildTimes(day: Date) {
  const isToday = day.toDateString() === new Date().toDateString();
  const start = new Date(day);
  if (isToday) {
    const min = new Date(Date.now() + MIN_LEAD_MIN * 60000);
    min.setSeconds(0, 0);
    min.setMinutes(Math.ceil(min.getMinutes() / 10) * 10);
    start.setHours(min.getHours(), min.getMinutes(), 0, 0);
  } else {
    start.setHours(0, 0, 0, 0);
  }
  const end = new Date(day);
  end.setHours(23, 50, 0, 0);
  const fmt = new Intl.DateTimeFormat("es-MX", { hour: "numeric", minute: "2-digit" });
  const out: { date: Date; label: string }[] = [];
  for (let t = start.getTime(); t <= end.getTime(); t += 10 * 60000) {
    out.push({ date: new Date(t), label: fmt.format(t) });
  }
  return out;
}

/* ── Rueda deslizable estilo selector de iOS/Uber ── */
const ITEM_H = 40;
const WHEEL_H = 200;

function Wheel({ items, index, onChange, grow = false }: { items: string[]; index: number; onChange: (i: number) => void; grow?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settling = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (Math.round(el.scrollTop / ITEM_H) !== index) {
      settling.current = true;
      el.scrollTo({ top: index * ITEM_H });
      requestAnimationFrame(() => (settling.current = false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, items.length]);

  const onScroll = () => {
    if (settling.current) return;
    const el = ref.current;
    if (!el) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const i = Math.max(0, Math.min(items.length - 1, Math.round(el.scrollTop / ITEM_H)));
      onChange(i);
      el.scrollTo({ top: i * ITEM_H, behavior: "smooth" });
    }, 90);
  };

  return (
    <div className={`relative ${grow ? "flex-[1.4]" : "flex-1"}`} style={{ height: WHEEL_H }}>
      <div className="pointer-events-none absolute inset-x-1 top-1/2 h-10 -translate-y-1/2 rounded-xl bg-white/[0.08]" />
      <div
        ref={ref}
        onScroll={onScroll}
        className="no-scrollbar h-full snap-y snap-mandatory overflow-y-auto"
        style={{ paddingTop: (WHEEL_H - ITEM_H) / 2, paddingBottom: (WHEEL_H - ITEM_H) / 2 }}
      >
        {items.map((it, i) => (
          <button
            key={`${it}-${i}`}
            onClick={() => {
              onChange(i);
              ref.current?.scrollTo({ top: i * ITEM_H, behavior: "smooth" });
            }}
            className={`flex w-full snap-center items-center justify-center capitalize transition-colors ${i === index ? "text-[16px] font-black text-white" : "text-[14px] font-bold text-white/30"}`}
            style={{ height: ITEM_H }}
          >
            {it}
          </button>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-[#1d1824] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#1d1824] to-transparent" />
    </div>
  );
}

export default function ViajesClient({ crossItems = [], crossTitle }: { crossItems?: CrossSellItem[]; crossTitle?: string }) {
  const router = useRouter();
  const address = useCart((s) => s.address);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [destino, setDestino] = useState("");
  const [vehicle, setVehicle] = useState<VehicleOption>(VEHICLES[0]);
  const [phase, setPhase] = useState<"form" | "searching" | "assigned" | "scheduled">("form");

  const [when, setWhen] = useState<"now" | "schedule">("now");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [schedDate, setSchedDate] = useState<Date | null>(null);
  const [sosOpen, setSosOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  /* 🌸 Rayte Mujer: conductora mujer verificada */
  const [womenOnly, setWomenOnly] = useState(false);

  /* 💵 Método de pago */
  const [payment, setPayment] = useState<"Efectivo" | "Tarjeta •••• 4821" | "Transferencia SPEI">("Efectivo");
  const [paySheetOpen, setPaySheetOpen] = useState(false);

  /* 📸 Foto de referencia (opcional) */
  const [refPhoto, setRefPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const assignedDriverName = womenOnly ? "Carolina R." : vehicle.driverName;
  const assignedVehicleLine = vehicle.vehicleLine;
  const assignedPlate = vehicle.plate;

  /* Ruedas del sheet */
  const dates = useMemo(() => buildDates(), [sheetOpen]); // eslint-disable-line react-hooks/exhaustive-deps
  const [dayIdx, setDayIdx] = useState(0);
  const times = useMemo(() => buildTimes(dates[dayIdx]?.date ?? new Date()), [dates, dayIdx]);
  const [timeIdx, setTimeIdx] = useState(0);
  useEffect(() => setTimeIdx(0), [dayIdx]);

  if (!mounted) return null;

  const schedLabel = (d: Date | null, long = false) =>
    d
      ? new Intl.DateTimeFormat("es-MX", long
          ? { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" }
          : { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(d)
      : "";

  const openSheet = () => {
    setWhen("schedule");
    if (schedDate) {
      /* re-sincroniza las ruedas con lo ya elegido */
      const di = dates.findIndex((x) => x.date.toDateString() === schedDate.toDateString());
      if (di >= 0) {
        setDayIdx(di);
        const ts = buildTimes(dates[di].date);
        const ti = ts.findIndex((t) => t.date.getTime() === schedDate.getTime());
        setTimeIdx(ti >= 0 ? ti : 0);
      }
    }
    setSheetOpen(true);
  };

  const closeSheet = () => {
    setSheetOpen(false);
    if (!schedDate) setWhen("now"); /* cerró sin establecer hora → vuelve a "Ahora" */
  };

  const setPickup = () => {
    const chosen = times[timeIdx]?.date;
    if (!chosen) return;
    setSchedDate(chosen);
    setSheetOpen(false);
  };

  const rideNow = () => {
    setSchedDate(null);
    setWhen("now");
    setSheetOpen(false);
  };

  const request = () => {
    if (!destino.trim()) return;
    if (when === "schedule" && !schedDate) {
      openSheet();
      return;
    }
    setPhase("searching");
    setTimeout(() => setPhase(when === "schedule" ? "scheduled" : "assigned"), when === "schedule" ? 1400 : 1800);
  };

  return (
    <div className="min-h-screen bg-[#16121b] pb-28 text-white">
      <header className="mx-auto flex max-w-lg items-center gap-3 px-4 pt-6 pb-2">
        <Link href="/" aria-label="Volver a Rayte" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-pop"><Zap className="h-4.5 w-4.5 fill-[#16121b] text-[#16121b]" /></span>
          <span className="text-xl font-black italic">rayte go</span>
        </div>
        <span className="ml-auto rounded-full bg-white/10 px-3 py-1 text-[11px] font-black text-white/70">Beta</span>
      </header>

      <div className="mx-auto max-w-lg px-4 pt-4">
        {phase === "form" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-[26px] font-black tracking-tight">¿A dónde vas?</h1>
            <p className="mt-1 text-[13px] font-bold text-white/60">Muévete por la ciudad en minutos</p>

            {/* Ahora o Programar (el de programar abre la hoja estilo Uber) */}
            <div className="mt-5 grid grid-cols-2 gap-1.5 rounded-2xl bg-white/[0.06] p-1.5">
              <button onClick={rideNow} className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-[13.5px] font-black transition ${when === "now" ? "bg-amber-pop text-[#16121b]" : "text-white/70 hover:text-white"}`}>
                <Zap className="h-4 w-4" /> Ahora
              </button>
              <button onClick={openSheet} className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-[13.5px] font-black transition ${when === "schedule" ? "bg-amber-pop text-[#16121b]" : "text-white/70 hover:text-white"}`}>
                <CalendarDays className="h-4 w-4" /> Programar <ChevronDown className="-ml-0.5 h-3.5 w-3.5" />
              </button>
            </div>

            {/* Recogida programada (banner estilo Uber) */}
            {when === "schedule" && schedDate && (
              <button onClick={openSheet} className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-amber-pop/40 bg-amber-pop/10 px-4 py-3 text-left transition hover:bg-amber-pop/15">
                <CalendarClock className="h-5 w-5 shrink-0 text-amber-pop" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-black capitalize">Recogida: {schedLabel(schedDate)}</span>
                  <span className="block text-[11.5px] font-bold text-white/60">Tu conductor se asigna ~15 min antes</span>
                </span>
                <span className="shrink-0 rounded-full bg-amber-pop px-3 py-1.5 text-[11.5px] font-black text-[#16121b]">Cambiar</span>
              </button>
            )}

            <div className="mt-4 space-y-2.5 rounded-[26px] bg-white/[0.06] p-4 backdrop-blur">
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#0ea55b]" />
                <input defaultValue={address} aria-label="Origen" className="w-full bg-transparent text-[14px] font-bold text-white outline-none placeholder:text-white/40" />
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                <MapPin className="h-4.5 w-4.5 shrink-0 text-brand" />
                <input value={destino} onChange={(e) => setDestino(e.target.value)} placeholder="¿A dónde te llevamos?" className="w-full bg-transparent text-[14px] font-bold text-white outline-none placeholder:text-white/40" />
              </div>
            </div>

            {/* 🌸 Modalidad Rayte Mujer (opcional para usuarias) */}
            <div className="mt-4 rounded-[22px] border border-pink-500/30 bg-pink-500/10 p-3.5 backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pink-500/20 text-pink-300">
                    <Flower2 className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-black text-pink-100">Rayte Mujer</p>
                    <p className="truncate text-[11.5px] font-bold text-pink-200/70">
                      {womenOnly ? "Solo conductoras mujeres verificadas" : "Cualquier conductor disponible"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setWomenOnly((v) => !v)}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition ${womenOnly ? "bg-pink-500" : "bg-white/20"}`}
                  aria-label="Alternar Rayte Mujer"
                >
                  <motion.span
                    layout
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md ${womenOnly ? "right-0.5" : "left-0.5"}`}
                  />
                </button>
              </div>
            </div>

            {/* 📸 Foto de referencia (opcional para el conductor) */}
            <div className="mt-3 rounded-[22px] border border-white/10 bg-white/[0.04] p-3.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white/80">
                    <Camera className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-black text-white">Foto de referencia <span className="text-white/50 text-[11px] font-bold">(opcional)</span></p>
                    <p className="text-[11px] font-bold text-white/50 truncate">Fachada, ropa o punto exacto de encuentro</p>
                  </div>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        if (ev.target?.result) setRefPhoto(ev.target.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />

                {!refPhoto ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[11.5px] font-black text-white transition hover:bg-white/25 active:scale-95"
                  >
                    <Camera className="h-3.5 w-3.5" /> Tomar foto
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setRefPhoto(null)}
                    className="flex shrink-0 items-center gap-1 rounded-full bg-rose-500/20 px-2.5 py-1 text-[11px] font-black text-rose-300 hover:bg-rose-500/30"
                  >
                    <X className="h-3.5 w-3.5" /> Quitar
                  </button>
                )}
              </div>

              {refPhoto && (
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] p-2">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                    <Image src={refPhoto} alt="Referencia" fill className="object-cover" sizes="56px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-black text-[#4ade80] flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Foto lista
                    </p>
                    <p className="text-[11px] font-bold text-white/60 truncate">Se compartirá con tu conductor al solicitar</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 space-y-2.5">
              {VEHICLES.map((v) => {
                const active = vehicle.id === v.id;
                const Icon = v.icon;
                return (
                  <button key={v.id} onClick={() => setVehicle(v)} className={`flex w-full items-center gap-4 rounded-[22px] border p-4 text-left transition ${active ? "border-amber-pop bg-amber-pop/10" : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"}`}>
                    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${active ? "bg-amber-pop text-[#16121b]" : "bg-white/10"}`}><Icon className="h-6 w-6" /></span>
                    <span className="flex-1">
                      <span className="block text-[15.5px] font-black">{v.label}</span>
                      <span className="flex items-center gap-1 text-[12px] font-bold text-white/60"><Clock3 className="h-3 w-3" /> ~{v.eta} min · {v.desc}</span>
                    </span>
                    <span className="text-[15px] font-black text-amber-pop">{formatMXN(v.price)}</span>
                  </button>
                );
              })}
            </div>

            {/* 💵 Selector de método de pago antes de solicitar */}
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {payment === "Efectivo" ? (
                  <Banknote className="h-5 w-5 text-[#4ade80] shrink-0" />
                ) : payment.startsWith("Tarjeta") ? (
                  <CreditCard className="h-5 w-5 text-amber-pop shrink-0" />
                ) : (
                  <Landmark className="h-5 w-5 text-sky-400 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-[13px] font-black text-white">{payment}</p>
                  <p className="text-[11px] font-bold text-white/50">
                    {payment === "Efectivo" ? "Pagas al conductor al llegar" : "Cobro automático y seguro"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPaySheetOpen(true)}
                className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-black text-amber-pop transition hover:bg-white/20 active:scale-95"
              >
                Cambiar
              </button>
            </div>

            <motion.button whileTap={{ scale: 0.98 }} onClick={request} disabled={!destino.trim()} className="mt-5 w-full rounded-full bg-amber-pop py-4 text-[15px] font-black text-[#16121b] shadow-[0_12px_28px_rgba(251,191,36,0.35)] transition hover:brightness-105 disabled:opacity-40">
              {when === "schedule" ? (schedDate ? "Programar rayte" : "Elegir hora de recogida") : `Solicitar ${vehicle.label}`}
            </motion.button>

            <CrossSell items={crossItems} dark title={crossTitle} />
          </motion.div>
        )}

        {phase === "searching" && (
          <div className="flex flex-col items-center pt-16">
            <Loader2 className="h-10 w-10 animate-spin text-amber-pop" />
            <p className="mt-4 text-lg font-black">{when === "schedule" ? "Programando tu rayte..." : "Buscando tu conductor..."}</p>
            <p className="mt-1 text-[13px] font-bold text-white/60">{vehicle.label} · {destino}</p>
          </div>
        )}

        {phase === "scheduled" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
            <div className="rounded-[26px] border border-amber-pop/40 bg-amber-pop/10 p-6 text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-pop"><CalendarDays className="h-8 w-8 text-[#16121b]" /></span>
              <p className="mt-4 text-xl font-black">¡Rayte programado!</p>
              <p className="mt-1 text-[14px] font-bold text-white/80 capitalize">{schedLabel(schedDate, true)}</p>
            </div>
            <div className="mt-4 space-y-2.5 rounded-[22px] bg-white/[0.06] p-4 text-[13.5px] font-bold">
              <p className="flex justify-between"><span className="text-white/60">Vehículo</span>{vehicle.label}</p>
              <p className="flex justify-between"><span className="text-white/60">Destino</span><span className="max-w-[200px] truncate">{destino}</span></p>
              <p className="flex justify-between"><span className="text-white/60">Tarifa</span><span className="font-black text-amber-pop">{formatMXN(vehicle.price)}</span></p>
              <p className="flex justify-between"><span className="text-white/60">Conductor</span><span>Se asigna 15 min antes</span></p>
            </div>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] font-bold text-white/50">
              <ShieldCheck className="h-4 w-4 text-amber-pop" /> Cancela sin costo hasta 60 min antes de la recogida
            </p>
            <button onClick={() => { setPhase("form"); setSchedDate(null); setWhen("now"); }} className="mt-4 w-full rounded-full border border-white/15 py-3.5 text-[14px] font-black text-white/80 transition hover:bg-white/10">
              <span className="flex items-center justify-center gap-2"><Check className="h-4.5 w-4.5" /> Listo (demo)</span>
            </button>

            {/* Carrusel de los 4 servicios de la app */}
            <ServiceCarousel />
            <CrossSell items={crossItems} dark title={crossTitle} />
          </motion.div>
        )}

        {phase === "assigned" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            {/* Botón de pánico y seguridad — exclusivo durante el viaje activo */}
            <div className="mb-3 flex items-center justify-between gap-2 px-1">
              <span className="flex items-center gap-1.5 text-[12px] font-black text-[#4ade80]">
                <span className="h-2.5 w-2.5 animate-ping rounded-full bg-[#4ade80]" /> En trayecto
              </span>
              <button
                onClick={() => setSosOpen(true)}
                className="flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/20 px-3 py-1.5 text-[11.5px] font-black text-rose-300 transition hover:bg-rose-500/30 active:scale-95 shadow-sm"
              >
                <ShieldAlert className="h-4 w-4 text-rose-400" /> SOS · Seguridad
              </button>
            </div>

            <div className="overflow-hidden rounded-[26px] bg-white/[0.06]">
              <svg viewBox="0 0 400 240" className="block w-full">
                <rect width="400" height="240" fill="#16121b" />
                {[40, 80, 120, 160, 200].map((y) => <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />)}
                {[50, 100, 150, 200, 250, 300, 350].map((x) => <line key={x} x1={x} y1="0" x2={x} y2="240" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />)}
                <path d={ROUTE} stroke="#fbbf24" strokeWidth="7" fill="none" strokeLinecap="round" />
                <path d={ROUTE} stroke="#16121b" strokeWidth="2.5" fill="none" strokeDasharray="8 18" className="route-dash" strokeLinecap="round" />
                <circle cx="36" cy="196" r="10" fill="#0ea55b" />
                <circle cx="368" cy="88" r="10" style={{ fill: "var(--brand)" }} />
                <circle cx="202" cy="118" r="12" fill="#fbbf24" stroke="#16121b" strokeWidth="2.5" className="courier-ring" />
              </svg>
            </div>

            {/* Ficha del Conductor / Conductora */}
            <div className="mt-4 rounded-[22px] bg-white/[0.06] p-4">
              <div className="flex items-center gap-3">
                <span className={`flex h-12 w-12 items-center justify-center rounded-full text-[16px] font-black ${womenOnly ? "bg-pink-500 text-white" : "bg-amber-pop text-[#16121b]"}`}>
                  {womenOnly ? "CR" : "JM"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="truncate text-[15px] font-black">{assignedDriverName} · {assignedVehicleLine}</p>
                    {womenOnly && (
                      <span className="rounded-full bg-pink-500/20 px-2 py-0.5 text-[10px] font-black text-pink-300">
                        🌸 Rayte Mujer
                      </span>
                    )}
                  </div>
                  <p className="flex items-center gap-1.5 text-[12px] font-bold text-white/60">
                    <Star className="h-3 w-3 fill-amber-pop text-amber-pop" /> 4.9 · Placas {assignedPlate} · llega en ~{Math.max(2, vehicle.eta - 4)} min
                  </p>
                </div>
                <button aria-label="Llamar" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-pop text-[#16121b] transition active:scale-95">
                  <Phone className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Foto de referencia enviada */}
              {refPhoto && (
                <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] p-2">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                    <Image src={refPhoto} alt="Referencia enviada" fill className="object-cover" sizes="40px" />
                  </div>
                  <p className="text-[11.5px] font-bold text-white/70 truncate">
                    Foto de punto de encuentro compartida con {womenOnly ? "la conductora" : "el conductor"}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between rounded-[22px] bg-white/[0.06] p-4">
              <span className="flex items-center gap-2 text-[13.5px] font-bold text-white/80">
                <CircleDollarSign className="h-4.5 w-4.5 text-amber-pop" /> Tarifa ({payment})
              </span>
              <span className="text-[16px] font-black text-amber-pop">{formatMXN(vehicle.price)}</span>
            </div>

            <button onClick={() => { setPhase("form"); setRefPhoto(null); }} className="mt-5 w-full rounded-full border border-white/15 py-3.5 text-[14px] font-black text-white/80 transition hover:bg-white/10">
              <span className="flex items-center justify-center gap-2"><Check className="h-4.5 w-4.5" /> Viaje completado (demo)</span>
            </button>

            {/* Carrusel de los 4 servicios de la app */}
            <ServiceCarousel />
            <CrossSell items={crossItems} dark title={crossTitle} />
          </motion.div>
        )}
      </div>

      {/* ── Hoja de Selección de Método de Pago ── */}
      <AnimatePresence>
        {paySheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPaySheetOpen(false)}
              className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 32 }}
              className="fixed inset-x-0 bottom-0 z-[85] mx-auto max-w-lg rounded-t-[28px] bg-[#1d1824] p-5 pb-8 shadow-[0_-20px_60px_rgba(0,0,0,0.7)]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[18px] font-black text-white">Método de pago</h2>
                  <p className="text-[12px] font-bold text-white/50">¿Cómo prefieres pagar tu viaje?</p>
                </div>
                <button
                  onClick={() => setPaySheetOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 space-y-2.5">
                {[
                  { id: "Efectivo", icon: Banknote, label: "Efectivo", desc: "Pagas en mano al conductor al llegar", color: "#4ade80" },
                  { id: "Tarjeta •••• 4821", icon: CreditCard, label: "Tarjeta de débito/crédito", desc: "Visa terminada en 4821 · Cobro directo", color: "#fbbf24" },
                  { id: "Transferencia SPEI", icon: Landmark, label: "Transferencia / SPEI", desc: "Transfiere al terminar el recorrido", color: "#38bdf8" },
                ].map((m) => {
                  const active = payment === m.id;
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        setPayment(m.id as typeof payment);
                        setPaySheetOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-[20px] border p-3.5 text-left transition ${
                        active
                          ? "border-amber-pop bg-amber-pop/10 text-white"
                          : "border-white/10 bg-white/[0.03] text-white/80 hover:bg-white/[0.07]"
                      }`}
                    >
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${m.color}22`, color: m.color }}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-black">{m.label}</p>
                        <p className="text-[11.5px] font-bold text-white/50">{m.desc}</p>
                      </div>
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                          active ? "border-amber-pop bg-amber-pop" : "border-white/20"
                        }`}
                      >
                        {active && <Check className="h-3 w-3 text-[#16121b]" strokeWidth={3.5} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Hoja de Seguridad y Botón de Pánico (SOS) ── */}
      <AnimatePresence>
        {sosOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSosOpen(false)}
              className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-[3px]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 32 }}
              className="fixed inset-x-0 bottom-0 z-[85] mx-auto max-w-lg rounded-t-[28px] border-t-2 border-rose-500 bg-[#1d1824] p-5 pb-8 shadow-[0_-20px_60px_rgba(0,0,0,0.85)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400">
                    <Siren className="h-6 w-6" />
                  </span>
                  <div>
                    <h2 className="text-[18px] font-black text-white">Centro de Seguridad SOS</h2>
                    <p className="text-[11.5px] font-bold text-white/60">Asistencia inmediata para tu viaje</p>
                  </div>
                </div>
                <button
                  onClick={() => setSosOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Ficha rápida de seguridad del viaje */}
              <div className="mt-4 space-y-1.5 rounded-2xl border border-white/10 bg-white/[0.05] p-3.5 text-[12.5px] font-bold text-white/80">
                <p className="text-[10.5px] font-black tracking-wider text-white/50 uppercase">Datos del viaje activo</p>
                <p className="flex justify-between">
                  <span>Conductor:</span> <span className="font-black text-white">{assignedDriverName} · 4.9 ★</span>
                </p>
                <p className="flex justify-between">
                  <span>Vehículo:</span> <span className="font-black text-amber-pop">{assignedVehicleLine} · Placas {assignedPlate}</span>
                </p>
                <p className="flex justify-between">
                  <span>Destino:</span> <span className="max-w-[200px] truncate font-black text-white">{destino}</span>
                </p>
              </div>

              {/* Botones de acción rápida */}
              <div className="mt-4 space-y-2.5">
                <a
                  href="tel:911"
                  className="flex w-full items-center justify-center gap-2.5 rounded-full bg-rose-600 py-3.5 text-[15px] font-black text-white shadow-[0_10px_25px_rgba(225,29,72,0.4)] transition hover:bg-rose-700 active:scale-95"
                >
                  <AlertOctagon className="h-5 w-5" /> Llamar al 911 (Emergencias)
                </a>

                <button
                  onClick={() => {
                    if (typeof navigator !== "undefined" && navigator.clipboard) {
                      navigator.clipboard.writeText(
                        `Estoy viajando en Rayte con ${assignedDriverName} (${assignedVehicleLine}, Placas ${assignedPlate}) rumbo a ${destino}. Mi viaje está activo.`,
                      );
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2500);
                    }
                  }}
                  className="flex w-full items-center justify-center gap-2.5 rounded-full border border-white/15 bg-white/[0.07] py-3 text-[13.5px] font-black text-white transition hover:bg-white/15 active:scale-95"
                >
                  {copiedLink ? <CheckCheck className="h-4.5 w-4.5 text-[#4ade80]" /> : <Share2 className="h-4.5 w-4.5 text-amber-pop" />}
                  {copiedLink ? "¡Datos del viaje copiados para compartir!" : "Compartir datos del viaje"}
                </button>

                <a
                  href="tel:8000007298"
                  className="flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-[12px] font-black text-white/70 hover:text-white"
                >
                  <ShieldCheck className="h-4 w-4 text-[#0ea55b]" /> Soporte Rayte Seguridad 24/7 (800-000-RAYTE)
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Hoja inferior estilo Uber: "Elige tu hora de recogida" ── */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeSheet}
              className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 340 }}
              className="fixed inset-x-0 bottom-0 z-[85] mx-auto max-w-lg rounded-t-[28px] bg-[#1d1824] px-5 pb-6 shadow-[0_-20px_60px_rgba(0,0,0,0.6)]"
            >
              <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-white/15" />
              <div className="mt-4 flex items-start justify-between">
                <div>
                  <h2 className="text-[20px] font-black tracking-tight">¿Cuándo te recogemos?</h2>
                  <p className="mt-0.5 text-[12.5px] font-bold text-white/50">Elige la fecha y la hora de tu recogida</p>
                </div>
                <button onClick={closeSheet} aria-label="Cerrar" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20">
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Ruedas: fecha + hora */}
              <div className="mt-4 flex gap-2 rounded-[22px] border border-white/10 bg-white/[0.03] px-2">
                <Wheel grow items={dates.map((d) => d.label)} index={dayIdx} onChange={setDayIdx} />
                <div className="my-4 w-px bg-white/10" />
                <Wheel items={times.map((t) => t.label)} index={Math.min(timeIdx, times.length - 1)} onChange={setTimeIdx} />
              </div>

              {/* Viñetas informativas estilo Uber */}
              <div className="mt-4 space-y-2.5 text-[12.5px] font-bold text-white/70">
                <p className="flex items-center gap-2.5"><CalendarDays className="h-4 w-4 shrink-0 text-amber-pop" /> Elige tu hora de recogida con hasta 30 días de anticipación</p>
                <p className="flex items-center gap-2.5"><Clock3 className="h-4 w-4 shrink-0 text-amber-pop" /> Tiempo de espera adicional incluido para tu recogida</p>
                <p className="flex items-center gap-2.5"><ShieldCheck className="h-4 w-4 shrink-0 text-amber-pop" /> Cancela sin costo hasta 60 minutos antes</p>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={setPickup}
                className="mt-5 w-full rounded-full bg-amber-pop py-4 text-[15px] font-black text-[#16121b] shadow-[0_12px_28px_rgba(251,191,36,0.35)] transition hover:brightness-105"
              >
                Establecer hora de recogida
              </motion.button>
              <button onClick={rideNow} className="mt-2.5 w-full rounded-full py-3 text-[14px] font-black text-white/70 transition hover:bg-white/5 hover:text-white">
                Recogerme ahora
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
