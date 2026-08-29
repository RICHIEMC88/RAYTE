"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Clock, Star, Bike, Flame, MapPin, CalendarDays, BadgePercent, Search, X } from "lucide-react";
import { formatMXN } from "@/lib/utils";
import { useCart } from "@/store/cart";
import ItemModal from "@/components/item-modal";
import { AddButton } from "@/components/stepper";
import SchedulePicker from "@/components/schedule-picker";
import { sectionIcon } from "@/components/section-icon";
import type { Product, ProductExtra, Restaurant } from "@/db/schema";

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

const anchor = (s: string) => norm(s).replace(/[^a-z0-9]+/g, "-");

export default function RestaurantClient({
  store,
  menu,
  extras = [],
}: {
  store: Restaurant;
  menu: Product[];
  extras?: ProductExtra[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<Product | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [barStuck, setBarStuck] = useState(false);
  const [query, setQuery] = useState("");
  const [popularOnly, setPopularOnly] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelected(null);
    setScheduleOpen(false);
    setQuery("");
    setPopularOnly(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [store.slug]);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const onScroll = () => setBarStuck(bar.getBoundingClientRect().top <= 1);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const raw = searchParams.get("producto");
    const productId = raw ? Number(raw) : NaN;
    if (!Number.isFinite(productId)) return;
    const target = menu.find((item) => item.id === productId);
    if (!target) return;
    setSelected(target);
    requestAnimationFrame(() => {
      document.getElementById(`product-${target.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [menu, searchParams]);

  const schedulePref = useCart((s) => s.schedulePref);
  const setSchedulePref = useCart((s) => s.setSchedulePref);

  const prefLabel = useMemo(() => {
    if (!schedulePref) return null;
    const d = new Date(schedulePref);
    if (Number.isNaN(d.getTime()) || d.getTime() <= Date.now()) return null;
    return new Intl.DateTimeFormat("es-MX", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    }).format(d);
  }, [schedulePref]);

  const filteredMenu = useMemo(() => {
    const q = norm(query);
    return menu.filter((item) => {
      const matchesQuery = !q || norm(`${item.name} ${item.description} ${item.section}`).includes(q);
      const matchesPopular = !popularOnly || item.popular;
      return matchesQuery && matchesPopular;
    });
  }, [menu, query, popularOnly]);

  const sections = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of filteredMenu) {
      const arr = map.get(p.section) ?? [];
      arr.push(p);
      map.set(p.section, arr);
    }
    return [...map.entries()];
  }, [filteredMenu]);

  const popularItems = useMemo(() => filteredMenu.filter((item) => item.popular).slice(0, 6), [filteredMenu]);

  const closeSelected = () => {
    setSelected(null);
    if (searchParams.get("producto")) {
      router.replace(`/restaurante/${store.slug}`, { scroll: false });
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] pb-[calc(env(safe-area-inset-bottom)+12rem)] sm:pb-44">
      <header className="border-b border-black/5 bg-white">
        <div className="relative h-[88px] overflow-hidden sm:h-[104px]">
          <Image src={store.image} alt={store.name} fill priority className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-black/30" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-3.5">
            <Link
              href="/"
              aria-label="Volver"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-md transition hover:bg-black/55 active:scale-90"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </Link>
            {store.promo && (
              <span className="flex max-w-[72%] items-center gap-1 rounded-full bg-gradient-to-r from-brand to-[var(--brand-accent)] px-2.5 py-1 text-[10px] font-black text-white shadow-lg">
                <BadgePercent className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{store.promo}</span>
              </span>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 pb-3 pt-2">
          <div className="flex items-start gap-2.5">
            <span className="relative -mt-6 h-14 w-14 shrink-0 overflow-hidden rounded-[18px] border-[3px] border-white bg-white shadow-md sm:h-16 sm:w-16">
              <Image src={store.image} alt={store.name} fill className="object-cover" sizes="64px" />
            </span>

            <div className="min-w-0 flex-1 pt-0.5">
              <h1 className="truncate text-[19px] leading-tight font-black tracking-tight text-ink sm:text-[22px]">{store.name}</h1>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] font-bold text-ink-soft">
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-pop text-amber-pop" />
                  {store.rating.toFixed(1)}
                  <span className="text-ink-soft/70">({store.ratingCount.toLocaleString("es-MX")})</span>
                </span>
                <span className={`flex items-center gap-1 ${store.isOpen ? "text-[#0ea55b]" : "text-brand"}`}>
                  <span className={`h-2 w-2 rounded-full ${store.isOpen ? "bg-[#0ea55b]" : "bg-brand"}`} />
                  {store.isOpen ? "Abierto" : "Cerrado"}
                </span>
              </div>
              <p className="mt-1 line-clamp-1 text-[11px] font-semibold text-ink-soft">{store.description}</p>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-[10.5px] font-black text-brand">
              <Clock className="h-3 w-3" />
              {store.timeMin}-{store.timeMax} min
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-black ${store.deliveryFee === 0 ? "bg-[#e6f8ee] text-[#0ea55b]" : "bg-mist text-ink"}`}>
              <Bike className="h-3 w-3" />
              {store.deliveryFee === 0 ? "Gratis" : formatMXN(store.deliveryFee)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-mist px-2.5 py-1 text-[10.5px] font-black text-ink">
              <MapPin className="h-3 w-3 text-ink-soft" />
              {store.distanceKm.toFixed(1)} km
            </span>
            {store.allowsPickup && <span className="inline-flex rounded-full bg-[#e6f8ee] px-2.5 py-1 text-[10.5px] font-black text-[#0ea55b]">Recoger</span>}
            <span className="inline-flex rounded-full bg-mist px-2.5 py-1 text-[10.5px] font-black text-ink">Domicilio</span>
          </div>

          <div className="mt-2 flex items-center gap-2 rounded-2xl bg-[#f6f6f6] px-3 py-2 text-[11px] font-extrabold text-ink">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-brand" />
            <span className="truncate">{store.address}</span>
          </div>
        </div>
      </header>

      {!store.isOpen && (
        <div className="mx-auto mt-2.5 max-w-5xl px-4">
          <p className="rounded-2xl bg-mist px-4 py-2.5 text-center text-[12px] font-black text-ink-soft">
            Cerrado temporalmente — puedes ver el menú, pero no pedir por ahora.
          </p>
        </div>
      )}

      <div
        ref={barRef}
        className={`sticky top-0 z-30 border-b border-black/5 bg-white/96 backdrop-blur transition-all duration-300 ${barStuck ? "shadow-[0_10px_20px_rgba(0,0,0,0.08)]" : "shadow-[0_2px_8px_rgba(0,0,0,0.03)]"}`}
      >
        <div className="mx-auto max-w-5xl px-4 py-2.5">
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-[1fr_auto_auto] gap-2">
              <div className="flex min-w-0 items-center gap-2 rounded-2xl bg-mist px-3 py-2.5">
                <Search className="h-4 w-4 shrink-0 text-ink-soft" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Buscar en ${store.name}`}
                  className="w-full bg-transparent text-[12.5px] font-bold text-ink outline-none placeholder:text-ink-soft/80"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Limpiar búsqueda"
                    className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-full bg-white text-ink-soft shadow-sm transition hover:text-brand"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setPopularOnly((v) => !v)}
                className={`shrink-0 rounded-2xl px-3 py-2.5 text-[10.5px] font-black transition ${popularOnly ? "bg-brand text-white shadow-[0_8px_18px_var(--brand-glow)]" : "bg-brand-soft text-brand"}`}
              >
                🔥 Top
              </button>

              <button
                type="button"
                onClick={() => setScheduleOpen(true)}
                className={`shrink-0 rounded-2xl px-3 py-2.5 text-[10.5px] font-black transition ${prefLabel ? "bg-brand text-white shadow-[0_8px_18px_var(--brand-glow)]" : "bg-[#edf7ff] text-[#1d6ae5]"}`}
              >
                {prefLabel ? "Hora" : "Programar"}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-mist px-2.5 py-1 text-[10px] font-black text-ink-soft">
                {filteredMenu.length} {filteredMenu.length === 1 ? "resultado" : "resultados"}
              </span>
              {prefLabel && (
                <span className="rounded-full bg-[#edf7ff] px-2.5 py-1 text-[10px] font-black text-[#1d6ae5]">
                  {prefLabel}
                </span>
              )}
            </div>

            {sections.length > 0 && (
              <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-0.5">
                {sections.map(([sec, items]) => {
                  const Icon = sectionIcon(sec);
                  return (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => document.getElementById(`sec-${anchor(sec)}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                      className="flex shrink-0 items-center gap-2 rounded-2xl bg-[#f6f6f6] px-2.5 py-2 text-left text-[10.5px] font-black text-ink transition hover:bg-black/[0.06] active:scale-[0.98]"
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 text-brand" strokeWidth={2.3} />
                      <span className="truncate">{sec}</span>
                      <span className="shrink-0 text-ink-soft/70">{items.length}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 pt-3">
        {!query && !popularOnly && popularItems.length > 0 && (
          <section className="mb-4 rounded-[20px] border border-brand/10 bg-white p-2.5 shadow-[0_6px_16px_rgba(0,0,0,0.035)]">
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-[14px] font-black text-ink">
                <span className="flex h-7 w-7 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                  <Flame className="h-4 w-4" />
                </span>
                Lo más pedido
              </h2>
              <button
                type="button"
                onClick={() => setPopularOnly(true)}
                className="rounded-full bg-brand-soft px-2.5 py-1 text-[10px] font-black text-brand transition hover:bg-brand hover:text-white"
              >
                Solo top
              </button>
            </div>

            <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
              {popularItems.map((product) => (
                <button
                  key={`popular-${product.id}`}
                  type="button"
                  onClick={() => setSelected(product)}
                  className="flex w-[220px] shrink-0 items-center gap-2 rounded-[18px] border border-brand/10 bg-[#fff8f8] px-2.5 py-2 text-left transition hover:border-brand hover:bg-white"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white">
                    {product.image && <Image src={product.image} alt={product.name} fill className="object-cover" sizes="48px" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-[12px] font-black text-ink">{product.name}</p>
                      <span className="shrink-0 rounded-full bg-white px-1.5 py-0.5 text-[9px] font-black text-brand shadow-sm">🔥</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-black text-brand">{formatMXN(product.price)}</span>
                      <span className="rounded-full bg-brand px-2 py-1 text-[9px] font-black text-white">Ver</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {sections.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-black/10 bg-white px-6 py-10 text-center">
            <p className="text-[17px] font-black text-ink">No encontramos productos</p>
            <p className="mt-1 text-[12px] font-bold text-ink-soft">Prueba con otro nombre o desactiva el filtro de más pedidos.</p>
          </div>
        ) : (
          sections.map(([section, items]) => (
            <section key={section} id={`sec-${anchor(section)}`} className="mb-4 scroll-mt-44 sm:scroll-mt-40">
              <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                <h2 className="text-[15px] font-black tracking-tight text-ink">{section}</h2>
                <span className="rounded-full bg-mist px-2 py-0.5 text-[9.5px] font-black text-ink-soft">{items.length}</span>
                {items.some((p) => p.popular) && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[9.5px] font-black text-brand">
                    <Flame className="h-3 w-3" />
                    Populares
                  </span>
                )}
              </div>

              <div className="overflow-hidden rounded-[18px] border border-black/6 bg-white shadow-[0_6px_16px_rgba(0,0,0,0.035)]">
                {items.map((product, index) => (
                  <div
                    id={`product-${product.id}`}
                    key={product.id}
                    onClick={() => setSelected(product)}
                    className={`flex cursor-pointer gap-2.5 px-2.5 py-2.5 transition hover:bg-[#fafafa] ${index ? "border-t border-black/6" : ""}`}
                  >
                    <div className="relative h-[58px] w-[58px] shrink-0 overflow-hidden rounded-[15px] bg-mist">
                      {product.image && <Image src={product.image} alt={product.name} fill className="object-cover" sizes="58px" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="min-w-0">
                        <p className="truncate text-[13px] leading-tight font-black text-ink">{product.name}</p>
                        <p className="mt-0.5 line-clamp-1 text-[10.5px] font-semibold leading-snug text-ink-soft">{product.description}</p>
                      </div>

                      <div className="mt-1.5 flex items-center justify-between gap-2">
                        <div className="flex min-w-0 flex-wrap gap-1">
                          {product.popular && <span className="rounded-full bg-brand-soft px-1.5 py-0.5 text-[8.5px] font-black text-brand">Top</span>}
                          <span className="rounded-full bg-mist px-1.5 py-0.5 text-[8.5px] font-black text-ink-soft">Personalizable</span>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="text-[11px] font-black text-brand">{formatMXN(product.price)}</span>
                          <AddButton onClick={() => setSelected(product)} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      <ItemModal product={selected} store={store} extras={extras} onClose={() => setSelected(null)} />
      <SchedulePicker open={scheduleOpen} initialIso={schedulePref} onClose={() => setScheduleOpen(false)} onSave={(iso) => setSchedulePref(iso)} />
    </div>
  );
}
