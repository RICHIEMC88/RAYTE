import { NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";
import { db } from "@/db";
import { partnerAccounts, restaurants } from "@/db/schema";
import {
  PARTNER_COOKIE,
  createPartnerSession,
  currentPartner,
  destroyPartnerSession,
  verifyPassword,
} from "@/lib/partner-auth";

/* ============================================================
   Autenticación de Socios / Dueños de negocio.
   · GET  → { partner } sesión actual (o null). Ya NO expone la
            lista de cuentas (antes todo el mundo podía verlas).
   · POST { action:"login", identifier, password } → crea sesión
            httpOnly en el servidor y devuelve el partner + su tienda.
   · POST { action:"logout" } → destruye la sesión y la cookie.
   ============================================================ */

export async function GET() {
  const partner = await currentPartner();
  return NextResponse.json({ partner });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action = "login", identifier = "", password = "" } = body;

    /* ── LOGIN ── */
    if (action === "login") {
      const trimmedId = String(identifier).trim().toLowerCase();
      const trimmedPass = String(password).trim();

      if (!trimmedId || !trimmedPass) {
        return NextResponse.json({ error: "Ingresa tu usuario o correo y contraseña" }, { status: 400 });
      }

      const rows = await db
        .select({
          id: partnerAccounts.id,
          username: partnerAccounts.username,
          partnerName: partnerAccounts.partnerName,
          email: partnerAccounts.email,
          phone: partnerAccounts.phone,
          password: partnerAccounts.password,
          restaurantId: partnerAccounts.restaurantId,
          store: restaurants,
        })
        .from(partnerAccounts)
        .innerJoin(restaurants, eq(partnerAccounts.restaurantId, restaurants.id))
        .where(or(eq(partnerAccounts.username, trimmedId), eq(partnerAccounts.email, trimmedId)));

      const account = rows[0];

      if (!account) {
        return NextResponse.json({ error: "Usuario o correo no registrado como socio" }, { status: 401 });
      }

      if (!verifyPassword(trimmedPass, account.password)) {
        return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
      }

      const { token, expiresAt } = await createPartnerSession(account.id);
      const { password: _pw, ...partner } = account;

      const res = NextResponse.json({ ok: true, partner });
      res.cookies.set(PARTNER_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 86400,
        expires: expiresAt,
        path: "/",
      });
      return res;
    }

    /* ── LOGOUT ── */
    if (action === "logout") {
      const token = req.headers.get("cookie")
        ?.split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith(`${PARTNER_COOKIE}=`))
        ?.split("=")
        .slice(1)
        .join("=");
      if (token) await destroyPartnerSession(token);

      const res = NextResponse.json({ ok: true });
      res.cookies.set(PARTNER_COOKIE, "", { maxAge: 0, path: "/" });
      return res;
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (err) {
    console.error("Error en POST /api/partner/auth:", err);
    return NextResponse.json({ error: "Error en el servidor de autenticación" }, { status: 500 });
  }
}
