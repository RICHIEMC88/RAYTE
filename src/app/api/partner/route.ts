import { NextResponse } from "next/server";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { restaurants, products, productExtras } from "@/db/schema";
import { currentPartner, partnerOwns, type PartnerPublic } from "@/lib/partner-auth";

/* Panel de socios (con roles / permisos):
   Cada socio autenticado SÓLO puede leer y modificar SU negocio.
   Ninguna acción depende de un `restaurantId` o `slug` que se
   envíe desde el cliente: siempre se valida contra la sesión.
   GET  ?slug=...  → tienda + menú + extras
   POST { action: "add_product", ... }
   POST { action: "update_product", ... }
   POST { action: "delete_product", ... }
   POST { action: "add_extra", ... }
   POST { action: "update_extra", ... }
   POST { action: "delete_extra", ... }
   PATCH { action: "store", slug, isOpen }
   PATCH { action: "product", productId, available }
   PATCH { action: "extra", extraId, available }
*/

export async function GET(req: Request) {
  const partner = await currentPartner();
  if (!partner) return NextResponse.json({ error: "Sesión de socio requerida" }, { status: 401 });

  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug requerido" }, { status: 400 });
  const [store] = await db.select().from(restaurants).where(eq(restaurants.slug, slug));
  if (!store) return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 });

  // Roles: solo el dueño de esta tienda puede ver su panel
  if (!partnerOwns(partner, store.id)) {
    return NextResponse.json({ error: "No tienes permiso sobre esta tienda" }, { status: 403 });
  }

  const menu = await db
    .select()
    .from(products)
    .where(eq(products.restaurantId, store.id))
    .orderBy(asc(products.sort), asc(products.id));

  const extras = await db
    .select()
    .from(productExtras)
    .where(eq(productExtras.restaurantId, store.id))
    .orderBy(asc(productExtras.name), asc(productExtras.id));

  return NextResponse.json({ store, products: menu, extras });
}

