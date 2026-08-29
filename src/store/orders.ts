"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, CartRestaurant } from "./cart";

export type Order = {
  code: string;
  items: CartItem[];
  restaurant: CartRestaurant;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  tip: number;
  total: number;
  customerName: string;
  phone: string;
  address: string;
  payment: string;
  placedAt: number;
  etaMin: number;
  etaMax: number;
  scheduledFor?: string;
  refPhoto?: string;
};

type OrdersState = {
  orders: Order[];
  ratings: Record<string, number>;
  addOrder: (order: Order) => void;
  rateOrder: (code: string, rating: number) => void;
};

export const useOrders = create<OrdersState>()(
  persist(
    (set) => ({
      orders: [],
      ratings: {},
      addOrder: (order) => set((s) => ({ orders: [order, ...s.orders] })),
      rateOrder: (code, rating) => set((s) => ({ ratings: { ...s.ratings, [code]: rating } })),
    }),
    { name: "zappy-orders" },
  ),
);

/* Demo: los estados del pedido avanzan solos con el tiempo (segundos) */
export const ORDER_STEPS = [
  { label: "Pedido confirmado", icon: "check" },
  { label: "En preparación", icon: "chef" },
  { label: "En camino a tu domicilio", icon: "bike" },
  { label: "Entregado", icon: "home" },
] as const;

export function orderStep(order: Order, now = Date.now()): number {
  const start = order.scheduledFor
    ? Math.max(order.placedAt, new Date(order.scheduledFor).getTime())
    : order.placedAt;
  const t = (now - start) / 1000;
  if (t >= 95) return 3;
  if (t >= 40) return 2;
  if (t >= 12) return 1;
  return 0;
}

/* ¿El pedido está programado para más tarde? */
export function orderIsScheduled(order: Order, now = Date.now()): boolean {
  return !!order.scheduledFor && now < new Date(order.scheduledFor).getTime();
}
