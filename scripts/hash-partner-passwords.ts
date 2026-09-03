/* Hashea las contraseñas de socios que aún están en texto plano.
   Ejecutar: npx tsx scripts/hash-partner-passwords.ts  (idempotente)
   Las que ya tienen formato "salt:hash" se dejan intactas. */
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import { partnerAccounts } from "../src/db/schema";
import { hashPassword } from "../src/lib/password";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function main() {
  const accounts = await db.select({ id: partnerAccounts.id, password: partnerAccounts.password }).from(partnerAccounts);
  let updated = 0;

  for (const acc of accounts) {
    if (acc.password.includes(":")) continue; // ya hasheada
    await db.update(partnerAccounts).set({ password: hashPassword(acc.password) }).where(eq(partnerAccounts.id, acc.id));
    updated++;
  }

  console.log(`✓ ${updated} contraseñas de socios hasheadas (scrypt + sal)`);
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
