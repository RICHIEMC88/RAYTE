"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, X, Star, Clock3, Bike, Store, Sparkles, ChevronRight, Dices, MapPin, Heart } from "lucide-react";
import type { Category, Restaurant, Service } from "@/db/schema";
import { formatMXN } from "@/lib/utils";
import { useFavorites } from "@/store/favorites";
import BackButton from "@/components/back-button";
import CategoryPhotoCarousel from "@/components/category-photo-carousel";
import CrossSell, { type CrossSellItem } from "@/components/cross-sell";

type Prod = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string | null;
  section: string;
  restaurantId: number;
  restaurantSlug: string;
  restaurantName: string;
};

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export default function SearchClient({
  categories,
  stores,
  products,
  services,
  initialCat,
  initialDestacadas = false,
  initialFav = false,
  initialFree = false,
  initialOpen = false,
  initialPickup = false,
  initialDelivery = false,
  initialSort = "none",
  initialQuery = "",
  crossItems = [],
  crossTitle,
}: {
  categories: Category[];
  stores: Restaurant[];
  products: Prod[];
  services: Service[];
  initialCat: string | null;
  initialDestacadas?: boolean;
  initialFav?: boolean;
  initialFree?: boolean;
  initialOpen?: boolean;
  initialPickup?: boolean;
  initialDelivery?: boolean;
  initialSort?: "none" | "fast" | "near";
  initialQuery?: string;
  crossItems?: CrossSellItem[];
  crossTitle?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [cat, setCat] = useState<string | null>(initialCat);
  const [sort, setSort] = useState<"none" | "fast" | "near">(initialSort);
  const [freeShip, setFreeShip] = useState(initialFree);
  const [openOnly, setOpenOnly] = useState(initialOpen);
  const [pickupOnly, setPickupOnly] = useState(initialPickup);
  const [deliveryOnly, setDeliveryOnly] = useState(initialDelivery);
  const [favOnly, setFavOnly] = useState(initialFav);
  const [destacadasOnly, setDestacadasOnly] = useState(initialDestacadas);

  const isFavorite = useFavorites((s) => s.isFavorite);
  const toggleFavorite = useFavorites((s) => s.toggleFavorite);

  const q = norm(query.trim());

  const foodCategories = useMemo(() => {
    return categories
      .filter((c) => c.slug !== "restaurantes" && c.slug !== "mascotas")
      .map((c) => (c.slug === "farmacia" ? { ...c, name: "Farmacias" } : c));
  }, [categories]);

  const results = useMemo(() => {
    const inCat = (r: Restaurant) => {
      if (!cat) return true;
      if (r.categorySlug === cat) return true;
      if (cat === "farmacia" && (r.categorySlug === "farmacia" || r.tags.includes("farmacia"))) return true;
      if (r.tags.some((t) => norm(t).includes(norm(cat)) || norm(cat).includes(norm(t)))) return true;
      if (cat === "pan-dulce" && (r.categorySlug === "panaderias" || r.tags.includes("pan-dulce"))) return true;
      if (cat === "helados" && (r.categorySlug === "postres" || r.tags.includes("helados"))) return true;
      if (cat === "cafe" && (r.tags.includes("cafe") || r.categorySlug === "panaderias" || r.slug === "donas-coffee")) return true;
      if (cat === "alitas" && (r.tags.includes("alitas") || r.tags.includes("pollo") || r.slug === "pollo-crack")) return true;
      if (cat === "hamburguesas" && (r.tags.includes("hamburguesas") || r.tags.includes("smash") || r.slug === "la-brasa-smash")) return true;
      if (cat === "pizza" && (r.tags.includes("pizza") || r.tags.includes("italiana") || r.slug === "pizza-nonna")) return true;
      if (cat === "tacos" && (r.tags.includes("tacos") || r.tags.includes("mexicana") || r.slug === "tacos-el-farol")) return true;
      if (cat === "sushi" && (r.tags.includes("sushi") || r.tags.includes("japonesa") || r.slug === "sushi-neko")) return true;
      if (cat === "bowls" && (r.tags.includes("bowls") || r.categorySlug === "saludable" || r.slug === "green-bowl")) return true;
      return false;
    };

    let rStores = stores.filter((r) => inCat(r) && (!q || norm(`${r.name} ${r.description} ${r.tags.join(" ")} ${r.categorySlug}`).includes(q)));
    if (favOnly) rStores = rStores.filter((r) => isFavorite(r.slug));
    if (destacadasOnly) rStores = rStores.filter((r) => r.featured || r.rating >= 4.7);
    if (freeShip) rStores = rStores.filter((r) => r.deliveryFee === 0);
    if (openOnly) rStores = rStores.filter((r) => r.isOpen);
    if (pickupOnly) rStores = rStores.filter((r) => r.allowsPickup);
    if (deliveryOnly) rStores = rStores.filter((r) => r.deliveryFee >= 0);
    if (sort === "fast") rStores = [...rStores].sort((a, b) => a.timeMin - b.timeMin);
    if (sort === "near") rStores = [...rStores].sort((a, b) => a.distanceKm - b.distanceKm);
    const rProducts = products.filter((p) => q && (norm(p.name).includes(q) || norm(p.restaurantName).includes(q))).slice(0, 8);
    return { rStores, rProducts };
  }, [stores, products, q, cat, sort, freeShip, openOnly, pickupOnly, deliveryOnly, favOnly, destacadasOnly, isFavorite]);

  const activeCat = foodCategories.find((c) => c.slug === cat);

  const headingTitle = useMemo(() => {
    if (query) return `Resultados para “${query.trim()}”`;
    if (favOnly) return "❤️ Tus Favoritos";
    if (destacadasOnly) return "🌟 Destacadas para ti";
    if (openOnly) return "🟢 Tiendas Abiertas Ahora";
    if (freeShip) return "🚴 Tiendas con Envío Gratis";
    if (pickupOnly) return "🏪 Tiendas para Recoger";
    if (cat === "farmacia") return "💊 Farmacias";
    if (activeCat) return activeCat.name;
    if (cat === "hamburguesas") return "🍔 Hamburguesas & Smashes";
    if (cat === "pizza") return "🍕 Pizza Artesanal";
    if (cat === "tacos") return "🌮 Tacos & Mexicana";
    if (cat === "sushi") return "🍣 Sushi & Japonesa";
    if (cat === "alitas") return "🍗 Alitas & Pollo";
    if (cat === "pan-dulce") return "🥐 Pan Dulce & Panadería";
    if (cat === "cafe") return "☕ Café & Especialidad";
    if (cat === "bowls") return "🥗 Bowls & Saludable";
    if (cat === "helados") return "🍨 Helados & Postres";
    return "Explora todo";
  }, [query, favOnly, destacadasOnly, openOnly, freeShip, pickupOnly, activeCat, cat]);

  return (
    <div className="min-h-screen bg-white pb-28">
      {/* 1. Buscador arriba */}
      <div className="sticky top-0 z-40 bg-white shadow-[0_2px_14px_rgba(0,0,0,0.05)]">
        <div className="mx-auto max-w-5xl px-4 py-2.5 sm:py-3">
          <div className="flex items-center gap-2.5">
            <BackButton />
            <div className="relative flex-1">
              <Search className="absolute top-3 left-4 h-4.5 w-4.5 text-ink-soft" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar platillos, restaurantes, panaderías..."
                autoFocus
                className="w-full rounded-2xl border border-black/10 bg-mist py-2.5 pr-11 pl-11 text-[14.5px] font-bold outline-none placeholder:text-ink-soft focus:border-brand"
              />
              {query && (
                <button onClick={() => setQuery("")} aria-label="Limpiar" className="absolute top-2.5 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-black/10">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pt-3">
        {/* 2. Sorpréndeme */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => window.dispatchEvent(new CustomEvent("zappy-surprise"))}
          className="mb-3 flex w-full items-center justify-between rounded-full bg-gradient-to-r from-brand to-[var(--brand-accent)] px-5 py-3.5 text-left text-white shadow-[0_10px_26px_var(--brand-glow)]"
        >
          <span className="flex items-center gap-2.5 text-[15.5px] font-black">
            <Dices className="h-5 w-5" /> Sorpréndeme
          </span>
          <span className="flex items-center gap-1 text-[12px] font-bold text-white/85">5 platillos al azar <ChevronRight className="h-4 w-4" /></span>
        </motion.button>

        {/* 3. Los círculos con las categorías de comida + tipos de comida (sin médicos ni citas) */}
        <CategoryPhotoCarousel
          categories={foodCategories}
          value={cat}
          includeFoodTypes={true}
          onSelect={(slug) => setCat(slug)}
        />

        {/* 4. Filtros abajo de los círculos */}
        <div className="no-scrollbar -mx-4 mt-2.5 flex gap-2 overflow-x-auto px-4 pb-1">
          <Chip
            small
            active={favOnly}
            onClick={() => {
              setFavOnly(!favOnly);
              if (!favOnly) setDestacadasOnly(false);
            }}
            label="Favoritos"
            icon={Heart}
            badgeColor="text-brand"
          />
          <Chip
            small
            active={destacadasOnly}
            onClick={() => {
              setDestacadasOnly(!destacadasOnly);
              if (!destacadasOnly) setFavOnly(false);
            }}
            label="🌟 Destacadas"
          />
          <Chip small active={sort === "fast"} onClick={() => setSort(sort === "fast" ? "none" : "fast")} label="⚡ Rápido" />
          <Chip small active={sort === "near"} onClick={() => setSort(sort === "near" ? "none" : "near")} label="📍 Cerca de mí" />
          <Chip small active={freeShip} onClick={() => setFreeShip(!freeShip)} label="🚴 Envío gratis" />
          <Chip small active={openOnly} onClick={() => setOpenOnly(!openOnly)} label="🟢 Abiertos" />
          <Chip small active={pickupOnly} onClick={() => setPickupOnly(!pickupOnly)} label="🏪 Recoger" />
          <Chip small active={deliveryOnly} onClick={() => setDeliveryOnly(!deliveryOnly)} label="🛵 A domicilio" />
        </div>

        {/* 5. Resultados de tiendas */}
        <div className="mt-4 flex items-end justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">{headingTitle}</h1>
              {(activeCat || cat || favOnly || destacadasOnly || freeShip || openOnly || pickupOnly || deliveryOnly) && (
                <button
                  onClick={() => {
                    setCat(null);
                    setFavOnly(false);
                    setDestacadasOnly(false);
                    setFreeShip(false);
                    setOpenOnly(false);
                    setPickupOnly(false);
                    setDeliveryOnly(false);
                  }}
                  className="rounded-full bg-mist px-3 py-1.5 text-[11.5px] font-black text-ink-soft transition hover:bg-black/[0.08]"
                >
                  ✕ Ver todo
                </button>
              )}
            </div>
            <p className="mt-0.5 text-[12.5px] text-ink-soft">
              {results.rStores.length} {results.rStores.length === 1 ? "resultado" : "resultados"}{q ? ` · ${results.rProducts.length} productos` : ""}
            </p>
          </div>
        </div>

        {results.rProducts.length > 0 && (
          <section className="mt-6">
            <h2 className="flex items-center gap-2 text-lg font-black"><Sparkles className="h-5 w-5 text-brand" /> Productos</h2>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {results.rProducts.map((p) => (
                <Link key={p.id} href={`/restaurante/${p.restaurantSlug}`} className="group flex min-w-0 items-start gap-3 overflow-hidden rounded-2xl border p-3 transition hover:border-brand">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                    {p.image && <Image src={p.image} alt={p.name} fill className="object-cover" sizes="56px" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[13.5px] leading-tight font-extrabold text-ink">{p.name}</p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="min-w-0 truncate text-[11.5px] font-bold text-ink-soft">{p.restaurantName}</p>
                      <span className="shrink-0 text-[12px] font-black text-brand">{formatMXN(p.price)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-6">
          <h2 className="flex items-center gap-2 text-lg font-black"><Store className="h-5 w-5 text-brand" /> Resultados</h2>
          {results.rStores.length === 0 ? (
            <Empty favOnly={favOnly} onClearFav={() => setFavOnly(false)} />
          ) : (
            <div className="mt-3 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.rStores.map((r, i) => {
                const fav = isFavorite(r.slug);
                return (
                  <Fragment key={r.id}>
                    {i === 4 && crossItems.length > 0 && (
                      <div className="sm:col-span-2 lg:col-span-3 min-w-0 w-full">
                        <CrossSell items={crossItems} title={crossTitle} />
                      </div>
                    )}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }}>
                      <Link href={`/restaurante/${r.slug}`} className="group block">
                        <div className="relative h-36 overflow-hidden rounded-[22px]">
                          <Image src={r.image} alt={r.name} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.07]" sizes="33vw" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                          <div className="absolute top-2 right-2 flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleFavorite(r.slug);
                              }}
                              aria-label={fav ? "Quitar de favoritos" : "Guardar en favoritos"}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur transition active:scale-90"
                            >
                              <Heart className={`h-4 w-4 ${fav ? "fill-brand text-brand" : "text-ink-soft hover:text-brand"}`} />
                            </button>
                            {!r.isOpen && <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black">Cerrado</span>}
                          </div>
                          <div className="absolute inset-x-3 bottom-2.5">
                            <p className="truncate text-[16px] font-black text-white drop-shadow">{r.name}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-1.5 text-[11.5px] font-bold text-ink-soft">
                          <span className="flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 font-black text-brand"><Clock3 className="h-3 w-3" />{r.timeMin}-{r.timeMax} min</span>
                          <span className="flex items-center gap-1"><Bike className="h-3.5 w-3.5" />{r.deliveryFee === 0 ? "Envío gratis" : formatMXN(r.deliveryFee)}</span>
                          <span className="ml-auto flex items-center gap-0.5"><Star className="h-3 w-3 fill-amber-pop text-amber-pop" />{r.rating.toFixed(1)}</span>
                        </div>
                        <p className="mt-0.5 flex items-center gap-1 text-[10.5px] font-bold text-ink-soft">
                          <MapPin className="h-3 w-3 shrink-0 text-brand/70" /> <span className="truncate">{r.address}</span>
                          {r.allowsPickup && <span className="ml-1 shrink-0 rounded-full bg-[#e6f8ee] px-1.5 py-0.5 text-[9.5px] font-black text-[#0ea55b]">Recoger</span>}
                        </p>
                      </Link>
                    </motion.div>
                    {i === results.rStores.length - 1 && results.rStores.length < 5 && crossItems.length > 0 && (
                      <div className="sm:col-span-2 lg:col-span-3 min-w-0 w-full">
                        <CrossSell items={crossItems} title={crossTitle} />
                      </div>
                    )}
                  </Fragment>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Empty({ favOnly, onClearFav }: { favOnly?: boolean; onClearFav?: () => void }) {
  if (favOnly) {
    return (
      <div className="mt-6 flex flex-col items-center rounded-[26px] bg-mist px-6 py-12 text-center">
        <span className="text-4xl">❤️</span>
        <p className="mt-3 text-lg font-black">Sin tiendas favoritas</p>
        <p className="mt-1 max-w-xs text-sm font-bold text-ink-soft">Toca el corazón en cualquier tienda para guardarla aquí.</p>
        {onClearFav && (
          <button onClick={onClearFav} className="mt-4 rounded-full bg-brand px-5 py-2.5 text-xs font-black text-white">Ver todas las tiendas</button>
        )}
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col items-center rounded-[26px] bg-mist px-6 py-12 text-center">
      <span className="text-3xl font-black italic text-brand">Ups...</span>
      <p className="mt-2 max-w-xs text-sm font-bold text-ink-soft">No encontramos nada con ese nombre. Prueba con otra palabra o categoría.</p>
    </div>
  );
}

function Chip({ active, onClick, label, small = false, icon: Icon, badgeColor }: { active: boolean; onClick: () => void; label: string; small?: boolean; icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>; badgeColor?: string }) {
  return (
    <button onClick={onClick} className={`flex shrink-0 items-center gap-1.5 rounded-full font-black transition active:scale-95 ${small ? "px-3 py-1.5 text-[11.5px]" : "px-4 py-1.5 text-[13px]"} ${active ? "bg-ink text-white shadow-md" : "bg-mist text-ink hover:bg-black/[0.07]"}`}>
      {Icon && <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? (badgeColor ? "fill-rose-400 text-rose-400" : "text-white") : (badgeColor ?? "text-brand")}`} strokeWidth={2.4} />}
      {label}
    </button>
  );
}
