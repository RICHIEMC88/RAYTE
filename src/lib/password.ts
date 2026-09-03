import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

/* Contraseñas (scrypt + sal). Módulo puro, sin dependencias de Next.js,
   para poder usarse también desde los seeds (tsx). */

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

/* Compatible con texto plano (datos sembrados históricos) y con formato hasheado. */
export function verifyPassword(password: string, stored: string): boolean {
  if (!stored.includes(":")) {
    return timingSafeEqual(Buffer.from(stored), Buffer.from(password));
  }
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}
