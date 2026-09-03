/* ============================================================
   RAYTE LIVE — Canal de tiempo real (Server-Sent Events).
   Un bus en memoria del servidor difunde cambios de pedido y la
   posición GPS simulada del repartidor. Los clientes se suscriben
   vía /api/live?code=... y reciben actualizaciones al instante.
   Si el SSE se corta, la interfaz cae al sondeo por si sola.
   ============================================================ */
import { EventEmitter } from "events";

type AnyRecord = Record<string, unknown>;

/* Bus compartido entre todas las rutas del mismo proceso. */
const g = globalThis as unknown as { __rayteLiveBus?: EventEmitter };
export const liveBus: EventEmitter = g.__rayteLiveBus ?? (g.__rayteLiveBus = new EventEmitter());

/* Publica un evento de pedido (estado/posición). */
export function publishOrder(orderCode: string, payload: AnyRecord) {
  liveBus.emit("order", { orderCode, ...payload });
}

/* Progresso del viaje del repartidor (0→1) según el tiempo desde on_way. */
export function tripProgressAt(onWayAt: string | Date | null, step: string, now = Date.now()): number {
  if (step === "delivered") return 1;
  if (step !== "on_way" || !onWayAt) return 0;
  const start = new Date(onWayAt).getTime();
  return Math.max(0.02, Math.min(0.96, (now - start) / 90000));
}

/* Gana una cabecera SSE + cuerpo. */
export function sseInit() {
  return new Response(null, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

export function sseStringify(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}
