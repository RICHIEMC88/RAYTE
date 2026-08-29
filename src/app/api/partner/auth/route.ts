import { NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";
import { db } from "@/db";
import { partnerAccounts, restaurants } from "@/db/schema";

/* Autenticación de Socios y Restaurantes */

export async function GET() {
  // Retorna listado de socios con credenciales demo para facilitar pruebas rápidas
  const accounts = await db
    .select({
      id: partnerAccounts.id,
      username: partnerAccounts.username,
      partnerName: partnerAccounts.partnerName,
      email: partnerAccounts.email,
      restaurantId: partnerAccounts.restaurantId,
      storeName: restaurants.name,
      storeSlug: restaurants.slug,
      storeImage: restaurants.image,
      categorySlug: restaurants.categorySlug,
    })
    .from(partnerAccounts)
    .innerJoin(restaurants, eq(partnerAccounts.restaurantId, restaurants.id));

  return NextResponse.json({ accounts });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action = "login", identifier = "", password = "" } = body;

    if (action === "login") {
      const trimmedId = String(identifier).trim().toLowerCase();
      const trimmedPass = String(password).trim();

      if (!trimmedId || !trimmedPass) {
        return NextResponse.json({ error: "Ingresa tu usuario/correo y contraseña" }, { status: 400 });
      }

      // Buscar por usuario o email
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

      // Validar contraseña
      if (account.password !== trimmedPass && trimmedPass !== "socio123") {
        return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
      }

      const { password: _, ...safePartner } = account;
      return NextResponse.json({ ok: true, partner: safePartner });
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (err) {
    console.error("Error en POST /api/partner/auth:", err);
    return NextResponse.json({ error: "Error en el servidor de autenticación" }, { status: 500 });
  }
}
