"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, Dices, RefreshCw, Clock3, Store } from "lucide-react";
import { useCart, type CartRestaurant } from "@/store/cart";
import { formatMXN } from "@/lib/utils";
import type { Restaurant } from "@/db/schema";
import { AddButton } from "./stepper";

export type SurpriseDish = {
  id: number; name: string; description: string; price: number;
  image: string | null; section: string; restaurantId: number;
};

/* Un platillo al azar de cada restaurante (5 restaurantes distintos) */
type Roll = { restaurant: Restaurant; dish: SurpriseDish }[];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function SurpriseModal({
  open,
  dishes,
  restaurants,
  onClose,
}: {
  open: boolean;
  dishes: SurpriseDish[];
  restaurants: Restaurant[];
  onClose: () => void;
}) {
  const addItem = useCart((s) => s.addItem);

  const pick = useCallback((): Roll | null => {
    const openRests = restaurants.filter((r) => r.isOpen && r.categorySlug === "restaurantes");
    const byRestaurant = new Map<number, SurpriseDish[]>();
    for (const d of dishes) {
      const arr = byRestaurant.get(d.restaurantId) ?? [];
      arr.push(d);
      byRestaurant.set(d.restaurantId, arr);
    }
    const candidates = shuffle(openRests.filter((r) => (byRestaurant.get(r.id)?.length ?? 0) > 0));
    if (candidates.length === 0) return null;

    /* 1ª vuelta: un platillo por restaurante. Si faltan para llegar a 5
       (p. ej. hay tiendas cerradas), se rellena con otro platillo distinto. */
    const roll: Roll = [];
    const usedDish = new Set<number>();
    let pass = 0;
    while (roll.length < 5 && pass < 6) {
      for (const restaurant of candidates) {
        if (roll.length >= 5) break;
        const opts = byRestaurant.get(restaurant.id)!.filter((d) => !usedDish.has(d.id));
        if (!opts.length) continue;
        const dish = opts[Math.floor(Math.random() * opts.length)];
        usedDish.add(dish.id);
        roll.push({ restaurant, dish });
      }
      pass++;
    }
    return roll;
  }, [dishes, restaurants]);

  const [roll, setRoll] = useState<Roll | null>(() => pick());
  const [rollKey, setRollKey] = useState(0);

  useEffect(() => {
    if (open) {
      setRoll(pick());
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open, pick]);

  const addDish = (restaurant: Restaurant, d: SurpriseDish) => {
    const cartRestaurant: CartRestaurant = {
      id: restaurant.id, name: restaurant.name, slug: restaurant.slug,
      deliveryFee: restaurant.deliveryFee, timeMin: restaurant.timeMin, timeMax: restaurant.timeMax,
    };
    addItem({ key: `${d.id}`, productId: d.id, name: d.name, price: d.price, basePrice: d.price, image: d.image, qty: 1 }, cartRestaurant);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-[2px]" />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed inset-x-0 bottom-0 z-[85] mx-auto flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_-20px_60px_rgba(0,0,0,0.35)] sm:inset-y-6 sm:rounded-[28px] sm:border sm:border-black/5"
          >
            <div className="relative shrink-0 bg-gradient-to-br from-brand via-brand-hard to-[var(--brand-accent)] px-5 py-4 text-white">
              <button onClick={onClose} aria-label="Cerrar" className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 transition active:scale-90">
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3">
                <motion.span
                  key={`dice-${rollKey}`}
                  initial={{ rotate: -25, scale: 0.6 }} animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 12 }}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20"
                >
                  <Dices className="h-6 w-6" />
                </motion.span>
                <div>
                  <h2 className="text-[21px] leading-tight font-black tracking-tight">¡Sorpresa Rayte!</h2>
                  <p className="text-[12.5px] font-bold text-white/85">Un platillo al azar de 5 restaurantes distintos</p>
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
              {roll && roll.length > 0 ? (
                roll.map(({ restaurant, dish }, i) => (
                  <motion.div
                    key={`${rollKey}-${dish.id}`}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 * i, type: "spring", stiffness: 300, damping: 24 }}
                    className="mb-3 rounded-2xl border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                        {dish.image && <Image src={dish.image} alt={dish.name} fill className="object-cover" sizes="64px" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14.5px] leading-tight font-extrabold">{dish.name}</p>
                        <p className="mt-0.5 line-clamp-1 text-[12px] font-semibold text-ink-soft">{dish.description}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="text-sm font-black text-brand">{formatMXN(dish.price)}</span>
                          <span className="flex min-w-0 items-center gap-1 rounded-full bg-mist px-2 py-0.5 text-[10.5px] font-black text-ink-soft">
                            <Store className="h-3 w-3 shrink-0 text-brand" /> <span className="truncate">{restaurant.name}</span>
                          </span>
                          <span className="flex items-center gap-0.5 text-[10.5px] font-bold text-ink-soft"><Clock3 className="h-3 w-3" /> {restaurant.timeMin}-{restaurant.timeMax} min</span>
                        </div>
                      </div>
                      <AddButton onClick={() => addDish(restaurant, dish)} />
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="py-10 text-center text-sm font-bold text-ink-soft">No hay suficientes platillos para sorprenderte ahora mismo.</p>
              )}
            </div>

            <div className="shrink-0 border-t border-black/5 bg-white px-5 py-3.5 pb-[max(14px,env(safe-area-inset-bottom))]">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { setRoll(pick()); setRollKey((k) => k + 1); }}
                disabled={!roll}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3.5 text-[14.5px] font-black text-white shadow-[0_12px_28px_var(--brand-glow)] transition hover:bg-brand-dark active:scale-[0.98] disabled:opacity-50"
              >
                <RefreshCw className="h-4.5 w-4.5" /> Otra ronda sorpresa
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
