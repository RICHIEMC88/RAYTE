import { NextResponse } from "next/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { drivers, orders, restaurants, type DbOrder, type OrderItem } from "@/db/schema";
import { sessionUser } from "@/lib/auth";
import { currentPartner, partnerOwns } from "@/lib/partner-auth";
import { publishOrder } from "@/lib/live";

/* ============================================================
   Pedidos REALES en PostgreSQL.
   Flujo: placed → preparing → ready → on_way → delivered
   · La tienda (panel socio) avanza: placed→preparing→ready
   · El conductor toma pedidos "ready": →on_way→delivered
   · Autopiloto: si nadie gestiona el pedido (manual=false),
     avanza solo con el tiempo para que el demo nunca se atore.
   ============================================================ */

export const STATUSES = ["placed", "preparing", "ready", "on_way", "delivered"] as const;
type Status = (typeof STATUSES)[number];

/* Umbrales del autopiloto (segundos desde el inicio efectivo) */
const AUTO: [Status, number][] = [
  ["preparing", 20],
  ["ready", 60],
  ["on_way", 90],
  ["delivered", 180],
];
/* Si es manual pero lleva demasiado tiempo, el autopiloto rescata el pedido */
const MANUAL_RESCUE_S = 1800;

function startOf(o: DbOrder): number {
  const placed = o.placedAt.getTime();
  const sched = o.scheduledFor?.getTime() ?? 0;
  return Math.max(placed, sched);
}

async function randomDriverId(): Promise<number | null> {
  const list = await db.select().from(drivers).where(eq(drivers.active, true));
  if (!list.length) return null;
  return list[Math.floor(Math.random() * list.length)].id;
}

function stampFor(status: Status, at: Date): Partial<typeof orders.$inferInsert> {
  if (status === "preparing") return { preparingAt: at };
  if (status === "ready") return { readyAt: at };
  if (status === "on_way") return { onWayAt: at };
  if (status === "delivered") return { deliveredAt: at };
  return {};
}

/* Aplica el autopiloto a un pedido y persiste si cambió */
async function autoAdvance(o: DbOrder): Promise<DbOrder> {
  if (o.status === "delivered") return o;
  const now = Date.now();
  const elapsed = (now - startOf(o)) / 1000;
  if (elapsed < 0) return o; // programado a futuro
  if (o.manual && elapsed < MANUAL_RESCUE_S) return o;

  let target: Status = o.status as Status;
  const patch: Record<string, unknown> = {};
  for (const [st, secs] of AUTO) {
    if (elapsed >= secs && STATUSES.indexOf(st) > STATUSES.indexOf(target)) {
      target = st;
      const at = new Date(startOf(o) + secs * 1000);
      Object.assign(patch, stampFor(st, at));
    }
  }
  if (target === (o.status as Status)) return o;
  if ((target === "on_way" || target === "delivered") && !o.driverId) {
    patch.driverId = await randomDriverId();
  }
  patch.status = target;
  const [row] = await db.update(orders).set(patch).where(and(eq(orders.id, o.id), eq(orders.status, o.status))).returning();
  if (row) publishOrder(o.code, { status: row.status, driverId: row.driverId });
  return row ?? o;
}

async function withDriver(o: DbOrder) {
  const driver = o.driverId ? (await db.select().from(drivers).where(eq(drivers.id, o.driverId)))[0] ?? null : null;
  return { ...o, driver };
}

/* ── GET ──
   ?code=RY-1234          → un pedido (con conductor)
   ?phone=...             → pedidos de ese teléfono
   ?mine=1                → pedidos del usuario con sesión
   ?store=slug&active=1   → pedidos de una tienda (panel socio)
   ?driver=id | available → panel del conductor */
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;

  if (sp.get("code")) {
    const [o] = await db.select().from(orders).where(eq(orders.code, sp.get("code")!));
    if (!o) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    return NextResponse.json({ order: await withDriver(await autoAdvance(o)) });
  }

  if (sp.get("store")) {
    // Roles: solo el dueño de la tienda puede ver sus pedidos (panel socio)
    const partner = await currentPartner();
    if (!partner) return NextResponse.json({ error: "Sesión de socio requerida" }, { status: 401 });

    const [store] = await db.select().from(restaurants).where(eq(restaurants.slug, sp.get("store")!));
    if (!store) return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 });
    if (!partnerOwns(partner, store.id)) {
      return NextResponse.json({ error: "No tienes permiso sobre esta tienda" }, { status: 403 });
    }

    let list = await db.select().from(orders).where(eq(orders.restaurantId, store.id)).orderBy(desc(orders.placedAt)).limit(40);
    list = await Promise.all(list.map(autoAdvance));
    return NextResponse.json({ orders: list });
  }

  if (sp.get("available")) {
    let list = await db.select().from(orders).where(inArray(orders.status, ["preparing", "ready"])).orderBy(desc(orders.placedAt)).limit(40);
    list = await Promise.all(list.map(autoAdvance));
    return NextResponse.json({ orders: list.filter((o) => (o.status === "ready" || o.status === "preparing") && !o.driverId) });
  }

  if (sp.get("driver")) {
    const id = Number(sp.get("driver"));
    let list = await db.select().from(orders).where(eq(orders.driverId, id)).orderBy(desc(orders.placedAt)).limit(40);
    list = await Promise.all(list.map(autoAdvance));
    return NextResponse.json({ orders: list });
  }

  if (sp.get("mine")) {
    const user = await sessionUser();
    if (!user) return NextResponse.json({ orders: [] });
    let list = await db.select().from(orders).where(eq(orders.userId, user.id)).orderBy(desc(orders.placedAt)).limit(50);
    list = await Promise.all(list.map(autoAdvance));
    return NextResponse.json({ orders: list });
  }

  if (sp.get("phone")) {
    let list = await db.select().from(orders).where(eq(orders.phone, sp.get("phone")!.trim())).orderBy(desc(orders.placedAt)).limit(50);
    list = await Promise.all(list.map(autoAdvance));
    return NextResponse.json({ orders: list });
  }

  return NextResponse.json({ error: "parámetros: code | phone | mine | store | driver | available" }, { status: 400 });
}

