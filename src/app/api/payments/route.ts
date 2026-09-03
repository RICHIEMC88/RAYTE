import { NextResponse } from "next/server";

/* ============================================================
   PAGOS — Simulación de OpenPay (sin credenciales).
   Reproduce el contrato de la API real de OpenPay:
     POST /v1/{merchant_id}/charges
   (status: completed | in_progress | failed, method: card |
    store | bank_account, operation_type, authorization,
    payment_method.barcode_url / clabe, card.brand, etc.)
   para que luego se pueda conectar al SDK/API real de OpenPay
   sin tocar el cliente.

   POST /api/payments
   body: {
     method: "card" | "store" | "bank_account" | "cash",
     amount, customer: { name, phone, email? },
     card?: { number, holder, expiry, cvc, installments }
   }
   → { charge: { id, status, method, amount, currency, ... } }

   Reglas de la demo (comportamiento OpenPay):
   · Tarjeta: valida número (Luhn), marca (Visa/Mastercard/Amex),
     vencimiento, CVC y cuotas. Aprobada; una tarjeta de prueba
     (termina en 0002) se rechaza como el emisor.
   · store: genera una referencia con código de barras (pago OXXO).
   · bank_account: genera una CLABE para transferencia.
   · cash: pago contra entrega.
   ============================================================ */

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
  if (/^(5[1-5]|2[2-7]|50)/.test(d)) return "mastercard";
  if (/^3[47]/.test(d)) return "amex";
  return "unknown";
}

function mask(l4: string) {
  return `•••• •••• •••• ${l4}`;
}

function makeId(prefix: string) {
  seq += 1;
  // Formato tipo OpenPay: chr + aleatorio
  const rand = Math.random().toString(36).slice(2, 12);
  return `chr${prefix}${rand}${seq}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const method = String(body.method ?? "card");
    const amount = Number(body.amount ?? 0);
    const customer = body.customer ?? {};
    const now = new Date().toISOString();

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
      const nowD = new Date();
      const curY = nowD.getFullYear() % 100;
      const curM = nowD.getMonth() + 1;
      if (yy < curY || (yy === curY && mm < curM)) {
        return NextResponse.json({ error: "La tarjeta está vencida" }, { status: 400 });
      }
      if (cvc.length < 3 || cvc.length > 4) {
        return NextResponse.json({ error: "CVC inválido" }, { status: 400 });
      }

      const b = brand(num);
      const last4 = num.slice(-4);
      const [expM, expY] = expiry.split(/[\/\-]/);

      // Tarjeta de prueba que el emisor rechaza (demo, como OpenPay con tarjetas de test)
      if (last4 === "0002") {
        return NextResponse.json({
          charge: {
            id: makeId("FAIL"),
            amount,
            currency: "MXN",
            status: "failed",
            method: "card",
            operation_type: "in",
            creation_date: now,
            card: {
              card_number: mask(last4),
              holder_name: holder,
              expiration_month: expM,
              expiration_year: expY,
              brand: b,
              installments,
            },
          },
        });
      }

      return NextResponse.json({
        charge: {
          id: makeId("OK"),
          amount,
          currency: "MXN",
          status: "completed",
          status_detail: "card_accepted",
          method: "card",
          operation_type: "in",
          authorization: String(Math.floor(100000 + Math.random() * 899999)),
          creation_date: now,
          card: {
            card_number: mask(last4),
            holder_name: holder,
            expiration_month: expM,
            expiration_year: expY,
            brand: b,
            installments,
            last4,
          },
          customer: {
            name: String(customer.name ?? ""),
            phone: String(customer.phone ?? ""),
          },
          description: body.description ?? "Pago con tarjeta",
        },
      });
    }

    /* ── PAGO EN TIENDA (OXXO) — OpenPay: method "store" ── */
    if (method === "store") {
      const reference = `OX${Math.floor(100000000000 + Math.random() * 899999999999)}`;
      return NextResponse.json({
        charge: {
          id: makeId("ST"),
          amount,
          currency: "MXN",
          status: "in_progress",
          method: "store",
          creation_date: now,
          payment_method: {
            type: "store",
            name: "OXXO Pay",
            reference,
            barcode_url: null, // en real aquí viene la URL del código de barras
          },
          customer: { name: String(customer.name ?? "") },
        },
      });
    }

    /* ── TRANSFERENCIA BANCARIA — OpenPay: method "bank_account" ── */
    if (method === "bank_account") {
      const clabe = `646${String(Date.now()).slice(-8)}${String(Math.floor(100000 + Math.random() * 899999))}`;
      return NextResponse.json({
        charge: {
          id: makeId("BA"),
          amount,
          currency: "MXN",
          status: "in_progress",
          method: "bank_account",
          creation_date: now,
          payment_method: {
            type: "bank_account",
            name: "Transferencia SPEI",
            clabe,
            bank: "OpenPay Demo",
            holder_name: String(customer.name ?? ""),
          },
        },
      });
    }

    /* ── EFECTIVO ── */
    if (method === "cash") {
      return NextResponse.json({
        charge: {
          id: makeId("CS"),
          amount,
          currency: "MXN",
          status: "in_progress",
          method: "cash",
          creation_date: now,
        },
      });
    }

    return NextResponse.json({ error: "Método de pago no válido" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Error interno en el procesamiento de pago" }, { status: 500 });
  }
}
