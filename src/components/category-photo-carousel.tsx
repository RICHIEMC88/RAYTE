"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { LayoutGrid } from "lucide-react";
import type { Category } from "@/db/schema";

/* Fotos por categoría y por tipos de comida (estilo Uber Eats) */
const CATEGORY_PHOTOS: Record<string, string> = {
  restaurantes: "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
  panaderias: "https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
  mercado: "https://images.pexels.com/photos/2456435/pexels-photo-2456435.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
  turbo: "https://images.pexels.com/photos/3826282/pexels-photo-3826282.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
  farmacia: "https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
  bebidas: "https://images.pexels.com/photos/10701942/pexels-photo-10701942.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
  saludable: "https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
  postres: "https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
  mascotas: "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
  /* Tipos de comida */
  hamburguesas: "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
  pizza: "https://images.pexels.com/photos/1565982/pexels-photo-1565982.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
  tacos: "https://images.pexels.com/photos/4958792/pexels-photo-4958792.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
  sushi: "https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
  alitas: "https://images.pexels.com/photos/5652266/pexels-photo-5652266.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
  "pan-dulce": "https://images.pexels.com/photos/1775046/pexels-photo-1775046.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
  cafe: "https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
  bowls: "https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
  helados: "https://images.pexels.com/photos/1352281/pexels-photo-1352281.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
};

/* Tipos de comida específicos que se agregan a la lista */
export const FOOD_TYPES = [
  { slug: "hamburguesas", name: "Hamburguesas" },
  { slug: "pizza", name: "Pizza" },
  { slug: "tacos", name: "Tacos" },
  { slug: "sushi", name: "Sushi" },
  { slug: "alitas", name: "Alitas & Pollo" },
  { slug: "pan-dulce", name: "Pan Dulce" },
  { slug: "cafe", name: "Café" },
  { slug: "bowls", name: "Bowls" },
  { slug: "helados", name: "Helados" },
];

const FALLBACK = "https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200";

export default function CategoryPhotoCarousel({
  categories,
  value,
  onSelect,
  includeFoodTypes = true,
}: {
  categories: Category[];
  value: string | null;
  onSelect: (slug: string | null) => void;
  includeFoodTypes?: boolean;
}) {
  // Combina las categorías de comida (sin el círculo redundante "Restaurantes" ni "Mascotas") con los tipos de comida
  const allItems = [
    ...categories.filter((c) => c.slug !== "restaurantes" && c.slug !== "mascotas").map((c) => (c.slug === "farmacia" ? { ...c, name: "Farmacias" } : c)),
    ...(includeFoodTypes ? FOOD_TYPES : []),
  ];

  // Evita duplicados de slug si existen
  const seen = new Set<string>();
  const uniqueItems = allItems.filter((it) => {
    if (seen.has(it.slug)) return false;
    seen.add(it.slug);
    return true;
  });

  return (
    <div className="no-scrollbar -mx-4 flex gap-3.5 overflow-x-auto px-4 pb-1.5">
      {/* Todos */}
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => onSelect(null)} className="flex w-[72px] shrink-0 flex-col items-center gap-1.5">
        <span
          className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand to-[var(--brand-accent)] transition ${!value ? "ring-2 ring-brand ring-offset-2 shadow-md" : "opacity-85"}`}
        >
          <LayoutGrid className="h-6 w-6 text-white" strokeWidth={2.2} />
        </span>
        <span className={`text-[10.5px] font-extrabold ${!value ? "text-brand" : "text-ink-soft"}`}>Todos</span>
      </motion.button>

      {uniqueItems.map((c) => {
        const active = value === c.slug;
        return (
          <motion.button key={c.slug} whileTap={{ scale: 0.9 }} onClick={() => onSelect(active ? null : c.slug)} className="flex w-[72px] shrink-0 flex-col items-center gap-1.5">
            <span className={`relative h-14 w-14 overflow-hidden rounded-full bg-mist transition ${active ? "ring-2 ring-brand ring-offset-2 shadow-md" : ""}`}>
              <Image src={CATEGORY_PHOTOS[c.slug] ?? FALLBACK} alt={c.name} fill sizes="56px" className="object-cover" />
            </span>
            <span className={`text-[10.5px] font-extrabold text-center leading-tight truncate max-w-[70px] ${active ? "text-brand font-black" : "text-ink-soft"}`}>
              {c.name}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
