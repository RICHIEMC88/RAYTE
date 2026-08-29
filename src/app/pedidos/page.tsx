"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronRight, ReceiptText } from "lucide-react";
import { useCart } from "@/store/cart";
import { useOrders, orderStep, orderIsScheduled } from "@/store/orders";
import { formatMXN } from "@/lib/utils";
import BackButton from "@/components/back-button";

const STATUS_STYLE = [
  { label: "Confirmado", cls: "bg-mist text-ink-soft" },
  { label: "En preparación", cls: "bg-[#fef4e2] text-[#92600a]" },
  { label: "En camino", cls: "bg-brand-soft text-brand" },
  { label: "Entregado", cls: "bg-[#e6f8ee] text-[#0ea55b]" },
];

const STEP_OF_STATUS: Record<string, number> = { placed: 0, preparing: 1, ready: 1, on_way: 2, delivered: 3 };

type Row = {
  code: string;
  storeName: string;
  image: string | null;
  count: number;
  total: number;
  placedAt: number;
  step: number;
  scheduled: boolean;
};

export default function PedidosPage() {
  const localOrders = useOrders((s) => s.orders);
  const phone = useCart((s) => s.phone);
  const [mounted, setMounted] = useState(false);
  const [apiRows, setApiRows] = useState<Row[] | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    setMounted(true);
    const t = setInterval(() => setTick((n) => n + 1), 5000);
    return () => clearInterval(t);
  }, []);

  /* Pedidos REALES desde la base de datos: primero por sesión, luego por teléfono */
  useEffect(() => {
    if (!mounted) return;
    let stop = false;
    const load = async () => {
      try {
        let res = await fetch("/api/orders?mine=1", { cache: "no-store" });
        let list: Record<string, unknown>[] = res.ok ? (await res.json()).orders : [];
        if (!list.length && phone.trim()) {
          res = await fetch(`/api/orders?phone=${encodeURIComponent(phone.trim())}`, { cache: "no-store" });
          if (res.ok) list = (await res.json()).orders;
        }
        if (stop) return;
        setApiRows(
          list.map((o) => {
            const items = (o.items as { image: string | null; qty: number }[]) ?? [];
            const scheduledFor = o.scheduledFor ? new Date(o.scheduledFor as string).getTime() : 0;
            return {
              code: o.code as string,
              storeName: o.restaurantName as string,
              image: items[0]?.image ?? null,
              count: items.reduce((a, i) => a + i.qty, 0),
              total: o.total as number,
              placedAt: new Date(o.placedAt as string).getTime(),
              step: STEP_OF_STATUS[o.status as string] ?? 0,
              scheduled: scheduledFor > Date.now(),
            };
          }),
        );
      } catch {
        if (!stop) setApiRows(null);
      }
    };
    load();
    const t = setInterval(load, 6000);
    return () => { stop = true; clearInterval(t); };
  }, [mounted, phone]);

  /* Respaldo local para pedidos que no llegaron a la DB */
  const rows: Row[] = useMemo(() => {
    const api = apiRows ?? [];
    const seen = new Set(api.map((r) => r.code));
    const extra: Row[] = localOrders
      .filter((o) => !seen.has(o.code))
      .map((o) => ({
        code: o.code,
        storeName: o.restaurant.name,
        image: o.items[0]?.image ?? null,
        count: o.items.reduce((a, i) => a + i.qty, 0),
        total: o.total,
        placedAt: o.placedAt,
        step: orderStep(o),
        scheduled: orderIsScheduled(o),
      }));
    return [...api, ...extra].sort((a, b) => b.placedAt - a.placedAt);
  }, [apiRows, localOrders]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="mx-auto max-w-lg px-4 pt-8">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <h1 className="text-3xl font-black tracking-tight">Mis pedidos</h1>
            <p className="mt-1 text-ink-soft">Historial y seguimiento en vivo</p>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="mt-10 flex flex-col items-center rounded-[26px] bg-mist px-6 py-14 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm"><ReceiptText className="h-9 w-9 text-brand" strokeWidth={1.8} /></div>
            <p className="mt-4 text-lg font-black">Aún no tienes pedidos</p>
            <p className="mt-1 max-w-xs text-sm font-bold text-ink-soft">Cuando pidas algo, lo verás aquí con su seguimiento en tiempo real.</p>
            <Link href="/" className="mt-4 rounded-full bg-brand px-6 py-3 text-sm font-black text-white">Explorar tiendas</Link>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {rows.map((o) => {
              const st = o.scheduled ? { label: "Programado", cls: "bg-[#fef4e2] text-[#92600a]" } : STATUS_STYLE[o.step];
              return (
                <motion.div key={o.code} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
                  <Link href={`/pedido/${o.code}`} className="flex items-center gap-3 rounded-[22px] border p-4 transition hover:border-brand">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
                      {o.image ? <Image src={o.image} alt={o.storeName} fill className="object-cover" sizes="64px" /> : <div className="flex h-full items-center justify-center bg-brand-soft text-lg">🛍️</div>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-[15px] font-black">{o.storeName}</p>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-black ${st.cls}`}>{st.label}</span>
                      </div>
                      <p className="truncate text-[12.5px] font-bold text-ink-soft">{o.code} · {o.count} productos · {formatMXN(o.total)}</p>
                      <p className="mt-0.5 text-[11.5px] font-bold text-ink-soft">
                        {new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(o.placedAt))}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-ink-soft" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
