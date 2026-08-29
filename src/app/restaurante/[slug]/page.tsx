import { notFound } from "next/navigation";
import { db } from "@/db";
import { restaurants, products, productExtras } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";
import RestaurantClient from "./restaurant-client";

export const dynamic = "force-dynamic";

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [store] = await db.select().from(restaurants).where(eq(restaurants.slug, slug));
  if (!store) notFound();

  const menu = await db
    .select()
    .from(products)
    .where(and(eq(products.restaurantId, store.id), eq(products.available, true)))
    .orderBy(asc(products.sort), asc(products.id));

  const extras = await db
    .select()
    .from(productExtras)
    .where(and(eq(productExtras.restaurantId, store.id), eq(productExtras.available, true)))
    .orderBy(asc(productExtras.name), asc(productExtras.id));

  return <RestaurantClient key={store.slug} store={store} menu={menu} extras={extras} />;
}
