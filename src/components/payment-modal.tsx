"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CreditCard, Banknote, Landmark, Loader2, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { formatMXN } from "@/lib/utils";

/* ============================================================
   Modal de pago estilo OpenPay (SIMULADO).
   Reproduce el checkout de OpenPay: tarjeta (validación, cuotas),
   pago en tienda OXXO y transferencia SPEI. Procesa contra
   /api/payments y al aprobar llama a onSuccess para que el
   checkout cree el pedido. Contrato compatible con OpenPay.
   ============================================================ */

export type PaymentMethod = "card" | "store" | "bank_account";

export type PaymentResult = {
  id: string;
  status: "completed" | "in_progress" | "failed";
  method: string;
  amount: number;
  currency?: string;
  authorization?: string;
  card?: {
    card_number?: string;
    brand?: string;
    installments?: number;
    last4?: string;
  };
  payment_method?: {
    type?: string;
    reference?: string;
    clabe?: string;
    name?: string;
  };
};

type Props = {
  open: boolean;
  amount: number;
  customer: { name: string; phone: string };
  initialMethod?: PaymentMethod;
  onClose: () => void;
  onSuccess: (p: PaymentResult) => void;
};

const INSTALLMENTS = [
  { n: 1, label: "1 pago" },
  { n: 3, label: "3 meses" },
  { n: 6, label: "6 meses" },
  { n: 12, label: "12 meses" },
];

/* Marca de OpenPay */
const OPENPAY_BLUE = "#0a4d8c";
const OPENPAY_ORANGE = "#ff8203";

function formatCard(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 19);
  return d.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}
