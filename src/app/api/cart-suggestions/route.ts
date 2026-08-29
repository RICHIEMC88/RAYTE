import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products, restaurants } from "@/db/schema";

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const SUPPORT_KEYWORDS = [
  "bebida",
  "drink",
  "acompan",
  "acompañ",
  "guarn",
  "entrada",
  "postre",
  "cafe",
  "café",
  "snack",
  "papas",
  "dip",
  "aderezo",
  "salsa",
  "pan dulce",
  "pan salado",
  "pasteler",
  "donas",
  "helado",
  "malteada",
  "frappe",
  "frappé",
  "te",
  "té",
  "limonada",
  "agua",
  "refresco",
  "soda",
  "jugo",
  "batido",
  "smoothie",
  "guacamole",
  "frijoles",
  "queso",
  "brownie",
  "pay",
  "pastel",
  "tortas",
  "para acomp",
  "acompañar",
];

const MAIN_KEYWORDS = [
  "combo",
  "paquete",
  "parrillada",
  "pizza",
  "burger",
  "smash",
  "taco",
  "burrito",
  "roll",
  "bowl",
  "pollo",
  "rib eye",
  "ribeye",
  "arrachera",
  "sirloin",
  "tomahawk",
  "new york",
  "picaña",
  "picanha",
  "lasagna",
  "spaghetti",
  "salmon poke",
  "salmón poke",
];

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const slug = String(sp.get("store") ?? "").trim();
  const exclude = new Set(
    String(sp.get("exclude") ?? "")
      .split(",")
      .map((x) => Number(x.trim()))
      .filter((x) => Number.isFinite(x) && x > 0),
  );

  if (!slug) {
    return NextResponse.json({ error: "store is required" }, { status: 400 });
  }

  const [store] = await db.select().from(restaurants).where(eq(restaurants.slug, slug));
  if (!store) {
    return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 });
  }

  const list = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      image: products.image,
      section: products.section,
      popular: products.popular,
    })
    .from(products)
    .where(and(eq(products.restaurantId, store.id), eq(products.available, true)))
    .orderBy(asc(products.sort), asc(products.id));

  const base = list.filter((item) => !exclude.has(item.id));
  const scored = base.map((item) => {
    const text = norm(`${item.name} ${item.description} ${item.section}`);
    const isSupport = SUPPORT_KEYWORDS.some((keyword) => text.includes(norm(keyword)));
    const isMain = MAIN_KEYWORDS.some((keyword) => text.includes(norm(keyword)));
    let score = item.popular ? 5 : 0;
    if (isSupport) score += 10;
    if (item.section && SUPPORT_KEYWORDS.some((keyword) => norm(item.section).includes(norm(keyword)))) score += 6;
    if (isMain) score -= 6;
    return { ...item, score, isSupport, isMain };
  });

  const supporting = scored
    .filter((item) => item.isSupport && !item.isMain)
    .sort((a, b) => b.score - a.score || Number(b.popular) - Number(a.popular) || a.price - b.price)
    .slice(0, 10);

  const fallback = scored
    .filter((item) => !item.isMain)
    .sort((a, b) => Number(b.popular) - Number(a.popular) || a.price - b.price)
    .slice(0, 10);

  return NextResponse.json({
    suggestions: (supporting.length > 0 ? supporting : fallback).map(({ score, isSupport, isMain, ...item }) => item),
  });
}
