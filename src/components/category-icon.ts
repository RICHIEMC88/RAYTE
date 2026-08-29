import { Utensils, ShoppingBasket, Zap, Pill, Beer, Salad, IceCreamCone, PawPrint, LayoutGrid, Croissant } from "lucide-react";

type IconType = React.ComponentType<{ className?: string; strokeWidth?: number }>;

/* Íconos por slug de categoría (estilo Uber Eats en los chips) */
export const CATEGORY_ICONS: Record<string, IconType> = {
  utensils: Utensils,
  croissant: Croissant,
  "shopping-basket": ShoppingBasket,
  zap: Zap,
  pill: Pill,
  beer: Beer,
  salad: Salad,
  "ice-cream-cone": IceCreamCone,
  "paw-print": PawPrint,
};

export const ALL_ICON: IconType = LayoutGrid;

export const categoryIcon = (icon: string): IconType => CATEGORY_ICONS[icon] ?? Utensils;
