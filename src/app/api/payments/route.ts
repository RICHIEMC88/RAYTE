import { NextResponse } from "next/server";

/* ============================================================
   PAGOS — Simulación de MercadoPago (sin credenciales).
   Reproduce el mismo contrato de la API real de MercadoPago
   (status, status_detail, id, transaction_amount, payment_method_id…)
   para que luego se pueda cambiar al SDK real sin tocar el cliente.

   POST /api/payments
   body: {
     method: "card" | "oxxo" | "transfer" | "cash",
     amount, items, customer: { name, phone, email? },
     card?: { number, holder, expiry, cvc, installments }
   }
   → { payment: { id, status, status_detail, method, transaction_amount,
                  last4, installments, external_reference, ... } }

   Reglas de la demo (comportamiento MercadoPago clásico):
   · Tarjeta: valida número (Luhn), marca (Visa/Mastercard/Amex), expiración,
     cvc y cuotas. Aprobado por defecto; una tarjeta de prueba se rechaza.
   · OXXO: genera un código de barras de referencia.
   · Transferencia (SPEI): genera una CLABE de referencia.
   · Efectivo: solo se registra como pago contra entrega.
   ============================================================ */

const TEST_CARDS = [
  // MercadoPago usa estas tarjetas de prueba
  "5031 4332 1540 6351", // Mastercard → aprobada
  "5031 4332 1540 6351",
];
// Cualquier tarjeta que termine en 0002 se rechaza (demo de declinado)
const REJECTION_SUFFIX = "0002";

let seq = 0;

function luhnValid(num: string): boolean {
  const digits = num.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0, alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (alt) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function brand(num: string): string {
  const d = num.replace(/\D/g, "");
  if (/^4/.test(d)) return "visa";
  if (/^(5[1-5]|2[2-7]|50)/.test(d)) return "master";
  if (/^3[47]/.test(d)) return "amex";
  return "unknown";
}

function mask(last4: string) {
  return `•••• •••• •••• ${last4}`;
}

function makeId(prefix: string) {
  seq += 1;
  return `MP-${prefix}-${Date.now().toString(36).toUpperCase()}${seq}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const method = String(body.method ?? "card");
    const amount = Number(body.amount ?? 0);
    const customer = body.customer ?? {};

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Monto inválido" }, { status: 400 });
    }

    /* ── TARJETA ── */
    if (method === "card") {
      const card = body.card ?? {};
      const num = String(card.number ?? "").replace(/\D/g, "");
      const holder = String(card.holder ?? "").trim();
      const expiry = String(card.expiry ?? "").trim();
      const cvc = String(card.cvc ?? "").trim();
      const installments = Math.max(1, Math.min(12, Number(card.installments) || 1));

      if (!num || !holder || !expiry || !cvc) {
        return NextResponse.json({ error: "Completa todos los datos de la tarjeta" }, { status: 400 });
      }
      if (!luhnValid(num)) {
        return NextResponse.json({ error: "Número de tarjeta inválido" }, { status: 400 });
      }
      const [mm, yy] = expiry.split(/[\/\-]/).map((s) => Number(s));
      if (!mm || mm < 1 || mm > 12 || !yy) {
        return NextResponse.json({ error: "Fecha de vencimiento inválida" }, { status: 400 });
      }
      const now = new Date();
      const curY = now.getFullYear() % 100;
      const curM = now.getMonth() + 1;
      if (yy < curY || (yy === curY && mm < curM)) {
        return NextResponse.json({ error: "La tarjeta está vencida" }, { status: 400 });
      }
      if (cvc.length < 3 || cvc.length > 4) {
        return NextResponse.json({ error: "CVC inválido" }, { status: 400 });
      }

      const b = brand(num);
      const last4 = num.slice(-4);

      // Demo de rechazo (como los flujos reales con tarjetas de prueba)
      if (last4 === REJECTION_SUFFIX) {
        return NextResponse.json({
          payment: {
            id: makeId("REJ"),
            status: "rejected",
            status_detail: "rejected_by_issuer",
            method: "card",
            transaction_amount: amount,
            last4,
            installments,
            brand: b,
          },
        });
      }

      return NextResponse.json({
        payment: {
          id: makeId("APR"),
          status: "approved",
          status_detail: "accredited",
          method: "card",
          transaction_amount: amount,
          last4,
          installments,
          brand: b,
          card_mask: mask(last4),
          currency: "MXN",
          external_reference: body.external_reference ?? null,
          date_created: new Date().toISOString(),
        },
      });
    }

    /* ── OXXO (efectivo en tienda) ── */
    if (method === "oxxo") {
      const ref = `OX${Math.floor(100000000000 + Math.random() * 899999999999)}`;
      return NextResponse.json({
        payment: {
          id: makeId("OXX"),
          status: "pending",
          status_detail: "waiting_payment",
          method: "oxxo",
          transaction_amount: amount,
          oxxo_ref: ref,
          currency: "MXN",
          date_created: new Date().toISOString(),
        },
      });
    }

    /* ── TRANSFERENCIA (SPEI) ── */
    if (method === "transfer") {
      // CLABE simulada (18 dígitos)
      const clabe = `646${String(Date.now()).slice(-8)}${String(Math.floor(100000 + Math.random() * 899999))}`;
      return NextResponse.json({
        payment: {
          id: makeId("SPE"),
          status: "pending",
          status_detail: "waiting_transfer",
          method: "transfer",
          transaction_amount: amount,
          clabe,
          currency: "MXN",
          date_created: new Date().toISOString(),
        },
      });
    }

    /* ── EFECTIVO ── */
    if (method === "cash") {
      return NextResponse.json({
        payment: {
          id: makeId("CASH"),
          status: "pending",
          status_detail: "at_delivery",
          method: "cash",
          transaction_amount: amount,
          currency: "MXN",
        },
      });
    }

    return NextResponse.json({ error: "Método de pago no válido" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Error interno en el procesamiento de pago" }, { status: 500 });
  }
}
