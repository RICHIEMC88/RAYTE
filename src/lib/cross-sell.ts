import { db } from "@/db";
import { products, restaurants, services } from "@/db/schema";
import { and, asc, eq, inArray } from "drizzle-orm";
import type { CrossSellItem } from "@/components/cross-sell";

export function randomCrossTitle(): string {
  return "Todo en un solo rayte";
}

/**
 * Cross-selling con composición fija (4 tarjetas):
 *   1) Un tipo de comida (producto popular de un negocio de comida)
 *   2) Un servicio (hogar: plomería, limpieza, técnico, chef)
 *   3) Una cita (belleza o bienestar: barbería, masaje, manicure, yoga)
 *   4) Un médico (salud: médico, enfermería, nutrición, psicología)
 */
export async function crossSellItems(_exclude?: string | null): Promise<CrossSellItem[]> {
  const items: CrossSellItem[] = [];

  // 1) COMIDA: el producto más popular entre negocios de comida abiertos
  const foodRows = await db
    .select({ p: products, slug: restaurants.slug })
    .from(products)
    .innerJoin(restaurants, eq(products.restaurantId, restaurants.id))
    .where(
      and(
        eq(products.available, true),
        eq(restaurants.isOpen, true),
        inArray(restaurants.categorySlug, ["restaurantes", "turbo", "postres", "bebidas", "mercado", "saludable"]),
      ),
    )
    .orderBy(asc(products.sort))
    .limit(80);

  const food = foodRows.find((r) => r.p.popular) ?? foodRows[0];
  if (food) {
    items.push({
      key: `comida-${food.p.id}`,
      name: food.p.name,
      price: food.p.price,
      image: food.p.image,
      categoryName: "Comida",
      href: `/restaurante/${food.slug}`,
    });
  }

  // 2-4) SERVICIO · CITA · MÉDICO
  const svc = await db.select().from(services).where(eq(services.available, true)).orderBy(asc(services.sort));
  const pick = (cats: string[], label: string) => {
    const s = svc.find((x) => cats.includes(x.category));
    if (!s) return;
    items.push({
      key: `${label}-${s.id}`,
      name: s.name,
      price: s.price,
      image: s.image,
      categoryName: label,
      href: `/servicios/${s.slug}`,
    });
  };

  pick(["hogar"], "Servicio");
  pick(["belleza", "bienestar"], "Cita");
  pick(["salud"], "Médico");

  return items;
}
