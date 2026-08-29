import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { productExtras, products, restaurants } from "@/db/schema";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const slug = String(sp.get("store") ?? "").trim();
  const productId = Number(sp.get("productId") ?? 0);

  if (!slug || !Number.isFinite(productId) || productId <= 0) {
    return NextResponse.json({ error: "store y productId son obligatorios" }, { status: 400 });
  }

  const [store] = await db.select().from(restaurants).where(eq(restaurants.slug, slug));
  if (!store) {
    return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 });
  }

  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.id, productId), eq(products.restaurantId, store.id), eq(products.available, true)));

  if (!product) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  const extras = await db
    .select()
    .from(productExtras)
    .where(and(eq(productExtras.restaurantId, store.id), eq(productExtras.available, true)))
    .orderBy(asc(productExtras.name), asc(productExtras.id));

  return NextResponse.json({ store, product, extras });
}
