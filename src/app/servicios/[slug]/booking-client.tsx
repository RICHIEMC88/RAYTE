"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, Home, Loader2, Store, Zap } from "lucide-react";
import type { Service, ServiceOption } from "@/db/schema";
import { useCart } from "@/store/cart";
import { formatMXN } from "@/lib/utils";

const SLOTS = ["08:00", "09:00", "10:30", "12:00", "14:00", "15:30", "17:00", "18:30"];
const MONTHS_AHEAD = 12; // calendario de todo el año

type AppointmentResult = {
  id: string;
  code: string;
  serviceName: string;
  optionName: string | null;
  startAt: string;
  endAt: string;
  price: number;
  proName: string;
  mode: string;
};

type Busy = { start: number; end: number };

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

export default function BookingClient({
  service,
  options = [],
  accent = "#7c3aed",
  soft = "#f3e8ff",
  glow = "rgba(124,58,237,0.35)",
}: {
  service: Service;
  options?: ServiceOption[];
  accent?: string;
  soft?: string;
  glow?: string;
}) {
  const customerName = useCart((s) => s.customerName);
  const phone = useCart((s) => s.phone);
  const address = useCart((s) => s.address);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  /* Servicio elegido del menú del negocio */
  const [optionId, setOptionId] = useState<number | null>(() => (options.find((o) => o.popular) ?? options[0])?.id ?? null);
  const selected = options.find((o) => o.id === optionId) ?? null;
  const price = selected?.price ?? service.price;
  const durationMin = selected?.durationMin ?? service.durationMin;

  /* ── Horarios ocupados REALES (se bloquean en el calendario) ── */
  const [busy, setBusy] = useState<Busy[]>([]);
  const loadBusy = useCallback(async () => {
    try {
      const res = await fetch(`/api/appointments?busy=${service.slug}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setBusy((data.busy as { startAt: string; endAt: string }[]).map((b) => ({ start: +new Date(b.startAt), end: +new Date(b.endAt) })));
      }
    } catch { /* sin bloqueo si falla; el servidor valida de todos modos */ }
  }, [service.slug]);

  useEffect(() => {
    if (mounted) loadBusy();
  }, [mounted, loadBusy]);

  /* ── Calendario ── */
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const minMonth = useMemo(() => new Date(today.getFullYear(), today.getMonth(), 1), [today]);
  const maxMonth = useMemo(() => new Date(today.getFullYear(), today.getMonth() + MONTHS_AHEAD - 1, 1), [today]);

  const [viewMonth, setViewMonth] = useState<Date>(minMonth);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [mode, setMode] = useState<"domicilio" | "local">(service.domicilio ? "domicilio" : "local");
  const [slot, setSlot] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [tel, setTel] = useState("");
  const [addr, setAddr] = useState("");
  const [notes, setNotes] = useState("");
  /* Solicitud detallada (solo servicios de salud) */
  const isSalud = service.category === "salud";
  const [edad, setEdad] = useState("");
  const [sintomas, setSintomas] = useState("");
  const [alergias, setAlergias] = useState("");
  const [medicamentos, setMedicamentos] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<AppointmentResult | null>(null);

  useEffect(() => {
    if (mounted) {
      setName(customerName);
      setTel(phone);
      setAddr(address);
    }
  }, [mounted, customerName, phone, address]);

  /* ¿Está bloqueado un horario? (pasado u ocupado por otra reserva) */
  const slotBlocked = useCallback(
    (day: Date, s: string): boolean => {
      const [h, m] = s.split(":").map(Number);
      const start = new Date(day);
      start.setHours(h, m, 0, 0);
      const end = start.getTime() + durationMin * 60000;
      if (start.getTime() <= Date.now()) return true;
      return busy.some((b) => b.start < end && b.end > start.getTime());
    },
    [busy, durationMin],
  );

  const dayFull = useCallback((day: Date): boolean => SLOTS.every((s) => slotBlocked(day, s)), [slotBlocked]);

  /* Celdas del mes visible (semana inicia en lunes) */
  const cells = useMemo(() => {
    const y = viewMonth.getFullYear();
    const m = viewMonth.getMonth();
    const first = new Date(y, m, 1);
    const offset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const out: (Date | null)[] = Array.from({ length: offset }, () => null);
    for (let d = 1; d <= daysInMonth; d++) out.push(new Date(y, m, d));
    return out;
  }, [viewMonth]);

  const canPrev = viewMonth.getTime() > minMonth.getTime();
  const canNext = viewMonth.getTime() < maxMonth.getTime();
  const monthLabel = new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric" }).format(viewMonth);

  const startAtIso = useMemo(() => {
    if (!slot) return null;
    const d = new Date(selectedDate);
    const [h, m] = slot.split(":").map(Number);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  }, [selectedDate, slot]);

  if (!mounted) return null;

  const submit = async () => {
    setError("");
    if (!slot) return setError("Elige una hora disponible para tu cita.");
    if (!name.trim()) return setError("Escribe tu nombre.");
    if (!tel.trim()) return setError("Escribe tu teléfono.");
    if (mode === "domicilio" && !addr.trim()) return setError("Escribe la dirección del servicio.");
    if (isSalud && !sintomas.trim()) return setError("Describe tus síntomas o el motivo de la consulta para que el médico llegue preparado.");
    setSubmitting(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          optionId,
          customerName: name.trim(),
          phone: tel.trim(),
          mode,
          address: mode === "domicilio" ? addr.trim() : null,
          startAt: startAtIso,
          notes: notes.trim() || null,
          intake: isSalud ? { edad, sintomas, alergias, medicamentos } : null,
        }),
      });
      if (res.status === 409) {
        const data = await res.json();
        setError(data.error ?? "Ese horario ya está ocupado.");
        setSlot(null);
        loadBusy(); /* refresca los bloqueos */
        return;
      }
      if (!res.ok) throw new Error("Respuesta inválida del servidor");
      setDone(await res.json());
    } catch {
      setError("No pudimos agendar la cita. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-[26px] border-2 p-6 text-center" style={{ borderColor: `${accent}4d`, backgroundColor: `${soft}66` }}>
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: accent }}>
          <Check className="h-8 w-8 text-white" strokeWidth={3} />
        </span>
        <p className="mt-4 text-xl font-black">¡Cita agendada!</p>
        <p className="mt-1 text-sm font-bold text-ink-soft">{done.optionName ?? done.serviceName} con {done.proName}</p>
        <div className="mx-auto mt-4 w-fit rounded-2xl bg-white px-5 py-3 shadow-sm">
          <p className="text-[11px] font-black tracking-widest text-ink-soft uppercase">Tu código</p>
          <p className="text-2xl font-black" style={{ color: accent }}>{done.code}</p>
        </div>
        <p className="mt-4 text-[13.5px] font-bold text-ink">
          {new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" }).format(new Date(done.startAt))} · {formatMXN(done.price)}
        </p>
        <p className="mt-2 text-[12.5px] font-semibold text-ink-soft">
          {done.mode === "domicilio" ? "Un profesional llegará a tu dirección" : "Te esperamos en el local del proveedor"}
        </p>
      </motion.div>
    );
  }

  const selectedIsPast = (d: Date) => d.getTime() < today.getTime();

  return (
    <div className="mt-6 rounded-[26px] border p-5" style={{ borderColor: `${accent}33` }}>
      <p className="flex items-center gap-2 text-lg font-black"><CalendarDays className="h-5 w-5" style={{ color: accent }} /> Agenda tu cita</p>

      {/* ── Menú de servicios del negocio ── */}
      {options.length > 0 && (
        <>
          <p className="mt-4 text-[13px] font-black text-ink-soft uppercase">Elige tu servicio</p>
          <div className="mt-2 space-y-2">
            {options.map((o) => {
              const active = o.id === optionId;
              return (
                <button
                  key={o.id}
                  onClick={() => { setOptionId(o.id); setSlot(null); }}
                  className="flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition active:scale-[0.99]"
                  style={active ? { borderColor: accent, backgroundColor: `${soft}66`, boxShadow: `0 4px 14px ${glow.replace("0.35", "0.15")}` } : { borderColor: "rgba(0,0,0,0.1)" }}
                >
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition"
                    style={active ? { borderColor: accent, backgroundColor: accent } : { borderColor: "rgba(0,0,0,0.2)" }}
                  >
                    {active && <Check className="h-3 w-3 text-white" strokeWidth={3.5} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 text-[14px] leading-tight font-black">
                      {o.name}
                      {o.popular && <span className="rounded-full px-2 py-0.5 text-[9.5px] font-black text-white" style={{ backgroundColor: accent }}>Popular</span>}
                    </span>
                    {o.description && <span className="mt-0.5 block text-[12px] leading-snug font-semibold text-ink-soft">{o.description}</span>}
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-[14.5px] font-black" style={active ? { color: accent } : undefined}>{formatMXN(o.price)}</span>
                    <span className="flex items-center justify-end gap-1 text-[11px] font-bold text-ink-soft"><Clock3 className="h-3 w-3" /> {o.durationMin} min</span>
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

      <p className="mt-4 text-[13px] font-black text-ink-soft uppercase">Modalidad</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {service.domicilio && (
          <ModeBtn active={mode === "domicilio"} onClick={() => setMode("domicilio")} icon={<Home className="h-4 w-4" />} label="A domicilio" accent={accent} soft={soft} />
        )}
        {service.local && (
          <ModeBtn active={mode === "local"} onClick={() => setMode("local")} icon={<Store className="h-4 w-4" />} label="En local" accent={accent} soft={soft} />
        )}
      </div>

      {/* ── Calendario de todo el año ── */}
      <div className="mt-5 flex items-center justify-between">
        <p className="text-[13px] font-black text-ink-soft uppercase">Elige el día</p>
        <div className="flex items-center gap-1">
          <button onClick={() => canPrev && setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))} disabled={!canPrev} aria-label="Mes anterior" className="flex h-8 w-8 items-center justify-center rounded-full bg-mist transition disabled:opacity-30">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="w-[130px] text-center text-[13px] font-black capitalize">{monthLabel}</span>
          <button onClick={() => canNext && setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))} disabled={!canNext} aria-label="Mes siguiente" className="flex h-8 w-8 items-center justify-center rounded-full bg-mist transition disabled:opacity-30">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-y-1 text-center">
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
          <span key={i} className="py-1 text-[11px] font-black text-ink-soft/70">{d}</span>
        ))}
        {cells.map((d, i) => {
          if (!d) return <span key={`b-${i}`} />;
          const past = selectedIsPast(d);
          const full = !past && dayFull(d);
          const selected = dayKey(d) === dayKey(selectedDate);
          const isToday = dayKey(d) === dayKey(today);
          return (
            <button
              key={dayKey(d)}
              disabled={past || full}
              onClick={() => { setSelectedDate(d); setSlot(null); }}
              className={`relative mx-auto flex h-9 w-9 items-center justify-center rounded-full text-[13px] transition active:scale-90 ${past ? "font-bold text-black/25" : full ? "font-bold text-black/30 line-through" : selected ? "font-black text-white" : "font-extrabold text-ink hover:bg-mist"}`}
              style={selected ? { backgroundColor: accent, boxShadow: `0 6px 14px ${glow}` } : isToday && !selected ? { boxShadow: `inset 0 0 0 2px ${accent}66` } : undefined}
              aria-label={`Día ${d.getDate()}${full ? " (lleno)" : ""}`}
            >
              {d.getDate()}
              {full && <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-brand" />}
            </button>
          );
        })}
      </div>
      <p className="mt-1.5 flex items-center gap-3 text-[10.5px] font-bold text-ink-soft">
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: accent }} /> Seleccionado</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-brand" /> Día lleno</span>
      </p>

      {/* ── Horas (las ocupadas se bloquean) ── */}
      <p className="mt-5 text-[13px] font-black text-ink-soft uppercase">
        Hora · <span className="capitalize">{new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long" }).format(selectedDate)}</span>
      </p>
      <div className="mt-2 grid grid-cols-4 gap-2">
        {SLOTS.map((s) => {
          const blocked = slotBlocked(selectedDate, s);
          const active = slot === s;
          return (
            <button
              key={s}
              disabled={blocked}
              onClick={() => setSlot(s)}
              className={`rounded-xl border py-2 text-[13px] transition active:scale-95 ${blocked ? "border-black/5 bg-mist/70 font-bold text-black/30 line-through" : "font-black"}`}
              style={active ? { borderColor: accent, backgroundColor: accent, color: "#fff" } : blocked ? undefined : { borderColor: "rgba(0,0,0,0.1)" }}
            >
              {s}
            </button>
          );
        })}
      </div>
      {SLOTS.every((s) => slotBlocked(selectedDate, s)) && (
        <p className="mt-2 rounded-xl px-3.5 py-2.5 text-[12.5px] font-black" style={{ backgroundColor: soft, color: accent }}>
          Este día ya está lleno — elige otra fecha en el calendario.
        </p>
      )}

      <div className="mt-5 space-y-2.5">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none" style={{ caretColor: accent }} onFocus={(e) => (e.currentTarget.style.borderColor = accent)} onBlur={(e) => (e.currentTarget.style.borderColor = "")} />
        <input value={tel} onChange={(e) => setTel(e.target.value)} placeholder="Teléfono de contacto" inputMode="tel" className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none" style={{ caretColor: accent }} onFocus={(e) => (e.currentTarget.style.borderColor = accent)} onBlur={(e) => (e.currentTarget.style.borderColor = "")} />
        {mode === "domicilio" && (
          <input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="Dirección donde se realiza el servicio" className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none" style={{ caretColor: accent }} onFocus={(e) => (e.currentTarget.style.borderColor = accent)} onBlur={(e) => (e.currentTarget.style.borderColor = "")} />
        )}

        {/* Solicitud detallada para el médico (solo salud) */}
        {isSalud && (
          <div className="rounded-2xl border-2 p-3.5" style={{ borderColor: `${accent}40`, backgroundColor: `${soft}55` }}>
            <p className="text-[13px] font-black" style={{ color: accent }}>🩺 Información para el médico</p>
            <p className="mt-0.5 text-[11.5px] font-bold text-ink-soft">El profesional la revisa antes de tu consulta. Es confidencial.</p>
            <div className="mt-2.5 space-y-2">
              <textarea value={sintomas} onChange={(e) => setSintomas(e.target.value)} rows={2} placeholder="Síntomas o motivo de la consulta *" className="w-full resize-none rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-[13.5px] font-bold outline-none" style={{ caretColor: accent }} onFocus={(e) => (e.currentTarget.style.borderColor = accent)} onBlur={(e) => (e.currentTarget.style.borderColor = "")} />
              <div className="grid grid-cols-2 gap-2">
                <input value={edad} onChange={(e) => setEdad(e.target.value)} placeholder="Edad del paciente" className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-[13.5px] font-bold outline-none" style={{ caretColor: accent }} onFocus={(e) => (e.currentTarget.style.borderColor = accent)} onBlur={(e) => (e.currentTarget.style.borderColor = "")} />
                <input value={alergias} onChange={(e) => setAlergias(e.target.value)} placeholder="Alergias" className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-[13.5px] font-bold outline-none" style={{ caretColor: accent }} onFocus={(e) => (e.currentTarget.style.borderColor = accent)} onBlur={(e) => (e.currentTarget.style.borderColor = "")} />
              </div>
              <input value={medicamentos} onChange={(e) => setMedicamentos(e.target.value)} placeholder="Medicamentos que tomas actualmente" className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-[13.5px] font-bold outline-none" style={{ caretColor: accent }} onFocus={(e) => (e.currentTarget.style.borderColor = accent)} onBlur={(e) => (e.currentTarget.style.borderColor = "")} />
            </div>
          </div>
        )}
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas para el profesional (opcional)" rows={2} className="w-full resize-none rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-semibold outline-none" style={{ caretColor: accent }} onFocus={(e) => (e.currentTarget.style.borderColor = accent)} onBlur={(e) => (e.currentTarget.style.borderColor = "")} />
      </div>

      {error && <p className="mt-3 rounded-xl bg-brand-soft px-4 py-2.5 text-[13px] font-black text-brand">{error}</p>}

      <motion.button
        whileTap={{ scale: 0.98 }}
        disabled={submitting}
        onClick={submit}
        className="mt-5 flex w-full items-center justify-between rounded-full px-5 py-4 font-black text-white transition hover:brightness-110 disabled:opacity-60"
        style={{ backgroundColor: accent, boxShadow: `0 12px 28px ${glow}` }}
      >
        <span className="flex items-center gap-2 text-[15px]">
          {submitting ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Zap className="h-4.5 w-4.5 fill-white" />}
          {submitting ? "Agendando..." : "Confirmar cita"}
        </span>
        <span className="flex items-center gap-2">{formatMXN(price)} <Clock3 className="h-4 w-4" /> {durationMin} min</span>
      </motion.button>
    </div>
  );
}

function ModeBtn({ active, onClick, icon, label, accent, soft }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; accent: string; soft: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 rounded-2xl border py-3 text-[14px] font-black transition active:scale-[0.97]"
      style={active ? { borderColor: accent, backgroundColor: `${soft}80`, color: accent } : { borderColor: "rgba(0,0,0,0.1)", color: "var(--ink, #111)" }}
    >
      {icon} {label}
    </button>
  );
}
