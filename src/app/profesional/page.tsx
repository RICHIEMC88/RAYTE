import { db } from "@/db";
import { services } from "@/db/schema";
import { asc } from "drizzle-orm";
import ProfesionalClient from "./profesional-client";

export const dynamic = "force-dynamic";

export default async function ProfesionalPage() {
  const list = await db
    .select({
      id: services.id,
      name: services.name,
      slug: services.slug,
      category: services.category,
      provider: services.provider,
      proName: services.proName,
      image: services.image,
      rating: services.rating,
      price: services.price,
      durationMin: services.durationMin,
      available: services.available,
      domicilio: services.domicilio,
      local: services.local,
      verificationDocs: services.verificationDocs,
    })
    .from(services)
    .orderBy(asc(services.sort));

  return <ProfesionalClient services={list} />;
}
