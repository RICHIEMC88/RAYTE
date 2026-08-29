"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { formatMXN } from "@/lib/utils";

export type CrossSellItem = {
  key: string;
  name: string;
  price: number;
  image: string | null;
  categoryName: string;
  href: string;
};

/**
 * Cross-selling: carrusel rectangular con un ítem de cada rubro.
 * En modo oscuro (dark) para la sección de Rayte.
 */
export default function CrossSell({
  items,
  title = "Un antojo de cada rubro",
  dark = false,
}: {
  items: CrossSellItem[];
  title?: string;
  dark?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <section className="mt-6 w-full min-w-0">
      <div className="flex items-end justify-between">
        <div>
          <h2 className={`text-[16px] font-black tracking-tight ${dark ? "text-white" : ""}`}>{title}</h2>
          <p className={`text-[11.5px] font-bold ${dark ? "text-white/50" : "text-ink-soft"}`}>Llega en minutos, agrega y listo</p>
        </div>
      </div>

      <div className="no-scrollbar -mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-2">
        {items.map((it, i) => (
          <motion.div key={it.key} initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(i * 0.05, 0.3) }} className="w-[148px] shrink-0">
            <Link href={it.href} className="group block">
              <div className="relative h-[92px] overflow-hidden rounded-[18px] bg-mist">
                {it.image && <Image src={it.image} alt={it.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="148px" />}
                <span className="absolute top-2 left-2 rounded-full bg-white/95 px-2 py-0.5 text-[9.5px] font-black text-ink shadow-sm">{it.categoryName}</span>
              </div>
              <p className={`mt-1.5 line-clamp-2 min-h-8 text-[12px] leading-tight font-extrabold ${dark ? "text-white" : "text-ink"}`}>{it.name}</p>
              <p className="mt-0.5 text-[12.5px] font-black text-brand">{formatMXN(it.price)}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
