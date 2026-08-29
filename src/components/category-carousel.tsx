"use client";

import { motion } from "framer-motion";
import type { Category } from "@/db/schema";
import { categoryIcon, ALL_ICON } from "./category-icon";

/**
 * Pasarela de categorías estilo Uber Eats: círculos con ícono y mini etiqueta.
 * Se usa en la sección de restaurantes (home) y en la página de búsqueda.
 */
export default function CategoryCarousel({
  categories,
  value,
  onSelect,
}: {
  categories: Category[];
  value: string | null;
  onSelect: (slug: string | null) => void;
}) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
      <CarouselItem
        active={!value}
        onClick={() => onSelect(null)}
        icon={ALL_ICON}
        label="Todos"
        color="#1f2937"
        bg="#f3f4f6"
      />
      {categories.map((c) => (
        <CarouselItem
          key={c.slug}
          active={value === c.slug}
          onClick={() => onSelect(value === c.slug ? null : c.slug)}
          icon={categoryIcon(c.icon)}
          label={c.name}
          color={c.color}
          bg={c.bg}
        />
      ))}
    </div>
  );
}

function CarouselItem({
  active,
  onClick,
  icon: Icon,
  label,
  color,
  bg,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <motion.button whileTap={{ scale: 0.9 }} onClick={onClick} className="flex w-[64px] shrink-0 flex-col items-center gap-1.5">
      <span
        className="flex h-[52px] w-[52px] items-center justify-center rounded-[18px] transition"
        style={{ backgroundColor: bg, boxShadow: active ? `0 0 0 2px #fff, 0 0 0 4px ${color}` : undefined }}
      >
        <span style={{ color }}>
          <Icon className="h-6 w-6" strokeWidth={2.2} />
        </span>
      </span>
      <span className={`text-center text-[10.5px] leading-tight font-extrabold ${active ? "text-ink" : "text-ink-soft"}`}>{label}</span>
    </motion.button>
  );
}
