import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { partnerAccounts, partnerSessions, restaurants } from "@/db/schema";
import { hashPassword, verifyPassword } from "@/lib/password";

export const PARTNER_COOKIE = "rayte_partner_session";
const SESSION_DAYS = 30;

export { hashPassword, verifyPassword };

/* ── Sesiones ── */
export function newToken(): string {
  return createHash("sha256").update(randomBytes(32)).digest("hex").slice(0, 64);
}

export async function createPartnerSession(partnerId: number): Promise<{ token: string; expiresAt: Date }> {
  const token = newToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000);
  await db.insert(partnerSessions).values({ token, partnerId, expiresAt });
  return { token, expiresAt };
}

export async function destroyPartnerSession(token: string) {
  await db.delete(partnerSessions).where(eq(partnerSessions.token, token));
}

/* Forma pública de la cuenta + su tienda (para el panel y la cookie). */
export type PartnerPublic = {
  id: number;
  username: string;
  partnerName: string;
  email: string;
  phone: string;
  restaurantId: number;
  store: typeof restaurants.$inferSelect;
};

export async function partnerOf(token: string): Promise<PartnerPublic | null> {
  try {
    const rows = await db
      .select({
        id: partnerAccounts.id,
        username: partnerAccounts.username,
        partnerName: partnerAccounts.partnerName,
        email: partnerAccounts.email,
        phone: partnerAccounts.phone,
        restaurantId: partnerAccounts.restaurantId,
        expiresAt: partnerSessions.expiresAt,
        store: restaurants,
      })
      .from(partnerSessions)
      .innerJoin(partnerAccounts, eq(partnerAccounts.id, partnerSessions.partnerId))
      .innerJoin(restaurants, eq(restaurants.id, partnerAccounts.restaurantId))
      .where(eq(partnerSessions.token, token));
    const row = rows[0];
    if (!row) return null;
    if (row.expiresAt.getTime() < Date.now()) {
      await destroyPartnerSession(token);
      return null;
    }
    return {
      id: row.id,
      username: row.username,
      partnerName: row.partnerName,
      email: row.email,
      phone: row.phone,
      restaurantId: row.restaurantId,
      store: row.store,
    };
  } catch {
    return null;
  }
}

/* Socio autenticado de la petición actual (léelo desde la cookie). */
export async function currentPartner(): Promise<PartnerPublic | null> {
  try {
    const jar = await cookies();
    const token = jar.get(PARTNER_COOKIE)?.value;
    if (!token) return null;
    return await partnerOf(token);
  } catch {
    return null;
  }
}

/* ¿Este socio es dueño del restaurante dado? */
export function partnerOwns(partner: PartnerPublic, restaurantId: number | string): boolean {
  return Number(partner.restaurantId) === Number(restaurantId);
}
