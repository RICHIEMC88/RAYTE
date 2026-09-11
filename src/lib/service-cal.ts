import { sql } from "drizzle-orm";
import { db } from "@/db";

/* Calendarios externos (ICS) por servicio.
   Tabla independiente para NO tocar el esquema principal de `services`:
   se crea de forma idempotente la primera vez que se usa, y si el usuario
   de la BD no puede crearla, el resto de la app sigue funcionando. */

let ensured = false;

async function ensureTable(): Promise<void> {
  if (ensured) return;
  await db.execute(sql`
    create table if not exists service_calendars (
      service_id integer primary key,
      ics_url text not null,
      updated_at timestamptz not null default now()
    )
  `);
  ensured = true;
}

export async function getServiceCalUrl(serviceId: number): Promise<string | null> {
  try {
    await ensureTable();
    const rows = await db.execute(sql`select ics_url from service_calendars where service_id = ${serviceId}`);
    const first = (rows as unknown as Array<{ ics_url: string }>)[0];
    return first?.ics_url ?? null;
  } catch (e) {
    console.error("service_calendars: no disponible", e);
    return null;
  }
}

export async function setServiceCalUrl(serviceId: number, url: string | null): Promise<void> {
  await ensureTable();
  if (!url) {
    await db.execute(sql`delete from service_calendars where service_id = ${serviceId}`);
    return;
  }
  await db.execute(sql`
    insert into service_calendars (service_id, ics_url, updated_at)
    values (${serviceId}, ${url}, now())
    on conflict (service_id) do update set ics_url = excluded.ics_url, updated_at = now()
  `);
}
