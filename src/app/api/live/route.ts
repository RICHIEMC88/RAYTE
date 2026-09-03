import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { drivers, orders, type DbOrder } from "@/db/schema";
import { sseStringify, tripProgressAt } from "@/lib/live";

export const dynamic = "force-dynamic";

/* Umbrales del autopiloto (segundos desde el inicio efectivo) — igual que la ruta de pedidos */
const AUTO: { status: string; secs: number }[] = [
  { status: "preparing", secs: 20 },
  { status: "ready", secs: 60 },
  { status: "on_way", secs: 90 },
  { status: "delivered", secs: 180 },
];
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

async function autoAdvance(o: DbOrder): Promise<DbOrder> {
  if (o.status === "delivered") return o;
  const now = Date.now();
  const elapsed = (now - startOf(o)) / 1000;
  if (elapsed < 0) return o; // programado
  if (o.manual && elapsed < MANUAL_RESCUE_S) return o;

  let target: string = o.status;
  const patch: Record<string, unknown> = {};
  for (const { status: st, secs } of AUTO) {
    const idx = (s: string) => ["placed", "preparing", "ready", "on_way", "delivered"].indexOf(s);
    if (elapsed >= secs && idx(st) > idx(target)) {
      target = st;
      const at = new Date(startOf(o) + secs * 1000);
      if (st === "preparing") patch.preparingAt = at;
      if (st === "ready") patch.readyAt = at;
      if (st === "on_way") patch.onWayAt = at;
      if (st === "delivered") patch.deliveredAt = at;
    }
  }
  if (target === o.status) return o;
  if ((target === "on_way" || target === "delivered") && !o.driverId) patch.driverId = await randomDriverId();
  patch.status = target;
  const [row] = await db.update(orders).set(patch).where(and(eq(orders.id, o.id), eq(orders.status, o.status))).returning();
  return row ?? o;
}

export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get("code");
  if (!code) return new Response("code requerido", { status: 400 });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        try { controller.enqueue(encoder.encode(sseStringify(event, data))); } catch { /* cerrado */ }
      };

      let lastStatus = "";
      let lastEta: number | null = null;
      let disposed = false;

      const tick = async () => {
        if (disposed) return;
        try {
          const [o] = await db.select().from(orders).where(eq(orders.code, code));
          if (!o) { send("end", { error: "Pedido no encontrado" }); return; }

          const advanced = await autoAdvance(o);

          // 1) Cambio de estado → push
          if (advanced.status !== lastStatus) {
            lastStatus = advanced.status;
            lastEta = advanced.etaMin ?? null;
            send("status", {
              orderCode: advanced.code,
              status: advanced.status,
              restaurantName: advanced.restaurantName,
              driverId: advanced.driverId ?? null,
              etaMin: advanced.etaMin,
              etaMax: advanced.etaMax,
            });
          }

          // 2) GPS del repartidor → push de progreso
          if (advanced.status === "on_way" || advanced.status === "delivered") {
            const progress = tripProgressAt(advanced.onWayAt, advanced.status);
            send("gps", { orderCode: advanced.code, status: advanced.status, progress });
          }

          if (advanced.status === "delivered") {
            send("delivered", { orderCode: advanced.code });
          }
        } catch {
          /* error aislado, seguimos intentando */
        }
      };

      // latido inicial y suscripción al bus del proceso
      await tick();
      const onBus = (payload: { orderCode?: string }) => {
        if (payload?.orderCode === code) tick();
      };
      const bus = (await import("@/lib/live")).liveBus;
      bus.on("order", onBus);

      const interval = setInterval(tick, 1000);
      req.signal.addEventListener("abort", () => {
        disposed = true;
        clearInterval(interval);
        bus.off("order", onBus);
        try { controller.close(); } catch { /* noop */ }
      });
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
