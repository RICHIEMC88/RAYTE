import { db } from "@/db";
import { services, restaurants } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import ServicesClient from "./services-client";
import { crossSellItems, randomCrossTitle } from "@/lib/cross-sell";

export const dynamic = "force-dynamic";

export default async function ServiciosPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const list = await db.select().from(services).where(eq(services.available, true)).orderBy(asc(services.sort));
  const cross = await crossSellItems(null);

  /* Las tiendas de mascotas viven en Mascotas de Citas y Servicios */
  const petStores = await db
    .select({ name: restaurants.name, slug: restaurants.slug, image: restaurants.image, rating: restaurants.rating, timeMin: restaurants.timeMin, timeMax: restaurants.timeMax, isOpen: restaurants.isOpen })
    .from(restaurants)
    .where(eq(restaurants.categorySlug, "mascotas"))
    .orderBy(asc(restaurants.sort));

  return (
    <ServicesClient
      services={list}
      cat={cat ?? null}
      crossItems={cross}
      crossTitle={randomCrossTitle()}
      petStores={petStores}
    />
  );
}
