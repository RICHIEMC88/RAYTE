import { db } from "@/db";
import { categories, restaurants, products, services } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import SearchClient from "./search-client";
import SurpriseHost from "@/components/surprise-host";
import { crossSellItems, randomCrossTitle } from "@/lib/cross-sell";

export const dynamic = "force-dynamic";

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{
    cat?: string;
    filter?: string;
    fav?: string;
    free?: string;
    open?: string;
    pickup?: string;
    delivery?: string;
    destacadas?: string;
    sort?: string;
    q?: string;
  }>;
}) {
  const params = await searchParams;

  const [cats, stores, prods, svcs] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.sort)),
    db.select().from(restaurants).orderBy(asc(restaurants.sort)),
    db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        image: products.image,
        section: products.section,
        restaurantId: products.restaurantId,
        restaurantSlug: restaurants.slug,
        restaurantName: restaurants.name,
      })
      .from(products)
      .innerJoin(restaurants, eq(products.restaurantId, restaurants.id))
      .where(eq(products.available, true)),
    db.select().from(services).where(eq(services.available, true)).orderBy(asc(services.sort)),
  ]);

  const cross = await crossSellItems(params.cat ?? null);
  const crossTitle = randomCrossTitle();

  return (
    <>
      <SearchClient
        categories={cats}
        stores={stores}
        products={prods}
        services={svcs}
        initialCat={params.cat ?? null}
        initialDestacadas={params.filter === "destacadas" || params.destacadas === "1"}
        initialFav={params.fav === "1" || params.filter === "favoritos"}
        initialFree={params.free === "1" || params.filter === "envio-gratis"}
        initialOpen={params.open === "1" || params.filter === "abiertos"}
        initialPickup={params.pickup === "1" || params.filter === "recoger"}
        initialDelivery={params.delivery === "1" || params.filter === "domicilio"}
        initialSort={params.sort === "fast" || params.sort === "near" ? params.sort : "none"}
        initialQuery={params.q ?? ""}
        crossItems={cross}
        crossTitle={crossTitle}
      />
      <SurpriseHost dishes={prods} restaurants={stores} />
    </>
  );
}
