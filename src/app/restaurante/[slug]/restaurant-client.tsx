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
  const hasUiFilters = query.trim().length > 0 || popularOnly;

  const clearUiFilters = () => {
    setQuery("");
    setPopularOnly(false);
  };

  const closeSelected = () => {
    setSelected(null);
    if (searchParams.get("producto")) {
      router.replace(`/restaurante/${store.slug}`, { scroll: false });
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f6f6] pb-[calc(env(safe-area-inset-bottom)+12rem)] sm:pb-44">
      <header className="border-b border-black/5 bg-[#fafafa]">
        <div className="relative h-[104px] overflow-hidden sm:h-[124px]">
          <Image src={store.image} alt={store.name} fill priority className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-black/25" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-3.5">
            <Link
              href="/"
              aria-label="Volver"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-md transition hover:bg-black/55 active:scale-90"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </Link>
          </div>
        </div>

        <div className="relative mx-auto -mt-6 max-w-5xl px-4 pb-3">
          <div className="rounded-[24px] border border-black/5 bg-white p-3.5 shadow-[0_14px_34px_rgba(0,0,0,0.06)]">
            <div className="flex items-start gap-3">
              <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[18px] border-2 border-white bg-white shadow-sm sm:h-[72px] sm:w-[72px]">
                <Image src={store.image} alt={store.name} fill className="object-cover" sizes="72px" />
              </span>

              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-[21px] leading-tight font-black tracking-tight text-ink sm:text-[24px]">{store.name}</h1>
                  {store.promo && (
                    <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-black text-brand">
                      <BadgePercent className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{store.promo}</span>
                    </span>
                  )}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12.5px] font-bold text-ink-soft">
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

                <p className="mt-1.5 line-clamp-2 text-[12.5px] font-semibold leading-relaxed text-ink-soft">{store.description}</p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-2xl bg-[#f7f7f7] px-3 py-2">
                <p className="text-[11px] font-black uppercase tracking-wide text-ink-soft">Tiempo</p>
                <p className="mt-0.5 text-[13px] font-black text-ink">{store.timeMin}-{store.timeMax} min</p>
              </div>
              <div className="rounded-2xl bg-[#f7f7f7] px-3 py-2">
                <p className="text-[11px] font-black uppercase tracking-wide text-ink-soft">Envío</p>
                <p className={`mt-0.5 text-[13px] font-black ${store.deliveryFee === 0 ? "text-[#0ea55b]" : "text-ink"}`}>
                  {store.deliveryFee === 0 ? "Gratis" : formatMXN(store.deliveryFee)}
                </p>
              </div>
              <div className="rounded-2xl bg-[#f7f7f7] px-3 py-2">
                <p className="text-[11px] font-black uppercase tracking-wide text-ink-soft">Distancia</p>
                <p className="mt-0.5 text-[13px] font-black text-ink">{store.distanceKm.toFixed(1)} km</p>
              </div>
              <div className="rounded-2xl bg-[#f7f7f7] px-3 py-2">
                <p className="text-[11px] font-black uppercase tracking-wide text-ink-soft">Modalidad</p>
                <p className="mt-0.5 text-[13px] font-black text-ink">{store.allowsPickup ? "Recoger / Domicilio" : "Solo domicilio"}</p>
              </div>
            </div>

            <div className="mt-2.5 flex items-center gap-2 rounded-2xl bg-[#f7f7f7] px-3 py-2 text-[12px] font-bold text-ink">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-brand" />
              <span className="truncate">{store.address}</span>
            </div>
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
        className={`sticky top-0 z-30 border-b border-black/5 bg-white/92 backdrop-blur-xl transition-all duration-300 ${barStuck ? "shadow-[0_12px_28px_rgba(0,0,0,0.08)]" : "shadow-[0_4px_12px_rgba(0,0,0,0.03)]"}`}
      >
        <div className="mx-auto max-w-5xl px-4 py-2.5">
          <div className="flex flex-col gap-2.5">
            <div className="grid grid-cols-[1fr_auto_auto] gap-2">
              <div className="flex min-w-0 items-center gap-2 rounded-[18px] border border-black/6 bg-[#f7f7f7] px-3 py-2.5">
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
                className={`shrink-0 rounded-full px-3 py-2.5 text-[11.5px] font-black transition ${popularOnly ? "bg-brand text-white shadow-[0_8px_18px_var(--brand-glow)]" : "border border-brand/10 bg-brand-soft text-brand"}`}
              >
                🔥 Top
              </button>

              <button
                type="button"
                onClick={() => setScheduleOpen(true)}
                className={`shrink-0 rounded-full px-3 py-2.5 text-[11.5px] font-black transition ${prefLabel ? "bg-[#1d6ae5] text-white shadow-[0_8px_18px_rgba(29,106,229,0.22)]" : "border border-[#1d6ae5]/10 bg-[#edf7ff] text-[#1d6ae5]"}`}
              >
                {prefLabel ? "Hora" : "Programar"}
              </button>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-mist px-2.5 py-1 text-[11px] font-black text-ink-soft">
                  {filteredMenu.length} {filteredMenu.length === 1 ? "resultado" : "resultados"}
                </span>
                {popularOnly && (
                  <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-black text-brand">
                    Solo top
                  </span>
                )}
                {prefLabel && (
                  <span className="rounded-full bg-[#edf7ff] px-2.5 py-1 text-[11px] font-black text-[#1d6ae5]">
                    {prefLabel}
                  </span>
                )}
              </div>

              {hasUiFilters && (
                <button
                  type="button"
                  onClick={clearUiFilters}
                  className="shrink-0 rounded-full border border-black/8 bg-white px-3 py-1.5 text-[11.5px] font-black text-ink-soft transition hover:text-ink"
                >
                  Limpiar
                </button>
              )}
            </div>

            {sections.length > 0 && (
              <div className="no-scrollbar flex gap-2 overflow-x-auto pb-0.5">
                {sections.map(([sec, items]) => {
                  const Icon = sectionIcon(sec);
                  return (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => document.getElementById(`sec-${anchor(sec)}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                      className="flex shrink-0 items-center gap-2 rounded-full border border-black/6 bg-white px-3 py-2 text-left text-[11.5px] font-black text-ink transition hover:border-black/12 hover:bg-[#fafafa] active:scale-[0.98]"
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

      <main className="mx-auto max-w-5xl px-4 pt-4">
        {!query && !popularOnly && popularItems.length > 0 && (
          <section className="mb-5 rounded-[24px] border border-brand/10 bg-white p-3 shadow-[0_8px_22px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="flex items-center gap-2 text-[16.5px] font-black text-ink">
                  <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                    <Flame className="h-4.5 w-4.5" />
                  </span>
                  Lo más pedido
                </h2>
                <p className="mt-0.5 text-[12px] font-bold text-ink-soft">Lo que más pide la gente en {store.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setPopularOnly(true)}
                className="rounded-full bg-brand-soft px-3 py-1.5 text-[11px] font-black text-brand transition hover:bg-brand hover:text-white"
              >
                Solo top
              </button>
            </div>

            <div className="no-scrollbar mt-3 flex gap-2.5 overflow-x-auto pb-1">
              {popularItems.map((product) => (
                <button
                  key={`popular-${product.id}`}
                  type="button"
                  onClick={() => setSelected(product)}
                  className="flex w-[236px] shrink-0 items-center gap-3 rounded-[20px] border border-black/6 bg-[#fcfcfc] px-3 py-2.5 text-left transition hover:border-brand/20 hover:bg-white"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-mist">
                    {product.image && <Image src={product.image} alt={product.name} fill className="object-cover" sizes="56px" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-2 text-[13px] leading-tight font-black text-ink">{product.name}</p>
                      <span className="shrink-0 rounded-full bg-brand-soft px-1.5 py-0.5 text-[10px] font-black text-brand">Top</span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-[11px] font-semibold text-ink-soft">{product.description}</p>
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <span className="text-[13px] font-black text-brand">{formatMXN(product.price)}</span>
                      <AddButton onClick={() => setSelected(product)} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {sections.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-black/10 bg-white px-6 py-10 text-center shadow-[0_8px_20px_rgba(0,0,0,0.03)]">
            <p className="text-[17px] font-black text-ink">No encontramos productos</p>
            <p className="mt-1 text-[12px] font-bold text-ink-soft">Prueba con otro nombre o desactiva el filtro de más pedidos.</p>
          </div>
        ) : (
          sections.map(([section, items]) => {
            const Icon = sectionIcon(section);
            const hasPopularItems = items.some((p) => p.popular);

            return (
              <section key={section} id={`sec-${anchor(section)}`} className="mb-5 scroll-mt-44 sm:scroll-mt-40">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-white text-brand shadow-sm">
                      <Icon className="h-4.5 w-4.5" strokeWidth={2.3} />
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate text-[16.5px] font-black tracking-tight text-ink">{section}</h2>
                      <p className="text-[11px] font-bold text-ink-soft">{items.length} {items.length === 1 ? "opción" : "opciones"}</p>
                    </div>
                  </div>

                  {hasPopularItems && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-[10.5px] font-black text-brand">
                      <Flame className="h-3 w-3" />
                      Top
                    </span>
                  )}
                </div>

                <div className="space-y-2.5">
                  {items.map((product) => (
                    <button
                      id={`product-${product.id}`}
                      key={product.id}
                      type="button"
                      onClick={() => setSelected(product)}
                      className="group flex w-full items-center gap-3 rounded-[22px] border border-black/6 bg-white p-3 text-left shadow-[0_6px_18px_rgba(0,0,0,0.035)] transition hover:border-black/10 hover:shadow-[0_10px_24px_rgba(0,0,0,0.05)]"
                    >
                      <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[18px] bg-mist">
                        {product.image && <Image src={product.image} alt={product.name} fill className="object-cover" sizes="72px" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-[15px] leading-tight font-black text-ink">{product.name}</p>
                            <p className="mt-0.5 line-clamp-2 text-[12px] font-semibold leading-snug text-ink-soft">{product.description}</p>
                          </div>
                          <span className="shrink-0 text-[13px] font-black text-brand">{formatMXN(product.price)}</span>
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="flex min-w-0 flex-wrap gap-1.5">
                            {product.popular && <span className="rounded-full bg-brand-soft px-2 py-1 text-[9.5px] font-black text-brand">Top</span>}
                            <span className="rounded-full bg-[#f7f7f7] px-2 py-1 text-[9.5px] font-black text-ink-soft">Toca para personalizar</span>
                          </div>
                          <AddButton onClick={() => setSelected(product)} />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </main>

      <ItemModal product={selected} store={store} extras={extras} onClose={closeSelected} />
      <SchedulePicker open={scheduleOpen} initialIso={schedulePref} onClose={() => setScheduleOpen(false)} onSave={(iso) => setSchedulePref(iso)} />
    </div>
  );
}
