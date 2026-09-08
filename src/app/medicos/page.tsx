import { db } from "@/db";
import { services } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import MedicosClient from "./medicos-client";

export const dynamic = "force-dynamic";

/* Listado DEDICADO de médicos y especialistas de la salud.
   Se muestra a parte del listado general de servicios para que
   los usuarios encuentren y agenden a los profesionales fácilmente. */
export default async function MedicosPage() {
  const list = await db
    .select()
    .from(services)
    .where(eq(services.category, "salud"))
    .orderBy(asc(services.sort), asc(services.id));

  return <MedicosClient services={list} />;
}
