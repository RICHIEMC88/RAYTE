import { db } from "@/db";
import { categories, restaurants, products, services } from "@/db/schema";
import { and, asc, eq, inArray } from "drizzle-orm";
import AppHeader from "@/components/app-header";
import SurpriseHost from "@/components/surprise-host";
import { crossSellItems, randomCrossTitle } from "@/lib/cross-sell";
import {
  CategoryGrid,
  PromoCarousel,
  TurboRow,
  RestaurantList,
  ServicesRow,
  FeaturedFoodRow,
  FavoritesFoodRow,
  SaludRow,
  RayteGoBanner,
} from "@/components/home";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const cats = await db.select().from(categories).orderBy(asc(categories.sort));
  const stores = await db
    .select()
    .from(restaurants)
    .orderBy(asc(restaurants.sort));

  const turbo = stores.find((r) => r.isTurbo);
  const turboProducts = turbo
    ? await db
        .select()
        .from(products)
        .where(eq(products.restaurantId, turbo.id))
        .orderBy(asc(products.sort))
    : [];

  const cross = await crossSellItems(null);
  const crossTitle = randomCrossTitle();

  const allServices = await db
    .select()
    .from(services)
    .where(eq(services.available, true))
    .orderBy(asc(services.sort));

  const regularServices = allServices.filter((s) => s.category !== "salud");
  const saludServices = allServices.filter((s) => s.category === "salud");
  const pharmacyStores = stores.filter((s) => s.categorySlug === "farmacia");

  const brasa = stores.find((r) => r.slug === "la-brasa-smash");
  const crack = stores.find((r) => r.slug === "pollo-crack");

  // Platillos de comida para el botón "Sorpréndeme"
  const foodStores = stores.filter((r) => ["restaurantes", "panaderias", "postres"].includes(r.categorySlug) && r.isOpen && !r.isTurbo);
  const dishes = foodStores.length
    ? await db
        .select({
          id: products.id,
          name: products.name,
          description: products.description,
          price: products.price,
          image: products.image,
          section: products.section,
          restaurantId: products.restaurantId,
        })
        .from(products)
        .where(and(eq(products.available, true), inArray(products.restaurantId, foodStores.map((s) => s.id))))
    : [];

  const promos = [
    {
      title: "50% en tu primer pedido",
      subtitle: "En La Brasa Smash con el código HOLA50",
      image: brasa?.image ?? "",
      href: "/restaurante/la-brasa-smash",
      gradient: "from-brand to-brand-hard",
      tag: "Solo hoy",
    },
    {
      title: "Turbo en 10 min",
      subtitle: "Antojos y esenciales al instante",
      image: turboProducts[1]?.image ?? "",
      href: "/restaurante/turbo-rayte",
      gradient: "from-[#221e2c] to-[#3c3348]",
      tag: "Turbo",
    },
    {
      title: "Envío gratis",
      subtitle: `En ${crack?.name ?? "Pollo Crack"} todo el fin de semana`,
      image: crack?.image ?? "",
      href: "/restaurante/pollo-crack",
      gradient: "from-[#e0115f] to-[#7f0a3a]",
      tag: "Envío gratis",
    },
    {
      title: "Rayte Go llegó",
      subtitle: "Muévete por la ciudad en moto o carro desde $45",
      image: "",
      href: "/viajes",
      gradient: "from-[#16121b] to-[#3a2f45]",
      tag: "Nuevo · Viajes",
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <AppHeader />
      <CategoryGrid categories={cats} />
      <PromoCarousel promos={promos} />
      {turbo && turboProducts.length > 0 && (
        <TurboRow store={turbo} products={turboProducts} />
      )}

      {/* 1. Destacadas para ti — Comida */}
      <FeaturedFoodRow stores={stores} />

      {/* 2. Favoritos — Comida */}
      <FavoritesFoodRow stores={stores} />

      {/* 3. Citas y Servicios destacados */}
      {regularServices.length > 0 && <ServicesRow services={regularServices} />}

      {/* 4. Salud destacados (Médicos y Especialistas a domicilio) */}
      {saludServices.length > 0 && <SaludRow services={saludServices} />}

      {/* 🚗 Banner para Rayte Go (Viajes) */}
      <RayteGoBanner />

      {/* Catálogo completo con Filtros y Sorpréndeme */}
      <RestaurantList restaurants={stores} dishes={dishes} crossItems={cross} crossTitle={crossTitle} />
      <SurpriseHost dishes={dishes} restaurants={stores} />
    </main>
  );
}
