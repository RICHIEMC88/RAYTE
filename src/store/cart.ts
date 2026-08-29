"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartRestaurant = {
  id: number;
  name: string;
  slug: string;
  deliveryFee: number;
  timeMin: number;
  timeMax: number;
};

export type CartItemCustomization = {
  sizeName?: string;
  selectedExtras?: { name: string; delta: number }[];
  cutPortions?: Record<string, number>;
  extraCuts?: Record<string, number>;
  meatTerm?: string;
  selectedSide?: string;
};

export type CartItem = {
  key: string;
  productId: number;
  name: string;
  price: number;
  basePrice: number;
  image: string | null;
  qty: number;
  notes?: string;
  options?: string;
  customization?: CartItemCustomization;
};

type CartState = {
  items: CartItem[];
  restaurant: CartRestaurant | null;
  drawerOpen: boolean;
  address: string;
  customerName: string;
  phone: string;
  schedulePref: string | null;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (item: CartItem, restaurant: CartRestaurant) => void;
  replaceItem: (prevKey: string, item: CartItem, restaurant: CartRestaurant) => void;
  increment: (key: string) => void;
  decrement: (key: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  setAddress: (address: string) => void;
  setCustomer: (name: string, phone: string) => void;
  setSchedulePref: (iso: string | null) => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      restaurant: null,
      drawerOpen: false,
      address: "Blvd. Aeropuerto 125, Col. Centro, León, GTO",
      customerName: "",
      phone: "",
      schedulePref: null,
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
      addItem: (item, restaurant) => {
        const { items, restaurant: current } = get();
        const base = current && current.id !== restaurant.id ? [] : items;
        const existing = base.find((i) => i.key === item.key);
        if (existing) {
          set({
            items: base.map((i) => (i.key === item.key ? { ...i, qty: i.qty + item.qty } : i)),
            restaurant,
            drawerOpen: true,
          });
        } else {
          set({ items: [...base, item], restaurant, drawerOpen: true });
        }
      },
      replaceItem: (prevKey, item, restaurant) => {
        const { items, restaurant: current } = get();
        const base = current && current.id !== restaurant.id ? [] : items;
        const prevIndex = base.findIndex((entry) => entry.key === prevKey);
        const filtered = base.filter((entry) => entry.key !== prevKey);
        const sameTarget = filtered.find((entry) => entry.key === item.key);

        if (sameTarget) {
          set({
            items: filtered.map((entry) =>
              entry.key === item.key ? { ...entry, qty: entry.qty + item.qty } : entry,
            ),
            restaurant,
            drawerOpen: true,
          });
          return;
        }

        const nextItems = [...filtered];
        if (prevIndex >= 0 && prevIndex <= nextItems.length) {
          nextItems.splice(prevIndex, 0, item);
        } else {
          nextItems.push(item);
        }

        set({ items: nextItems, restaurant, drawerOpen: true });
      },
      increment: (key) =>
        set((s) => ({ items: s.items.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i)) })),
      decrement: (key) =>
        set((s) => ({
          items: s.items
            .map((i) => (i.key === key ? { ...i, qty: i.qty - 1 } : i))
            .filter((i) => i.qty > 0),
        })),
      removeItem: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      clear: () => set({ items: [], restaurant: null, drawerOpen: false }),
      setAddress: (address) => set({ address }),
      setCustomer: (customerName, phone) => set({ customerName, phone }),
      setSchedulePref: (iso) => set({ schedulePref: iso }),
    }),
    { name: "zappy-cart" },
  ),
);

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((acc, i) => acc + i.price * i.qty, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((acc, i) => acc + i.qty, 0);
}
