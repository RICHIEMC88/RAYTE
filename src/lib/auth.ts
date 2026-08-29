import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users, type User } from "@/db/schema";

export const SESSION_COOKIE = "rayte_session";
const SESSION_DAYS = 30;

/* ── Contraseñas (scrypt + sal) ── */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

/* ── Sesiones ── */
export function newToken(): string {
  return createHash("sha256").update(randomBytes(32)).digest("hex").slice(0, 64);
}

export async function createSession(userId: number): Promise<{ token: string; expiresAt: Date }> {
  const token = newToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000);
  await db.insert(sessions).values({ token, userId, expiresAt });
  return { token, expiresAt };
}

export async function destroySession(token: string) {
  await db.delete(sessions).where(eq(sessions.token, token));
}

/* Usuario de la sesión actual (o null). Lee la cookie httpOnly. */
export async function sessionUser(): Promise<User | null> {
  try {
    const jar = await cookies();
    const token = jar.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const rows = await db
      .select({ user: users, expiresAt: sessions.expiresAt })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(eq(sessions.token, token));
    const row = rows[0];
    if (!row) return null;
    if (row.expiresAt.getTime() < Date.now()) {
      await destroySession(token);
      return null;
    }
    return row.user;
  } catch {
    return null;
  }
}

export function publicUser(u: User) {
  return { id: u.id, name: u.name, phone: u.phone, address: u.address };
}
