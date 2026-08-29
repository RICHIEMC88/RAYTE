"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CalendarDays, Check, Clock3, Zap } from "lucide-react";

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

export default function SchedulePicker({
  open,
  initialIso,
  onClose,
  onSave,
}: {
  open: boolean;
  initialIso: string | null;
  onClose: () => void;
  onSave: (iso: string | null) => void;
}) {
  const [days, setDays] = useState<{ date: Date; label: string; num: number }[] | null>(null);
  const [dayIdx, setDayIdx] = useState(0);
  const [slot, setSlot] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setDays(buildDays());
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setError("");
      if (initialIso) {
        const d = new Date(initialIso);
        if (!Number.isNaN(d.getTime()) && d.getTime() > Date.now()) {
          const list = buildDays();
          const idx = list.findIndex((x) => x.date.toDateString() === d.toDateString());
          if (idx !== -1) {
            setDayIdx(idx);
            setSlot(`${String(d.getHours()).padStart(2, "0")}:${d.getMinutes() >= 30 ? "30" : "00"}`);
            return;
          }
        }
      }
      setDayIdx(0);
      setSlot(null);
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open, initialIso]);

  const save = () => {
    if (!slot || !days) return setError("Elige día y hora.");
    const d = new Date(days[dayIdx].date);
    const [h, m] = slot.split(":").map(Number);
    d.setHours(h, m, 0, 0);
    if (d.getTime() <= Date.now()) return setError("Esa hora ya pasó, elige otra.");
    onSave(d.toISOString());
    onClose();
  };

  const label = () => {
    if (!slot || !days) return "";
    const d = new Date(days[dayIdx].date);
    const [h, m] = slot.split(":").map(Number);
    d.setHours(h, m, 0, 0);
    return new Intl.DateTimeFormat("es-MX", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(d);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            className="fixed inset-x-0 bottom-0 z-[85] mx-auto flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_-20px_60px_rgba(0,0,0,0.35)] sm:inset-y-6 sm:rounded-[28px] sm:border sm:border-black/5"
          >
            <div className="flex shrink-0 items-start justify-between px-5 pt-5 pb-3">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-black tracking-tight">
                  <CalendarDays className="h-5.5 w-5.5 text-brand" /> ¿Cuándo lo quieres?
                </h2>
                <p className="mt-0.5 text-[12.5px] font-bold text-ink-soft">Programa tu pedido y relájate</p>
              </div>
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-mist transition hover:bg-black/10 active:scale-90"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4">
              <p className="text-[12px] font-black text-ink-soft uppercase">Día</p>
              <div className="no-scrollbar -mx-1 mt-2 flex gap-2 overflow-x-auto px-1">
                {(days ?? Array.from({ length: 7 })).map((d, i) =>
                  d && "num" in d ? (
                    <button
                      key={i}
                      onClick={() => setDayIdx(i)}
                      className={`flex w-[72px] shrink-0 flex-col items-center rounded-2xl border py-2.5 transition active:scale-95 ${
                        dayIdx === i ? "border-brand bg-brand-soft" : "border-black/10"
                      }`}
                    >
                      <span className="text-[11px] font-black text-ink-soft capitalize">{d.label}</span>
                      <span className={`text-lg font-black ${dayIdx === i ? "text-brand" : ""}`}>{d.num}</span>
                    </button>
                  ) : (
                    <div key={i} className="h-[60px] w-[72px] shrink-0 animate-pulse rounded-2xl bg-mist" />
                  ),
                )}
              </div>

              <p className="mt-5 text-[12px] font-black text-ink-soft uppercase">Hora de entrega</p>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {SLOTS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSlot(s)}
                    className={`rounded-xl border py-2 text-[12.5px] font-black transition active:scale-95 ${
                      slot === s ? "border-brand bg-brand text-white shadow-sm" : "border-black/10 hover:border-brand/40"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {error && <p className="mt-3 rounded-xl bg-brand-soft px-4 py-2.5 text-[13px] font-black text-brand">{error}</p>}
              {slot && (
                <p className="mt-3 flex items-center gap-1.5 text-[13px] font-black text-brand">
                  <Clock3 className="h-4 w-4" /> Entrega: {label()}
                </p>
              )}
            </div>

            <div className="shrink-0 border-t border-black/5 bg-white px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="flex gap-3">
                {initialIso && (
                  <button
                    onClick={() => {
                      onSave(null);
                      onClose();
                    }}
                    className="rounded-full bg-mist px-4 py-3.5 text-[13px] font-black text-ink transition hover:bg-black/[0.08]"
                  >
                    Lo antes posible
                  </button>
                )}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={save}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand px-5 py-3.5 text-[14.5px] font-black text-white shadow-[0_12px_28px_var(--brand-glow)] transition hover:bg-brand-dark"
                >
                  <Zap className="h-4.5 w-4.5 fill-white" /> {initialIso ? "Actualizar programación" : "Programar pedido"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