function formatExpiry(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

export default function PaymentModal({ open, amount, customer, initialMethod = "card", onClose, onSuccess }: Props) {
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [step, setStep] = useState<"form" | "processing" | "approved">("form");
  const [result, setResult] = useState<PaymentResult | null>(null);

  const [cardNum, setCardNum] = useState("");
  const [holder, setHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [installments, setInstallments] = useState(1);
  const [error, setError] = useState("");
  const [cardFocus, setCardFocus] = useState<"num" | "cvc">("num");
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (open) {
      setStep("form");
      setMethod(initialMethod);
      setResult(null);
      setCardNum("");
      setHolder(customer.name || "");
      setExpiry("");
      setCvc("");
      setInstallments(1);
      setError("");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, customer.name]);

  useEffect(() => () => timeouts.current.forEach(clearTimeout), []);

  const submit = async () => {
    setError("");
    if (method === "card") {
      if (!cardNum.replace(/\D/g, "")) return setError("Ingresa el número de tarjeta.");
      if (!holder.trim()) return setError("Ingresa el nombre del titular.");
      if (!expiry.trim()) return setError("Ingresa la fecha de vencimiento.");
      if (!cvc.trim()) return setError("Ingresa el código de seguridad (CVC).");
    }

    setStep("processing");
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          amount,
          customer: { name: customer.name, phone: customer.phone },
          card: method === "card"
            ? { number: cardNum, holder, expiry, cvc, installments }
            : undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStep("form");
        return setError(data.error || "No se pudo procesar el pago.");
      }

      const c = data.charge as PaymentResult;
      setResult(c);

      // Simular el tiempo de autorización del emisor
      const t = setTimeout(() => {
        if (c.status === "completed") {
          setStep("approved");
          onSuccess(c);
        } else if (c.status === "failed") {
          setStep("form");
          setError("El banco rechazó la tarjeta. Intenta con otra.");
        } else {
          // store / bank_account = en proceso → se muestra el comprobante
          setStep("approved");
          onSuccess(c);
        }
      }, 1600);
      timeouts.current.push(t);
    } catch {
      setStep("form");
      setError("Error de conexión. Intenta de nuevo.");
    }
  };

  const advance = (next: PaymentMethod) => {
    setMethod(next);
    setError("");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-[2px]" />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed inset-x-0 bottom-0 z-[125] mx-auto flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-[26px] bg-white shadow-[0_-20px_60px_rgba(0,0,0,0.35)] sm:inset-y-6 sm:rounded-[26px]"
          >
            {/* Header estilo OpenPay */}
            <div className="relative shrink-0 px-5 py-4 text-white" style={{ background: `linear-gradient(135deg, ${OPENPAY_BLUE}, #0a3564)` }}>
              <button onClick={onClose} aria-label="Cerrar" className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 transition active:scale-90">
                <X className="h-5 w-5" />
              </button>
              {step !== "approved" && (
                <div className="flex items-center gap-2.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                    <CreditCard className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-[17px] font-black leading-tight flex items-center gap-1.5">OpenPay <span className="text-[11px] font-black tracking-widest uppercase" style={{ color: "#ffb84d" }}>Pay</span></h2>
                    <p className="text-[11.5px] font-bold text-white/85">Pago seguro · Total {formatMXN(amount)}</p>
                  </div>
                </div>
              )}
              {step === "approved" && (
                <div className="flex items-center gap-2.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15"><CheckCircle2 className="h-5 w-5" /></span>
                  <div>
                    <h2 className="text-[17px] font-black leading-tight">¡Pago {result?.status === "completed" ? "aprobado" : "registrado"}!</h2>
                    <p className="text-[11.5px] font-bold text-white/85">OpenPay · {formatMXN(amount)}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
              {step === "form" && (
                <>
                  {/* Selector de método */}
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { id: "card", label: "Tarjeta", icon: CreditCard },
                      { id: "store", label: "OXXO", icon: Banknote },
                      { id: "bank_account", label: "Transferencia", icon: Landmark },
                    ] as const).map((m) => {
                      const Icon = m.icon;
                      return (
                        <button key={m.id} onClick={() => advance(m.id)} className={`flex flex-col items-center gap-1 rounded-2xl border py-3 text-[12px] font-black transition active:scale-95 ${method === m.id ? "text-white" : "border-black/10 text-ink"}`} style={method === m.id ? { backgroundColor: OPENPAY_BLUE, borderColor: OPENPAY_BLUE } : undefined}>
                          <Icon className="h-5 w-5" /> {m.label}
                        </button>
                      );
                    })}
                  </div>

                  {method === "card" && (
                    <>
                      {/* Tarjeta visual */}
                      <div className="mt-4 relative h-[168px] rounded-2xl p-4 text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${OPENPAY_BLUE}, #0a3564)` }}>
                        <div className="flex justify-between">
                          <span className="font-black text-[13px]">OpenPay</span>
                          <span className="text-[10px] font-black opacity-80">VISA · MC · AMEX</span>
                        </div>
                        <p className={`mt-6 font-mono text-[18px] tracking-[0.14em] ${cardFocus === "num" ? "" : "text-white/40"}`}>
                          {cardNum || "•••• •••• •••• ••••"}
                        </p>
                        <div className="mt-5 flex items-end justify-between">
                          <div className="min-w-0">
                            <p className="text-[9px] font-bold uppercase opacity-70">Titular</p>
                            <p className="text-[12px] font-extrabold truncate max-w-[180px]">{holder || "Nombre del titular"}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] font-bold uppercase opacity-70">Vence</p>
                            <p className="text-[12px] font-extrabold">{expiry || "MM/AA"}</p>
                          </div>
                          <div className="text-right ml-2">
                            <p className="text-[9px] font-bold uppercase opacity-70">CVC</p>
                            <p className="text-[12px] font-extrabold">{cardFocus === "cvc" ? (cvc || "•••") : "•••"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Formulario */}
                      <div className="mt-4 space-y-2.5">
                        <input
                          value={cardNum}
                          onChange={(e) => setCardNum(formatCard(e.target.value))}
                          onFocus={() => setCardFocus("num")}
                          placeholder="Número de tarjeta"
                          inputMode="numeric"
                          className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none focus:border-[#0a4d8c]"
                        />
                        <input
                          value={holder}
                          onChange={(e) => setHolder(e.target.value)}
                          placeholder="Nombre del titular"
                          className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none focus:border-[#0a4d8c]"
                        />
                        <div className="grid grid-cols-2 gap-2.5">
                          <input
                            value={expiry}
                            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                            placeholder="MM/AA"
                            inputMode="numeric"
                            className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none focus:border-[#0a4d8c]"
                          />
                          <input
                            value={cvc}
                            onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            onFocus={() => setCardFocus("cvc")}
                            onBlur={() => setCardFocus("num")}
                            placeholder="CVC"
                            inputMode="numeric"
                            className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none focus:border-[#0a4d8c]"
                          />
                        </div>

                        {/* Cuotas */}
                        <div className="rounded-2xl border border-black/10 p-3">
                          <p className="text-[11px] font-black uppercase text-ink-soft">Cuotas</p>
                          <div className="mt-2 grid grid-cols-4 gap-1.5">
                            {INSTALLMENTS.map((o) => (
                              <button key={o.n} onClick={() => setInstallments(o.n)} className={`rounded-xl border py-2 text-[11.5px] font-black transition active:scale-95 ${installments === o.n ? "border-[#0a4d8c] bg-[#0a4d8c]/10 text-[#0a4d8c]" : "border-black/10"}`}>
                                {o.label}
                              </button>
                            ))}
                          </div>
                          {installments > 1 && (
                            <p className="mt-1.5 text-[11px] font-bold text-ink-soft">
                              {installments} pagos de <span className="text-ink">{formatMXN(Math.round(amount / installments))}</span> c/u
                            </p>
                          )}
                        </div>
                        <p className="text-[10.5px] font-semibold text-ink-soft/70">
                          Demo: usa cualquier tarjeta válida (ej. 4111 1111 1111 1111). Una que termine en 0002 se rechaza.
                        </p>
                      </div>
                    </>
                  )}

                  {method === "store" && (
                    <div className="mt-4 rounded-2xl bg-[#fff8e6] border border-[#f5c518]/40 p-4">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-5 w-5" style={{ color: OPENPAY_ORANGE }} />
                        <p className="text-[13.5px] font-black">Paga en tiendas OXXO</p>
                      </div>
                      <p className="mt-1 text-[12px] font-semibold text-ink-soft">Generaremos una referencia para pagar en efectivo en cualquier OXXO. Tu pedido se prepara al confirmar el pago.</p>
                    </div>
                  )}

                  {method === "bank_account" && (
                    <div className="mt-4 rounded-2xl bg-[#eaf6ff] border border-[#0a4d8c]/30 p-4">
                      <div className="flex items-center gap-2">
                        <Landmark className="h-5 w-5" style={{ color: OPENPAY_BLUE }} />
                        <p className="text-[13.5px] font-black">Transferencia SPEI</p>
                      </div>
                      <p className="mt-1 text-[12px] font-semibold text-ink-soft">Generaremos una CLABE para transferir desde tu banco. El pedido se confirma al recibir el dinero.</p>
                    </div>
                  )}

                  {error && <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-center text-[13px] font-black text-red-600">{error}</p>}
                </>
              )}

              {step === "processing" && (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="relative flex h-16 w-16 items-center justify-center">
                    <Loader2 className="h-14 w-14 animate-spin" style={{ color: OPENPAY_BLUE }} />
                    <Zap className="absolute h-5 w-5" style={{ color: OPENPAY_BLUE }} />
                  </div>
                  <p className="mt-5 text-[15px] font-black">Procesando pago seguro…</p>
                  <p className="mt-1 text-[12.5px] font-semibold text-ink-soft">OpenPay está autorizando con tu banco.</p>
                  <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-ink-soft/70">
                    <ShieldCheck className="h-3.5 w-3.5" /> Cifrado de extremo a extremo
                  </div>
                </div>
              )}

              {step === "approved" && result && (
                <div className="py-4">
                  <div className="rounded-2xl bg-[#e7f9ef] border border-[#0ea55b]/30 p-4">
                    <div className="flex items-center gap-2 text-[#0ea55b]">
                      <CheckCircle2 className="h-5 w-5" />
                      <p className="text-[14px] font-black">{result.status === "completed" ? "Pago aprobado" : "Pago registrado"}</p>
                    </div>
                    <div className="mt-3 space-y-1.5 text-[13px] font-bold text-ink-soft">
                      <div className="flex justify-between"><span>Referencia</span><span className="font-mono text-ink">{result.id}</span></div>
                      <div className="flex justify-between"><span>Método</span><span className="text-ink">
                        {result.method === "card"
                          ? `Tarjeta ${result.card?.card_number ?? ""}`
                          : result.method === "store" ? "OXXO" : result.method === "bank_account" ? "Transferencia SPEI" : "Efectivo"}
                      </span></div>
                      {result.method === "card" && result.card?.installments && result.card.installments > 1 && (
                        <div className="flex justify-between"><span>Cuotas</span><span className="text-ink">{result.card.installments} pagos</span></div>
                      )}
                      {result.method === "card" && result.authorization && (
                        <div className="flex justify-between"><span>Autorización</span><span className="font-mono text-ink">{result.authorization}</span></div>
                      )}
                      {result.payment_method?.reference && <div className="flex justify-between"><span>Referencia OXXO</span><span className="font-mono text-ink">{result.payment_method.reference}</span></div>}
                      {result.payment_method?.clabe && <div className="flex justify-between"><span>CLABE</span><span className="font-mono text-ink">{result.payment_method.clabe}</span></div>}
                      <div className="flex justify-between border-t border-black/5 pt-2 text-[14px] font-black text-ink"><span>Total</span><span>{formatMXN(result.amount)}</span></div>
                    </div>
                  </div>
                  <p className="mt-3 text-center text-[12px] font-semibold text-ink-soft">
                    {result.status === "in_progress" ? "Confirma tu pago para que la tienda prepare tu pedido." : "Tu pedido fue enviado a la tienda para prepararlo."}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-black/5 bg-white px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {step === "form" ? (
                <button
                  onClick={submit}
                  className="flex w-full items-center justify-center gap-2 rounded-full py-4 text-[15px] font-black text-white shadow-[0_12px_28px_rgba(10,77,140,0.35)] transition active:scale-[0.98]"
                  style={{ backgroundColor: OPENPAY_BLUE }}
                >
                  Pagar {formatMXN(amount)}
                </button>
              ) : step === "processing" ? (
                <div className="flex w-full items-center justify-center gap-2 rounded-full py-4 text-[15px] font-black text-white opacity-60" style={{ backgroundColor: OPENPAY_BLUE }}>
                  <Loader2 className="h-5 w-5 animate-spin" /> Autorizando…
                </div>
              ) : (
                <button
                  onClick={onClose}
                  className="flex w-full items-center justify-center gap-2 rounded-full py-4 text-[15px] font-black text-white transition hover:brightness-105 active:scale-[0.98]"
                  style={{ backgroundColor: "#0ea55b" }}
                >
                  <CheckCircle2 className="h-5 w-5" /> Listo
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
