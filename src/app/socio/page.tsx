import { db } from "@/db";
import { restaurants, partnerAccounts } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import SocioClient from "./socio-client";

export const dynamic = "force-dynamic";

export default async function SocioPage() {
  const accounts = await db
    .select({
      id: partnerAccounts.id,
      username: partnerAccounts.username,
      partnerName: partnerAccounts.partnerName,
      email: partnerAccounts.email,
      restaurantId: partnerAccounts.restaurantId,
      storeName: restaurants.name,
      storeSlug: restaurants.slug,
      storeImage: restaurants.image,
      categorySlug: restaurants.categorySlug,
    })
    .from(partnerAccounts)
    .innerJoin(restaurants, eq(partnerAccounts.restaurantId, restaurants.id))
    .orderBy(asc(restaurants.sort));

  return <SocioClient initialAccounts={accounts} />;
}