export async function POST(req: Request) {
  try {
    const partner = await currentPartner();
    if (!partner) {
      return NextResponse.json({ error: "Sesión de socio requerida" }, { status: 401 });
    }
    const body = await req.json();

    /* Valida que el `restaurantId` de la acción pertenezca al socio. */
    const owned = (rid: unknown) => partnerOwns(partner, String(rid ?? ""));

    /* ── AGREGAR PLATILLO / PRODUCTO AL MENÚ ── */
    if (body.action === "add_product") {
      const { restaurantId, name, price, description = "", section = "General", image = null, popular = false, extras = [] } = body;

      if (!owned(restaurantId)) {
        return NextResponse.json({ error: "No tienes permiso para editar este negocio" }, { status: 403 });
      }
      if (!restaurantId || !name || price === undefined) {
        return NextResponse.json({ error: "Datos incompletos para agregar platillo" }, { status: 400 });
      }

      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice < 1) {
        return NextResponse.json({ error: "Precio inválido" }, { status: 400 });
      }

      // Obtener el mayor sort actual
      const existing = await db
        .select({ sort: products.sort })
        .from(products)
        .where(eq(products.restaurantId, Number(restaurantId)))
        .orderBy(desc(products.sort))
        .limit(1);
      const nextSort = (existing[0]?.sort ?? 0) + 1;

      const [newProduct] = await db
        .insert(products)
        .values({
          restaurantId: Number(restaurantId),
          name: String(name).trim(),
          description: String(description).trim(),
          price: numPrice,
          section: String(section).trim() || "General",
          image: image ? String(image).trim() : null,
          popular: !!popular,
          available: true,
          sort: nextSort,
        })
        .returning();

      // Guardar extras asignados a este platillo
      const createdExtras = [];
      if (Array.isArray(extras) && extras.length > 0) {
        for (const ext of extras) {
          if (!ext.name || ext.price === undefined) continue;
          const [e] = await db
            .insert(productExtras)
            .values({
              restaurantId: Number(restaurantId),
              productId: newProduct.id,
              name: String(ext.name).trim(),
              price: Number(ext.price) || 0,
              available: true,
              sort: 0,
            })
            .returning();
          createdExtras.push(e);
        }
      }

      return NextResponse.json({ ok: true, product: newProduct, createdExtras }, { status: 201 });
    }

    /* ── EDITAR PLATILLO / PRODUCTO ── */
    if (body.action === "update_product") {
      const { id, restaurantId, name, price, description, section, image, popular, available, extras } = body;
      if (!id) return NextResponse.json({ error: "id de producto requerido" }, { status: 400 });

      // Roles: el platillo debe pertenecer al negocio del socio
      const [target] = await db.select().from(products).where(eq(products.id, Number(id)));
      if (!target) return NextResponse.json({ error: "Platillo no encontrado" }, { status: 404 });
      if (!owned(target.restaurantId)) {
        return NextResponse.json({ error: "No tienes permiso para editar este platillo" }, { status: 403 });
      }
      if (restaurantId !== undefined && !owned(restaurantId)) {
        return NextResponse.json({ error: "No tienes permiso para cambiar de negocio" }, { status: 403 });
      }

      const patch: Partial<typeof products.$inferInsert> = {};
      if (name !== undefined) patch.name = String(name).trim();
      if (price !== undefined) patch.price = Number(price);
      if (description !== undefined) patch.description = String(description).trim();
      if (section !== undefined) patch.section = String(section).trim();
      if (image !== undefined) patch.image = image ? String(image).trim() : null;
      if (popular !== undefined) patch.popular = !!popular;
      if (available !== undefined) patch.available = !!available;

      const [updated] = await db
        .update(products)
        .set(patch)
        .where(eq(products.id, Number(id)))
        .returning();

      if (!updated) return NextResponse.json({ error: "Platillo no encontrado" }, { status: 404 });

      // Si se enviaron extras actualizados para este platillo
      let updatedExtras: (typeof productExtras.$inferSelect)[] = [];
      if (Array.isArray(extras) && restaurantId) {
        // Borrar extras específicos anteriores de este producto
        await db.delete(productExtras).where(eq(productExtras.productId, Number(id)));

        // Insertar los extras seleccionados
        for (const ext of extras) {
          if (!ext.name || ext.price === undefined) continue;
          const [e] = await db
            .insert(productExtras)
            .values({
              restaurantId: Number(restaurantId),
              productId: Number(id),
              name: String(ext.name).trim(),
              price: Number(ext.price) || 0,
              available: true,
              sort: 0,
            })
            .returning();
          updatedExtras.push(e);
        }
      }

      return NextResponse.json({ ok: true, product: updated, updatedExtras });
    }

    /* ── ELIMINAR PLATILLO ── */
    if (body.action === "delete_product") {
      const { id } = body;
      if (!id) return NextResponse.json({ error: "id de producto requerido" }, { status: 400 });

      const [target] = await db.select().from(products).where(eq(products.id, Number(id)));
      if (!target) return NextResponse.json({ error: "Platillo no encontrado" }, { status: 404 });
      if (!owned(target.restaurantId)) {
        return NextResponse.json({ error: "No tienes permiso para eliminar este platillo" }, { status: 403 });
      }

      await db.delete(products).where(eq(products.id, Number(id)));
      return NextResponse.json({ ok: true });
    }

    /* ── AGREGAR EXTRA / COMPLEMENTO ── */
    if (body.action === "add_extra") {
      const { restaurantId, productId = null, name, price } = body;
      if (!owned(restaurantId)) {
        return NextResponse.json({ error: "No tienes permiso para editar este negocio" }, { status: 403 });
      }
      if (!restaurantId || !name || price === undefined) {
        return NextResponse.json({ error: "Datos incompletos para agregar extra" }, { status: 400 });
      }

      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice < 0) {
        return NextResponse.json({ error: "Precio del extra inválido" }, { status: 400 });
      }

      const [newExtra] = await db
        .insert(productExtras)
        .values({
          restaurantId: Number(restaurantId),
          productId: productId ? Number(productId) : null,
          name: String(name).trim(),
          price: numPrice,
          available: true,
          sort: 0,
        })
        .returning();

      return NextResponse.json({ ok: true, extra: newExtra }, { status: 201 });
    }

    /* ── EDITAR EXTRA / COMPLEMENTO ── */
    if (body.action === "update_extra") {
      const { id, name, price, available, productId } = body;
      if (!id) return NextResponse.json({ error: "id de extra requerido" }, { status: 400 });

      const [target] = await db.select().from(productExtras).where(eq(productExtras.id, Number(id)));
      if (!target) return NextResponse.json({ error: "Extra no encontrado" }, { status: 404 });
      if (!owned(target.restaurantId)) {
        return NextResponse.json({ error: "No tienes permiso para editar este extra" }, { status: 403 });
      }

      const patch: Partial<typeof productExtras.$inferInsert> = {};
      if (name !== undefined) patch.name = String(name).trim();
      if (price !== undefined) patch.price = Number(price);
      if (available !== undefined) patch.available = !!available;
      if (productId !== undefined) patch.productId = productId ? Number(productId) : null;

      const [updated] = await db
        .update(productExtras)
        .set(patch)
        .where(eq(productExtras.id, Number(id)))
        .returning();

      if (!updated) return NextResponse.json({ error: "Extra no encontrado" }, { status: 404 });
      return NextResponse.json({ ok: true, extra: updated });
    }

    /* ── ELIMINAR EXTRA ── */
    if (body.action === "delete_extra") {
      const { id } = body;
      if (!id) return NextResponse.json({ error: "id de extra requerido" }, { status: 400 });

      const [target] = await db.select().from(productExtras).where(eq(productExtras.id, Number(id)));
      if (!target) return NextResponse.json({ error: "Extra no encontrado" }, { status: 404 });
      if (!owned(target.restaurantId)) {
        return NextResponse.json({ error: "No tienes permiso para eliminar este extra" }, { status: 403 });
      }

      await db.delete(productExtras).where(eq(productExtras.id, Number(id)));
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (err: unknown) {
    console.error("Error en POST /api/partner:", err);
    return NextResponse.json({ error: "Error interno al procesar solicitud" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const partner = await currentPartner();
    if (!partner) {
      return NextResponse.json({ error: "Sesión de socio requerida" }, { status: 401 });
    }
    const body = await req.json();

    /* ── Abrir/cerrar tienda ── */
    if (body.action === "store") {
      const [store] = await db.select().from(restaurants).where(eq(restaurants.slug, String(body.slug)));
      if (!store) return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 });
      if (!partnerOwns(partner, store.id)) {
        return NextResponse.json({ error: "No tienes permiso sobre esta tienda" }, { status: 403 });
      }
      const [row] = await db
        .update(restaurants)
        .set({ isOpen: !!body.isOpen })
        .where(eq(restaurants.id, store.id))
        .returning();
      return NextResponse.json({ ok: true, store: row });
    }

    /* ── Disponibilidad de platillo ── */
    if (body.action === "product") {
      const [target] = await db.select().from(products).where(eq(products.id, Number(body.productId)));
      if (!target) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
      if (!partnerOwns(partner, target.restaurantId)) {
        return NextResponse.json({ error: "No tienes permiso sobre este platillo" }, { status: 403 });
      }
      const [row] = await db
        .update(products)
        .set({ available: !!body.available })
        .where(eq(products.id, Number(body.productId)))
        .returning();
      return NextResponse.json({ ok: true, product: row });
    }

    /* ── Disponibilidad de extra ── */
    if (body.action === "extra") {
      const [target] = await db.select().from(productExtras).where(eq(productExtras.id, Number(body.extraId)));
      if (!target) return NextResponse.json({ error: "Extra no encontrado" }, { status: 404 });
      if (!partnerOwns(partner, target.restaurantId)) {
        return NextResponse.json({ error: "No tienes permiso sobre este extra" }, { status: 403 });
      }
      const [row] = await db
        .update(productExtras)
        .set({ available: !!body.available })
        .where(eq(productExtras.id, Number(body.extraId)))
        .returning();
      return NextResponse.json({ ok: true, extra: row });
    }

    return NextResponse.json({ error: "acción inválida" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
