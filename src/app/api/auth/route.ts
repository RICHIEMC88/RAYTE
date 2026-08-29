import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { SESSION_COOKIE, createSession, destroySession, hashPassword, publicUser, sessionUser, verifyPassword } from "@/lib/auth";

/* GET → usuario de la sesión actual (o null) */
export async function GET() {
  const user = await sessionUser();
  return NextResponse.json({ user: user ? publicUser(user) : null });
}

/* POST { action: "register" | "login" | "logout" | "update", ... } */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const jar = await cookies();

    if (body.action === "register") {
      const name = String(body.name ?? "").trim();
      const phone = String(body.phone ?? "").trim();
      const password = String(body.password ?? "");
      const address = String(body.address ?? "").trim();
      if (!name || !phone || password.length < 4) {
        return NextResponse.json({ error: "Nombre, teléfono y contraseña (mín. 4 caracteres) son obligatorios." }, { status: 400 });
      }
      const [existing] = await db.select().from(users).where(eq(users.phone, phone));
      if (existing) return NextResponse.json({ error: "Ya existe una cuenta con ese teléfono. Inicia sesión." }, { status: 409 });
      const [user] = await db.insert(users).values({ name, phone, address, passwordHash: hashPassword(password) }).returning();
      const { token, expiresAt } = await createSession(user.id);
      jar.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/", expires: expiresAt });
      return NextResponse.json({ ok: true, user: publicUser(user) });
    }

    if (body.action === "login") {
      const phone = String(body.phone ?? "").trim();
      const password = String(body.password ?? "");
      const [user] = await db.select().from(users).where(eq(users.phone, phone));
      if (!user || !verifyPassword(password, user.passwordHash)) {
        return NextResponse.json({ error: "Teléfono o contraseña incorrectos." }, { status: 401 });
      }
      const { token, expiresAt } = await createSession(user.id);
      jar.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/", expires: expiresAt });
      return NextResponse.json({ ok: true, user: publicUser(user) });
    }

    if (body.action === "logout") {
      const token = jar.get(SESSION_COOKIE)?.value;
      if (token) await destroySession(token);
      jar.delete(SESSION_COOKIE);
      return NextResponse.json({ ok: true });
    }

    if (body.action === "update") {
      const user = await sessionUser();
      if (!user) return NextResponse.json({ error: "No has iniciado sesión." }, { status: 401 });
      const name = String(body.name ?? user.name).trim() || user.name;
      const address = String(body.address ?? user.address).trim();
      const [updated] = await db.update(users).set({ name, address }).where(eq(users.id, user.id)).returning();
      return NextResponse.json({ ok: true, user: publicUser(updated) });
    }

    return NextResponse.json({ error: "acción inválida" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
