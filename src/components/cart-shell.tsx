"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, X, Trash2, MapPin, Pill, Zap, Clock3, Store, ChevronRight, Plus } from "lucide-react";
import { useCart, cartSubtotal, cartCount, type CartItem as StoreCartItem } from "@/store/cart";
import type { Product, ProductExtra, Restaurant } from "@/db/schema";
import { formatMXN, serviceFeeFor } from "@/lib/utils";
import { QtyStepper } from "./stepper";
import ItemModal from "./item-modal";

type CartSuggestion = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string | null;
  section: string;
  popular: boolean;
};

type EditingPayload = {
  cartItem: StoreCartItem;
  product: Product;
  store: Restaurant;
  extras: ProductExtra[];
};

function ItemThumb({ image, name }: { image: string | null; name: string }) {
  if (!image) {
    return (
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[18px] bg-brand-soft">
        <Pill className="h-6 w-6 text-brand" />
      </div>
    );
  }

  return (
    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[18px] bg-mist">
      <Image src={image} alt={name} fill className="object-cover" sizes="64px" />
    </div>
  );
}

function OptionBadges({ options }: { options?: string }) {
  if (!options) return null;

  const parts = options.split(" · ").map((part) => part.trim()).filter(Boolean);
  const visible = parts.slice(0, 2);
  const extra = parts.length - visible.length;

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {visible.map((part) => (
        <span key={part} className="rounded-full bg-mist px-2 py-1 text-[10px] font-black text-ink-soft">
          {part}
        </span>
      ))}
      {extra > 0 && <span className="rounded-full bg-mist px-2 py-1 text-[10px] font-black text-ink-soft">+{extra}</span>}
    </div>
  );
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 ${strong ? "text-[15px] font-black text-ink" : "text-[13px] font-bold text-ink-soft"}`}>
      <span>{label}</span>
      <span className="shrink-0 text-ink">{value}</span>
    </div>
  );
}

export default function CartShell() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    items,
    restaurant,
    drawerOpen,
    closeDrawer,
    openDrawer,
    increment,
    decrement,
    removeItem,
    clear,
    address,
    setAddress,
    addItem,
  } = useCart();

  const [mounted, setMounted] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressDraft, setAddressDraft] = useState("");
  const [suggestions, setSuggestions] = useState<CartSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [editingItemKey, setEditingItemKey] = useState<string | null>(null);
  const [editingPayload, setEditingPayload] = useState<EditingPayload | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen || !restaurant) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      return;
    }

    const controller = new AbortController();
    const exclude = Array.from(new Set(items.map((item) => item.productId))).join(",");

    setLoadingSuggestions(true);
    fetch(`/api/cart-suggestions?store=${encodeURIComponent(restaurant.slug)}&exclude=${encodeURIComponent(exclude)}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("No se pudieron cargar sugerencias");
        return res.json();
      })
      .then((data) => {
        setSuggestions(Array.isArray(data?.suggestions) ? data.suggestions : []);
      })
      .catch(() => {
        if (!controller.signal.aborted) setSuggestions([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingSuggestions(false);
      });

    return () => controller.abort();
  }, [drawerOpen, restaurant, items]);

  if (!mounted) return null;

  const subtotal = cartSubtotal(items);
  const count = cartCount(items);
  const fee = serviceFeeFor(subtotal);
  const deliveryFee = restaurant?.deliveryFee ?? 0;
  const total = subtotal + fee + deliveryFee;
  const hideFab =
    pathname === "/checkout" ||
    pathname.startsWith("/pedido/") ||
    pathname === "/buscar" ||
    pathname.startsWith("/servicios") ||
    pathname.startsWith("/viajes") ||
    pathname.startsWith("/profesional");

  const openEditItem = async (item: StoreCartItem) => {
    if (!restaurant || editingItemKey) return;

    try {
      setEditingItemKey(item.key);
      const res = await fetch(
        `/api/cart-item?store=${encodeURIComponent(restaurant.slug)}&productId=${item.productId}`,
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error("No se pudo abrir el editor");
      const data = (await res.json()) as {
        store: Restaurant;
        product: Product;
        extras: ProductExtra[];
      };
      closeDrawer();
      setEditingPayload({ cartItem: item, product: data.product, store: data.store, extras: data.extras ?? [] });
    } catch {
      setEditingPayload(null);
    } finally {
      setEditingItemKey(null);
    }
  };

  return (
    <>
      <AnimatePresence>
        {count > 0 && !drawerOpen && !hideFab && (
          <motion.button
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            onClick={openDrawer}
            className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-40 mx-auto flex max-w-md items-center justify-between rounded-full bg-brand px-4 py-3.5 text-white shadow-[0_18px_40px_var(--brand-glow)] lg:bottom-24 active:scale-[0.98]"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/18">
                <ShoppingBag className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <span className="min-w-0 text-left">
                <span className="block truncate text-[14px] font-black">{count} {count === 1 ? "producto" : "productos"}</span>
                {restaurant && <span className="block truncate text-[11px] font-bold text-white/85">{restaurant.name}</span>}
              </span>
            </span>
            <span className="shrink-0 text-[15px] font-black">{formatMXN(subtotal)}</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
              className="fixed inset-0 z-[80] bg-black/42 backdrop-blur-[2px]"
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
              className="fixed inset-y-0 right-0 z-[85] w-full max-w-md overflow-y-auto overscroll-contain bg-[#f7f6f4] shadow-[0_10px_60px_rgba(0,0,0,0.22)] sm:inset-y-3 sm:right-3 sm:rounded-[32px] sm:border sm:border-black/5"
            >
              <div className="sticky top-0 z-10 border-b border-black/5 bg-white/96 px-4 pb-3 pt-3 backdrop-blur">
                <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-black/10 sm:hidden" />
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ink-soft/65">Pedido actual</p>
                    <h2 className="mt-1 text-[26px] leading-none font-black tracking-tight text-ink">Tu carrito</h2>
                    {restaurant && (
                      <p className="mt-2 flex items-center gap-1.5 text-[13px] font-extrabold text-ink-soft">
                        <Store className="h-4 w-4 text-brand" />
                        <span className="truncate">de {restaurant.name}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {items.length > 0 && (
                      <button
                        onClick={clear}
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-mist text-ink-soft transition hover:text-brand"
                        aria-label="Vaciar carrito"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    )}
                    <button
                      onClick={closeDrawer}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-mist text-ink transition hover:bg-black/10"
                      aria-label="Cerrar"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {restaurant && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-brand-soft px-3 py-1.5 text-[11px] font-black text-brand">
                      {count} {count === 1 ? "artículo" : "artículos"}
                    </span>
                    <span className="rounded-full bg-[#edf7ff] px-3 py-1.5 text-[11px] font-black text-[#1d6ae5]">
                      <Clock3 className="mr-1 inline h-3.5 w-3.5" /> {restaurant.timeMin}-{restaurant.timeMax} min
                    </span>
                  </div>
                )}
              </div>

              {items.length === 0 ? (
                <div className="px-8 py-14 text-center">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-brand-soft">
                    <ShoppingBag className="h-10 w-10 text-brand" strokeWidth={1.8} />
                  </div>
                  <p className="mt-4 text-lg font-black">Tu carrito está vacío</p>
                  <p className="mx-auto mt-1 max-w-xs text-[13px] font-bold text-ink-soft">Agrega algo rico o algo útil para empezar tu pedido.</p>
                  <Link href="/" onClick={closeDrawer} className="mt-4 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-black text-white">
                    Explorar
                  </Link>
                </div>
              ) : (
                <div className="px-4 py-4">
                  <section>
                    <div className="mb-3 px-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-ink-soft/65">Tu pedido</p>
                      <h3 className="mt-1 text-[20px] font-black tracking-tight text-ink">Revisa antes de pagar</h3>
                    </div>

                    <div className="space-y-2.5">
                      <AnimatePresence initial={false}>
                        {items.map((item) => (
                          <motion.div
                            key={item.key}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: 40 }}
                            className="rounded-[22px] border border-black/5 bg-white p-3"
                          >
                            <div className="flex gap-3">
                              <ItemThumb image={item.image} name={item.name} />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="text-[15px] leading-tight font-black text-ink">{item.name}</p>
                                    <OptionBadges options={item.options} />
                                    {item.notes && (
                                      <div className="mt-2 rounded-2xl bg-[#fff4ef] px-3 py-2 text-[11px] font-bold leading-snug text-brand">
                                        Nota: {item.notes}
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => removeItem(item.key)}
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-soft transition hover:bg-mist hover:text-brand"
                                    aria-label="Eliminar"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>

                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => void openEditItem(item)}
                                    disabled={editingItemKey === item.key}
                                    className="rounded-full bg-mist px-3 py-1.5 text-[11px] font-black text-ink transition hover:bg-black/8 disabled:opacity-50"
                                  >
                                    {editingItemKey === item.key ? "Abriendo..." : "Editar extras"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeItem(item.key)}
                                    className="rounded-full bg-[#fff4ef] px-3 py-1.5 text-[11px] font-black text-brand transition hover:bg-[#ffe8dd]"
                                  >
                                    Quitar
                                  </button>
                                </div>

                                <div className="mt-3 flex items-center justify-between gap-3 border-t border-black/5 pt-3">
                                  <QtyStepper small qty={item.qty} onInc={() => increment(item.key)} onDec={() => decrement(item.key)} />
                                  <div className="text-right">
                                    <p className="text-[16px] leading-none font-black text-ink">{formatMXN(item.price * item.qty)}</p>
                                    {item.qty > 1 && <p className="mt-1 text-[10.5px] font-bold text-ink-soft">{formatMXN(item.price)} c/u</p>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </section>

                  {(loadingSuggestions || suggestions.length > 0) && restaurant && (
                    <section className="mt-6">
                      <div className="mb-3 px-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-ink-soft/65">Agrega algo más</p>
                        <h3 className="mt-1 text-[20px] font-black tracking-tight text-ink">Acompaña tu pedido</h3>
                        <p className="mt-1 text-[11.5px] font-bold text-ink-soft">Bebidas, guarniciones y extras del mismo negocio.</p>
                      </div>

                      <div className="space-y-2">
                        {loadingSuggestions
                          ? Array.from({ length: 3 }).map((_, idx) => (
                              <div key={`skeleton-${idx}`} className="rounded-[20px] border border-black/5 bg-white p-3">
                                <div className="flex gap-3">
                                  <div className="h-14 w-14 animate-pulse rounded-[16px] bg-mist" />
                                  <div className="min-w-0 flex-1">
                                    <div className="h-4 w-24 animate-pulse rounded-full bg-mist" />
                                    <div className="mt-2 h-3 w-3/4 animate-pulse rounded-full bg-mist" />
                                    <div className="mt-2 h-3 w-1/2 animate-pulse rounded-full bg-mist" />
                                  </div>
                                </div>
                              </div>
                            ))
                          : suggestions.map((product) => (
                              <div key={`suggestion-${product.id}`} className="flex items-center gap-3 rounded-[20px] border border-black/5 bg-white p-3">
                                <ItemThumb image={product.image} name={product.name} />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-[13px] font-black text-ink">{product.name}</p>
                                  <p className="mt-0.5 line-clamp-1 text-[11px] font-semibold text-ink-soft">{product.description}</p>
                                  <div className="mt-1 flex items-center justify-between gap-2">
                                    <span className="truncate text-[10px] font-black text-ink-soft">{product.section}</span>
                                    <span className="shrink-0 text-[12px] font-black text-brand">{formatMXN(product.price)}</span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    addItem(
                                      {
                                        key: `${product.id}`,
                                        productId: product.id,
                                        name: product.name,
                                        price: product.price,
                                        basePrice: product.price,
                                        image: product.image,
                                        qty: 1,
                                      },
                                      restaurant,
                                    )
                                  }
                                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-white transition hover:bg-brand-dark active:scale-95"
                                  aria-label={`Agregar ${product.name}`}
                                >
                                  <Plus className="h-4 w-4" strokeWidth={3} />
                                </button>
                              </div>
                            ))}
                      </div>
                    </section>
                  )}

                  <section className="mt-6 space-y-3">
                    <div className="rounded-[22px] bg-white p-3">
                      {editingAddress ? (
                        <form
                          className="flex items-center gap-2"
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (addressDraft.trim()) setAddress(addressDraft.trim());
                            setEditingAddress(false);
                          }}
                        >
                          <input
                            autoFocus
                            value={addressDraft}
                            onChange={(e) => setAddressDraft(e.target.value)}
                            placeholder="Nueva dirección de entrega"
                            className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[13px] font-bold outline-none focus:border-brand"
                          />
                          <button type="submit" className="shrink-0 rounded-2xl bg-ink px-4 py-3 text-[13px] font-black text-white">
                            OK
                          </button>
                        </form>
                      ) : (
                        <button
                          onClick={() => {
                            setAddressDraft(address);
                            setEditingAddress(true);
                          }}
                          className="flex w-full items-center gap-3 text-left"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mist text-brand">
                            <MapPin className="h-4.5 w-4.5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-ink-soft/70">Entregar en</span>
                            <span className="mt-0.5 block truncate text-[13px] font-black text-ink">{address}</span>
                          </span>
                          <span className="shrink-0 text-[12px] font-black text-brand">Cambiar</span>
                        </button>
                      )}
                    </div>

                    <div className="rounded-[22px] bg-white p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-ink-soft/65">Resumen</p>
                      <div className="mt-3 space-y-2.5">
                        <SummaryRow label="Subtotal" value={formatMXN(subtotal)} />
                        <SummaryRow label="Envío" value={deliveryFee === 0 ? "Gratis" : formatMXN(deliveryFee)} />
                        <SummaryRow label="Tarifa de servicio" value={formatMXN(fee)} />
                        <div className="border-t border-black/6 pt-3">
                          <SummaryRow label="Total" value={formatMXN(total)} strong />
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          closeDrawer();
                          router.push("/checkout");
                        }}
                        className="mt-4 flex w-full items-center justify-between rounded-full bg-brand px-5 py-4 font-black text-white shadow-[0_14px_34px_var(--brand-glow)] transition hover:bg-brand-dark active:scale-[0.98]"
                      >
                        <span className="flex items-center gap-2 text-[15px]">
                          <Zap className="h-4.5 w-4.5" /> Ir a pagar
                        </span>
                        <span className="flex items-center gap-1 text-[15px]">
                          {formatMXN(total)} <ChevronRight className="h-4 w-4" />
                        </span>
                      </button>
                    </div>
                  </section>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {editingPayload && (
        <ItemModal
          product={editingPayload.product}
          store={editingPayload.store}
          extras={editingPayload.extras}
          editingItem={editingPayload.cartItem}
          onClose={() => {
            setEditingPayload(null);
            openDrawer();
          }}
        />
      )}
    </>
  );
}