/* ── POST: crear pedido (checkout) ── */
export async function POST(req: Request) {
  try {
    const b = await req.json();
    const items = (b.items ?? []) as OrderItem[];
    if (!items.length) return NextResponse.json({ error: "El pedido no tiene productos." }, { status: 400 });

    const [store] = await db.select().from(restaurants).where(eq(restaurants.id, Number(b.restaurantId)));
    if (!store) return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 });

    const user = await sessionUser();
    const code = `RY-${Math.floor(1000 + Math.random() * 9000)}`;

    const [order] = await db
      .insert(orders)
      .values({
        code,
        userId: user?.id ?? null,
        restaurantId: store.id,
        restaurantName: store.name,
        restaurantSlug: store.slug,
        items,
        subtotal: Number(b.subtotal) || 0,
        deliveryFee: Number(b.deliveryFee) || 0,
        serviceFee: Number(b.serviceFee) || 0,
        tip: Number(b.tip) || 0,
        total: Number(b.total) || 0,
        customerName: String(b.customerName ?? "").trim(),
        phone: String(b.phone ?? "").trim(),
        address: String(b.address ?? "").trim(),
        payment: String(b.payment ?? "Efectivo"),
        etaMin: store.timeMin,
        etaMax: store.timeMax,
        scheduledFor: b.scheduledFor ? new Date(b.scheduledFor) : null,
      })
      .returning();

    return NextResponse.json({ ok: true, order });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

/* ── PATCH ──
   { action: "status", code, status }            → tienda avanza el pedido
   { action: "claim", code, driverId }           → conductor toma un pedido (→ on_way)
   { action: "deliver", code, driverId }         → conductor entrega (→ delivered)
   { action: "rate", code, rating }              → cliente califica */
export async function PATCH(req: Request) {
  try {
    const b = await req.json();
    const code = String(b.code ?? "");
    const id = Number(b.id) || 0;

    let o: DbOrder | undefined;
    if (code) {
      const [found] = await db.select().from(orders).where(eq(orders.code, code));
      o = found;
    } else if (id) {
      const [found] = await db.select().from(orders).where(eq(orders.id, id));
      o = found;
    }

    if (!o) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });

    if (b.action === "rate") {
      const rating = Math.max(1, Math.min(5, Number(b.rating) || 0));
      const [row] = await db.update(orders).set({ rating }).where(eq(orders.id, o.id)).returning();
      return NextResponse.json({ ok: true, order: row });
    }

    if (b.action === "status" || b.status) {
      // Roles: la tienda que avanza este pedido debe ser su dueño
      const partner = await currentPartner();
      if (!partner) return NextResponse.json({ error: "Sesión de socio requerida" }, { status: 401 });
      if (!partnerOwns(partner, o.restaurantId)) {
        return NextResponse.json({ error: "No tienes permiso para gestionar este pedido" }, { status: 403 });
      }

      const next = String(b.status) as Status;
      if (!STATUSES.includes(next)) return NextResponse.json({ error: "estado inválido" }, { status: 400 });
      if (STATUSES.indexOf(next) <= STATUSES.indexOf(o.status as Status)) {
        return NextResponse.json({ ok: true, order: o }); // ya avanzó
      }
      const patch: Record<string, unknown> = { status: next, manual: true, ...stampFor(next, new Date()) };
      if ((next === "on_way" || next === "delivered") && !o.driverId) patch.driverId = await randomDriverId();
      const [row] = await db.update(orders).set(patch).where(eq(orders.id, o.id)).returning();
      if (row) publishOrder(o.code, { status: row.status, driverId: row.driverId });
      return NextResponse.json({ ok: true, order: row });
    }

    if (b.action === "claim") {
      if (o.status === "on_way" || o.status === "delivered") {
        return NextResponse.json({ error: "Otro conductor ya tomó este pedido." }, { status: 409 });
      }
      const patch: Record<string, unknown> = {
        driverId: Number(b.driverId) || null,
        manual: true,
        status: "on_way",
        onWayAt: new Date(),
      };
      if (!o.readyAt) patch.readyAt = new Date();
      if (!o.preparingAt) patch.preparingAt = new Date();
      const [row] = await db.update(orders).set(patch).where(eq(orders.id, o.id)).returning();
      if (row) publishOrder(o.code, { status: row.status, driverId: row.driverId });
      return NextResponse.json({ ok: true, order: row });
    }

    if (b.action === "deliver") {
      const [row] = await db
        .update(orders)
        .set({ status: "delivered", manual: true, deliveredAt: new Date() })
        .where(eq(orders.id, o.id))
        .returning();
      if (row) publishOrder(o.code, { status: row.status, driverId: row.driverId });
      return NextResponse.json({ ok: true, order: row });
    }

    return NextResponse.json({ error: "acción inválida" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
