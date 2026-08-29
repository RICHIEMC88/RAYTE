"use client";

import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";

export function QtyStepper({ qty, onInc, onDec, small = false }: { qty: number; onInc: () => void; onDec: () => void; small?: boolean }) {
  const size = small ? "h-8 w-8" : "h-10 w-10";
  return (
    <div className="flex items-center gap-1 rounded-full border border-black/10 bg-white p-0.5 shadow-sm">
      <motion.button whileTap={{ scale: 0.85 }} onClick={(e) => { e.stopPropagation(); onDec(); }} className={`${size} flex items-center justify-center rounded-full text-ink transition hover:bg-mist`} aria-label="Quitar uno">
        <Minus className={small ? "h-3.5 w-3.5" : "h-4 w-4"} strokeWidth={2.6} />
      </motion.button>
      <span className={`${small ? "w-5 text-[13px]" : "w-7 text-[15px]"} text-center font-black tabular-nums`}>{qty}</span>
      <motion.button whileTap={{ scale: 0.85 }} onClick={(e) => { e.stopPropagation(); onInc(); }} className={`${size} flex items-center justify-center rounded-full bg-brand text-white transition hover:bg-brand-dark`} aria-label="Añadir uno">
        <Plus className={small ? "h-3.5 w-3.5" : "h-4 w-4"} strokeWidth={2.6} />
      </motion.button>
    </div>
  );
}

export function AddButton({ onClick, label }: { onClick: () => void; label?: string }) {
  return (
    <motion.button whileTap={{ scale: 0.85 }} onClick={(e) => { e.stopPropagation(); onClick(); }} className="flex h-9 min-w-9 items-center justify-center gap-1 rounded-full bg-brand px-2.5 font-black text-white shadow-[0_6px_16px_var(--brand-glow)] transition hover:bg-brand-dark" aria-label="Añadir al carrito">
      <Plus className="h-4.5 w-4.5" strokeWidth={3} />
      {label && <span className="text-[13px]">{label}</span>}
    </motion.button>
  );
}
