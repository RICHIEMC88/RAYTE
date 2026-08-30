"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Utensils, ShoppingBasket, Zap, Pill, Beer, Salad, IceCreamCone, PawPrint, Star, Clock3, ChevronRight, ChevronLeft, BadgePercent, Bike, CalendarDays, Dices, CarFront, Stethoscope, Heart, Store } from "lucide-react";
import type { Category, Restaurant, Product, Service } from "@/db/schema";
import { formatMXN } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useFavorites } from "@/store/favorites";
import { AddButton } from "./stepper";
import { type SurpriseDish } from "./surprise-modal";
import CrossSell, { type CrossSellItem } from "./cross-sell";
import { categoryIcon } from "./category-icon";




export function CategoryGrid({ categories }: { categories: Category[] }) {
  const restaurantes = categories.find((c) => c.slug === "restaurantes");

  return (
    <section className="mx-auto max-w-5xl px-4 pt-3.5 pb-1">
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {restaurantes && (
          <TopButton
            href={`/buscar`}
            label="Comida"
            bg={restaurantes.bg}
            color={restaurantes.color}
            icon={categoryIcon(restaurantes.icon)}
            delay={0}
          />
        )}
        <TopButton href="/viajes" label="Rayte" bg="#16121b" color="#fbbf24" icon={CarFront} delay={0.06} />
        <TopButton href="/servicios" label="Citas y servicios" bg="#f2ecff" color="#7c3aed" icon={CalendarDays} delay={0.12} />
        <TopButton href="/servicios?cat=salud" label="Salud" bg="#e8f1fe" color="#1d6ae5" icon={Stethoscope} delay={0.18} />
      </div>
    </section>
  );
}

function TopButton({
  href,
  label,
  bg,
  color,
  icon: Icon,
  delay,
}: {
  href: string;
  label: string;
  bg: string;
  color: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  delay: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, type: "spring", stiffness: 300, damping: 24 }}>
      <Link href={href} className="group flex flex-col items-center gap-2">
        <span className="flex h-[64px] w-[64px] items-center justify-center rounded-[20px] transition-transform duration-300 group-hover:scale-105 group-active:scale-95 sm:h-[72px] sm:w-[72px]" style={{ backgroundColor: bg }}>
          <span style={{ color }}><Icon className="h-7 w-7" strokeWidth={2.1} /></span>
        </span>
        <span className="text-center text-[11px] leading-tight font-extrabold text-ink sm:text-[12.5px]">{label}</span>
      </Link>
    </motion.div>
  );
}

type Promo = { title: string; subtitle: string; image: string; href: string; gradient: string; tag: string };

function useEmbeddedMode() {
  const [embedded, setEmbedded] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const queryEmbed = params.get("embed") === "1" || params.get("embed") === "true" || params.get("wix") === "1";
      setEmbedded(queryEmbed || window.self !== window.top);
    } catch {
      setEmbedded(true);
    }
  }, []);

  return embedded;
}

export function PromoCarousel({ promos }: { promos: Promo[] }) {
  const embedded = useEmbeddedMode();
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const scrollTo = (i: number) => {
    const el = ref.current; if (!el || embedded) return;
    const clamped = Math.max(0, Math.min(i, promos.length - 1));
    el.scrollTo({ left: clamped * el.clientWidth * 0.9, behavior: "smooth" });
    setIndex(clamped);
  };

  return (
    <section className="mx-auto mt-4 max-w-5xl">
      <div
        ref={ref}
        onScroll={embedded ? undefined : (e) => { const el = e.currentTarget; setIndex(Math.round(el.scrollLeft / (el.clientWidth * 0.9))); }}
        className={embedded ? "grid gap-3 px-4 pb-2" : "no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2"}
      >
        {promos.map((p) => (
          <Link key={p.title} href={p.href} className={`relative overflow-hidden rounded-[26px] bg-gradient-to-br ${p.gradient} ${embedded ? "h-[150px] w-full" : "h-[168px] w-[88%] shrink-0 snap-center sm:w-[46%] lg:w-[32.5%]"}`}>
            {p.image && <Image src={p.image} alt={p.title} fill className="object-cover opacity-35 mix-blend-overlay" sizes={embedded ? "100vw" : "(max-width: 640px) 88vw, 33vw"} />}
            <div className="relative flex h-full flex-col justify-between p-5">
              <span className="w-fit rounded-full bg-white/20 px-3 py-1 text-[11px] font-black tracking-wide text-white uppercase backdrop-blur">{p.tag}</span>
              <div>
                <p className="text-[26px] leading-[1.05] font-black text-white">{p.title}</p>
                <p className="mt-1 text-[13px] font-bold text-white/85">{p.subtitle}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {!embedded && (
        <div className="mt-1 flex items-center justify-center gap-2">
          {promos.map((_, i) => <button key={i} onClick={() => scrollTo(i)} aria-label={`Promo ${i + 1}`} className={`h-1.5 rounded-full transition-all ${index === i ? "w-6 bg-brand" : "w-1.5 bg-black/15"}`} />)}
        </div>
      )}
    </section>
  );
}

export function TurboRow({ store, products }: { store: Restaurant; products: Product[] }) {
  const embedded = useEmbeddedMode();
  const addItem = useCart((s) => s.addItem);
  const cartRestaurant = { id: store.id, name: store.name, slug: store.slug, deliveryFee: store.deliveryFee, timeMin: store.timeMin, timeMax: store.timeMax };

  return (
    <section className="mx-auto mt-5 max-w-5xl px-4">
      <div className="overflow-hidden rounded-[26px] bg-[#221e2c] p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-pop"><Zap className="h-5.5 w-5.5 fill-[#221e2c] text-[#221e2c]" /></span>
            <div>
              <p className="text-lg leading-none font-black text-white italic">Turbo</p>
              <p className="text-[12px] font-bold text-white/60">en {store.timeMin}-{store.timeMax} min</p>
            </div>
          </div>
          <Link href={`/restaurante/${store.slug}`} className="flex items-center gap-1 rounded-full bg-white/10 px-3.5 py-2 text-[12.5px] font-black text-amber-pop transition hover:bg-white/15">Ver todo <ChevronRight className="h-4 w-4" /></Link>
        </div>

        <div className={embedded ? "mt-4 grid grid-cols-2 gap-3" : "no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-1"}>
          {products.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className={`${embedded ? "w-full min-w-0" : "w-[136px] shrink-0"} rounded-[20px] bg-white/[0.07] p-2.5 backdrop-blur`}>
              <div className="relative h-[92px] overflow-hidden rounded-[14px]">{p.image && <Image src={p.image} alt={p.name} fill className="object-cover" sizes="136px" />}</div>
              <p className="mt-2 line-clamp-2 min-h-8 text-[12.5px] leading-tight font-extrabold text-white">{p.name}</p>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-[13px] font-black text-amber-pop">{formatMXN(p.price)}</span>
                <AddButton onClick={() => addItem({ key: `${p.id}`, productId: p.id, name: p.name, price: p.price, basePrice: p.price, image: p.image, qty: 1 }, cartRestaurant)} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedFoodRow({ stores }: { stores: Restaurant[] }) {
  const embedded = useEmbeddedMode();
  const foodStores = stores.filter((s) => ["restaurantes", "panaderias", "postres"].includes(s.categorySlug));

  return (
    <section className="mx-auto mt-6 max-w-5xl px-4">
      <div className="flex items-end justify-between">
        <Link href="/buscar?filter=destacadas" className="group flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-[var(--brand-accent)] text-white shadow-md">
            <Utensils className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-[22px] font-black tracking-tight group-hover:text-brand transition">
              Destacadas para ti
            </h2>
            <p className="mt-0.5 text-[13px] font-bold text-ink-soft">Restaurantes, panaderías y antojos más pedidos</p>
          </div>
        </Link>
        <Link href="/buscar?filter=destacadas" className="flex items-center gap-1 rounded-full bg-brand-soft px-3.5 py-2 text-[12.5px] font-black text-brand transition hover:bg-brand/15 active:scale-95">
          Ver todas <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className={embedded ? "mt-4 grid gap-3" : "no-scrollbar -mx-4 mt-4 flex gap-3.5 overflow-x-auto px-4 pb-2 snap-x snap-mandatory"}>
        {foodStores.map((r) => (
          <RestaurantCarouselCard key={`feat-${r.id}`} r={r} fullWidth={embedded} />
        ))}
      </div>
    </section>
  );
}

export function FavoritesFoodRow({ stores }: { stores: Restaurant[] }) {
  const embedded = useEmbeddedMode();
  const isFavorite = useFavorites((s) => s.isFavorite);
  const favStores = stores.filter((s) => isFavorite(s.slug) && ["restaurantes", "panaderias", "postres", "mercado"].includes(s.categorySlug));
  const displayStores = favStores.length > 0 ? favStores : stores.filter((s) => ["la-brasa-smash", "panaderia-la-espiga", "pizza-nonna"].includes(s.slug));

  return (
    <section className="mx-auto mt-6 max-w-5xl px-4">
      <div className="flex items-end justify-between">
        <Link href="/buscar?fav=1" className="group flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-[var(--brand-accent)] text-white shadow-md">
            <Heart className="h-5 w-5 fill-white" />
          </span>
          <div>
            <h2 className="text-[22px] font-black tracking-tight group-hover:text-brand transition">
              Favoritos
            </h2>
            <p className="mt-0.5 text-[13px] font-bold text-ink-soft">
              {favStores.length > 0 ? "Tus tiendas marcadas con ❤️" : "Tus preferidas y las favoritas de la comunidad"}
            </p>
          </div>
        </Link>
        <Link href="/buscar?fav=1" className="flex items-center gap-1 rounded-full bg-brand-soft px-3.5 py-2 text-[12.5px] font-black text-brand transition hover:bg-brand/15 active:scale-95">
          Ver todo <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className={embedded ? "mt-4 grid gap-3" : "no-scrollbar -mx-4 mt-4 flex gap-3.5 overflow-x-auto px-4 pb-2 snap-x snap-mandatory"}>
        {displayStores.map((r) => (
          <RestaurantCarouselCard key={`fav-row-${r.id}`} r={r} fullWidth={embedded} />
        ))}
      </div>
    </section>
  );
}

export function SaludRow({ services }: { services: Service[] }) {
  const embedded = useEmbeddedMode();

  return (
    <section className="mx-auto mt-6 max-w-5xl px-4">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-[22px] font-black tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1d6ae5] to-[#3b82f6] text-white">
              <Stethoscope className="h-5 w-5" />
            </span>
            Salud · Médicos y Especialistas
          </h2>
          <p className="mt-0.5 text-[13px] font-bold text-ink-soft">Consultas médicas, enfermería y especialistas a domicilio</p>
        </div>
        <Link href="/servicios?cat=salud" className="flex items-center gap-1 rounded-full bg-[#e8f1fe] px-3.5 py-2 text-[12.5px] font-black text-[#1d6ae5] transition hover:bg-[#d5e5fd]">
          Ver médicos <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className={embedded ? "mt-4 grid gap-3 sm:grid-cols-2" : "no-scrollbar -mx-4 mt-4 flex gap-3.5 overflow-x-auto px-4 pb-2"}>
        {services.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(i * 0.05, 0.3) }}>
            <Link href={`/servicios/${s.slug}`} className={`group block ${embedded ? "w-full min-w-0" : "w-[176px] shrink-0"}`}>
              <div className="relative h-[114px] overflow-hidden rounded-[20px] border border-[#1d6ae5]/20">
                <Image src={s.image} alt={s.name} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.06]" sizes="176px" />
                <span className="absolute top-2.5 left-2.5 flex items-center gap-0.5 rounded-full bg-white/95 px-2 py-0.5 text-[10.5px] font-black shadow">
                  <Star className="h-3 w-3 fill-amber-pop text-amber-pop" />{s.rating.toFixed(1)}
                </span>
                <span className="absolute top-2.5 right-2.5 rounded-full bg-[#1d6ae5] px-2 py-0.5 text-[9.5px] font-black text-white shadow">
                  Médico
                </span>
              </div>
              <p className="mt-2 line-clamp-1 text-[14px] font-black">{s.name}</p>
              <p className="line-clamp-1 text-[11.5px] font-bold text-ink-soft">{s.proName} · {s.provider}</p>
              <p className="mt-1 flex items-center gap-1.5 text-[12.5px] font-black text-[#1d6ae5]">
                {formatMXN(s.price)} <span className="flex items-center gap-0.5 font-bold text-ink-soft"><Clock3 className="h-3 w-3" /> {s.durationMin}'</span>
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function RayteGoBanner() {
  return (
    <section className="mx-auto mt-6 max-w-5xl px-4">
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#16121b] via-[#241c30] to-[#120e18] p-6 text-white shadow-xl border border-white/10">
        <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-amber-pop/10 blur-2xl" />
        <div className="pointer-events-none absolute -left-12 -bottom-12 h-56 w-56 rounded-full bg-pink-500/10 blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-pop shadow-md">
                <Zap className="h-5 w-5 fill-[#16121b] text-[#16121b]" />
              </span>
              <span className="text-[20px] font-black italic tracking-tight text-white">rayte go</span>
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10.5px] font-black text-amber-pop uppercase tracking-wider">
                Viajes en la ciudad
              </span>
            </div>

            <h3 className="mt-3 text-[24px] sm:text-[28px] font-black leading-tight tracking-tight text-white">
              ¿Vas a salir? Muévete rápido y seguro
            </h3>
            <p className="mt-1.5 text-[13.5px] font-bold text-white/70 leading-snug">
              Pide tu viaje en moto o carro desde $45. Elige viajar con socias conductoras en Rayte Mujer y comparte tu ruta en vivo.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[11.5px] font-bold text-white/90">
                <Bike className="h-3.5 w-3.5 text-amber-pop" /> Moto desde $45
              </span>
              <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[11.5px] font-bold text-white/90">
                <CarFront className="h-3.5 w-3.5 text-amber-pop" /> Carro desde $85
              </span>
              <span className="flex items-center gap-1 rounded-full bg-pink-500/20 px-3 py-1 text-[11.5px] font-black text-pink-300">
                🌸 Rayte Mujer
              </span>
              <span className="flex items-center gap-1 rounded-full bg-[#0ea55b]/20 px-3 py-1 text-[11.5px] font-bold text-[#4ade80]">
                🛡️ SOS 911
              </span>
            </div>
          </div>

          <div className="shrink-0 flex items-center">
            <Link
              href="/viajes"
              className="flex items-center justify-center gap-2 rounded-full bg-amber-pop px-7 py-4 text-[15px] font-black text-[#16121b] shadow-[0_12px_28px_rgba(251,191,36,0.35)] transition hover:brightness-105 active:scale-95"
            >
              <CarFront className="h-5 w-5" /> Pedir un viaje <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ServicesRow({ services }: { services: Service[] }) {
  const embedded = useEmbeddedMode();

  return (
    <section className="mx-auto mt-6 max-w-5xl px-4">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-[22px] font-black tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#c026d3]"><CalendarDays className="h-5 w-5 text-white" /></span>
            Citas y servicios
          </h2>
          <p className="mt-0.5 text-[13px] font-bold text-ink-soft">Profesionales a domicilio o en su local</p>
        </div>
        <Link href="/servicios" className="flex items-center gap-1 rounded-full bg-[#7c3aed]/10 px-3.5 py-2 text-[12.5px] font-black text-[#7c3aed] transition hover:bg-[#7c3aed]/15">Ver todo <ChevronRight className="h-4 w-4" /></Link>
      </div>

      <div className={embedded ? "mt-4 grid gap-3 sm:grid-cols-2" : "no-scrollbar -mx-4 mt-4 flex gap-3.5 overflow-x-auto px-4 pb-2"}>
        {services.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(i * 0.05, 0.3) }}>
            <Link href={`/servicios/${s.slug}`} className={`group block ${embedded ? "w-full min-w-0" : "w-[168px] shrink-0"}`}>
              <div className="relative h-[110px] overflow-hidden rounded-[20px]">
                <Image src={s.image} alt={s.name} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.06]" sizes="168px" />
                <span className="absolute top-2.5 left-2.5 flex items-center gap-0.5 rounded-full bg-white/95 px-2 py-0.5 text-[10.5px] font-black shadow">
                  <Star className="h-3 w-3 fill-amber-pop text-amber-pop" />{s.rating.toFixed(1)}
                </span>
              </div>
              <p className="mt-2 line-clamp-1 text-[14px] font-black">{s.name}</p>
              <p className="line-clamp-1 text-[11.5px] font-bold text-ink-soft">{s.provider}</p>
              <p className="mt-1 flex items-center gap-1.5 text-[12px] font-black text-[#7c3aed]">desde {formatMXN(s.price)} <span className="flex items-center gap-0.5 font-bold text-ink-soft"><Clock3 className="h-3 w-3" /> {s.durationMin}'</span></p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function RestaurantCarouselCard({ r, fullWidth = false }: { r: Restaurant; fullWidth?: boolean }) {
  const isFav = useFavorites((s) => s.isFavorite(r.slug));
  const toggleFav = useFavorites((s) => s.toggleFavorite);

  return (
    <div className={fullWidth ? "w-full min-w-0" : "w-[280px] sm:w-[320px] shrink-0 snap-center"}>
      <Link href={`/restaurante/${r.slug}`} className="group relative block">
        <div className="relative h-44 overflow-hidden rounded-[26px] bg-mist">
          <Image src={r.image} alt={r.name} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.07]" sizes="320px" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
            {r.promo ? (
              <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-brand to-[var(--brand-accent)] px-3 py-1.5 text-[10.5px] font-black text-white shadow-lg">
                <BadgePercent className="h-3.5 w-3.5" />{r.promo}
              </span>
            ) : <span />}

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleFav(r.slug);
                }}
                aria-label={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur transition active:scale-90"
              >
                <Heart className={`h-4 w-4 ${isFav ? "fill-brand text-brand" : "text-ink-soft hover:text-brand"}`} />
              </button>

              <span className="flex shrink-0 items-center gap-1 rounded-full border border-white/40 bg-white/85 px-2 py-1 text-[11.5px] font-black text-ink shadow-sm backdrop-blur-md">
                <Star className="h-3.5 w-3.5 fill-amber-pop text-amber-pop" />{r.rating.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="absolute inset-x-4 bottom-3 text-white">
            <h3 className="truncate text-[18px] leading-tight font-black drop-shadow">{r.name}</h3>
            <p className="mt-0.5 line-clamp-1 text-[12px] font-bold text-white/85">{r.description}</p>
          </div>

          {!r.isOpen && <div className="absolute inset-0 flex items-center justify-center bg-ink/60 backdrop-blur-[1px]"><span className="rounded-full bg-white px-3.5 py-1.5 text-[11.5px] font-black">Cerrado temporalmente</span></div>}
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 px-0.5">
          <span className="flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-black text-brand">
            <Clock3 className="h-3.5 w-3.5" />{r.timeMin}-{r.timeMax} min
          </span>
          <span className="flex items-center gap-1 rounded-full bg-mist px-2.5 py-1 text-[11px] font-bold text-ink-soft">
            <Bike className="h-3.5 w-3.5" />{r.deliveryFee === 0 ? "Envío gratis" : formatMXN(r.deliveryFee)}
          </span>
          <span className="rounded-full bg-mist px-2 py-1 text-[11px] font-bold text-ink-soft">{r.distanceKm.toFixed(1)} km</span>
          {r.allowsPickup && <span className="rounded-full bg-[#e6f8ee] px-2 py-1 text-[10px] font-black text-[#0ea55b]">🏪 Recoger</span>}
        </div>
      </Link>
    </div>
  );
}

export function RestaurantCard({ r, index }: { r: Restaurant; index: number }) {
  const isFav = useFavorites((s) => s.isFavorite(r.slug));
  const toggleFav = useFavorites((s) => s.toggleFavorite);

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ delay: Math.min(index * 0.05, 0.3), type: "spring", stiffness: 260, damping: 26 }}>
      <Link href={`/restaurante/${r.slug}`} className="group relative block">
        <div className="relative h-48 overflow-hidden rounded-[28px] bg-mist">
          <Image src={r.image} alt={r.name} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.07]" sizes="(max-width: 768px) 100vw, 50vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/5" />

          <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
            {r.promo ? (
              <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-brand to-[var(--brand-accent)] px-3 py-1.5 text-[11px] font-black text-white shadow-lg">
                <BadgePercent className="h-3.5 w-3.5" />{r.promo}
              </span>
            ) : <span />}

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleFav(r.slug);
                }}
                aria-label={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur transition active:scale-90"
              >
                <Heart className={`h-4.5 w-4.5 ${isFav ? "fill-brand text-brand" : "text-ink-soft hover:text-brand"}`} />
              </button>

              <span className="flex shrink-0 items-center gap-1 rounded-full border border-white/40 bg-white/85 px-2.5 py-1.5 text-[12px] font-black text-ink shadow-sm backdrop-blur-md">
                <Star className="h-3.5 w-3.5 fill-amber-pop text-amber-pop" />{r.rating.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="absolute inset-x-4 bottom-3.5 text-white">
            <h3 className="text-[19px] leading-tight font-black tracking-tight drop-shadow-md">{r.name}</h3>
            <p className="mt-0.5 line-clamp-1 text-[12.5px] font-bold text-white/85">{r.description}</p>
          </div>

          {!r.isOpen && <div className="absolute inset-0 flex items-center justify-center bg-ink/60 backdrop-blur-[1px]"><span className="rounded-full bg-white px-4 py-2 text-[12px] font-black">Cerrado temporalmente</span></div>}
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 px-0.5">
          <span className="flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-[11.5px] font-black text-brand">
            <Clock3 className="h-3.5 w-3.5" />{r.timeMin}-{r.timeMax} min
          </span>
          <span className="flex items-center gap-1 rounded-full bg-mist px-2.5 py-1 text-[11.5px] font-bold text-ink-soft">
            <Bike className="h-3.5 w-3.5" />{r.deliveryFee === 0 ? "Envío gratis" : formatMXN(r.deliveryFee)}
          </span>
          <span className="rounded-full bg-mist px-2.5 py-1 text-[11.5px] font-bold text-ink-soft">{r.distanceKm.toFixed(1)} km</span>
          {r.allowsPickup && <span className="rounded-full bg-[#e6f8ee] px-2 py-1 text-[10px] font-black text-[#0ea55b]">🏪 Recoger</span>}
          <ChevronRight className="ml-auto h-4.5 w-4.5 shrink-0 text-brand opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
        </div>
        <p className="mt-1 flex items-center gap-1 px-0.5 text-[10.5px] font-bold text-ink-soft">
          <MapPin className="h-3 w-3 shrink-0 text-brand/70" /> <span className="truncate">{r.address}</span>
        </p>
      </Link>
    </motion.div>
  );
}

export function RestaurantList({ restaurants, dishes = [], crossItems = [], crossTitle }: { restaurants: Restaurant[]; dishes?: SurpriseDish[]; crossItems?: CrossSellItem[]; crossTitle?: string }) {
  const embedded = useEmbeddedMode();
  const [sort, setSort] = useState<"none" | "fast" | "near">("none");
  const [freeShip, setFreeShip] = useState(false);
  const [openOnly, setOpenOnly] = useState(false);
  const [pickupOnly, setPickupOnly] = useState(false);
  const [deliveryOnly, setDeliveryOnly] = useState(false);
  const [favOnly, setFavOnly] = useState(false);
  const isFavorite = useFavorites((s) => s.isFavorite);

  let list = restaurants.filter((r) => !r.isTurbo);
  if (favOnly) list = list.filter((r) => isFavorite(r.slug));
  if (freeShip) list = list.filter((r) => r.deliveryFee === 0);
  if (openOnly) list = list.filter((r) => r.isOpen);
  if (pickupOnly) list = list.filter((r) => r.allowsPickup);
  if (deliveryOnly) list = list.filter((r) => r.deliveryFee >= 0);
  if (sort === "fast") list = [...list].sort((a, b) => a.timeMin - b.timeMin);
  if (sort === "near") list = [...list].sort((a, b) => a.distanceKm - b.distanceKm);

  /* 5 opciones de Abiertos y 5 opciones de Envío Gratis */
  const openStores5 = restaurants.filter((r) => r.isOpen && !r.isTurbo).slice(0, 5);
  const freeShipStores5 = restaurants.filter((r) => r.deliveryFee === 0 && !r.isTurbo).slice(0, 5);

  const hasFilterActive = favOnly || freeShip || openOnly || pickupOnly || deliveryOnly || sort !== "none";

  return (
    <section className="mx-auto mt-6 max-w-5xl px-4 pb-24 sm:pb-28">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-[22px] font-black tracking-tight">Pedí lo que quieras</h2>
          <p className="text-[13px] font-bold text-ink-soft">{list.length} tiendas para ti ahora</p>
        </div>
      </div>

      {dishes.length >= 5 && (
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => window.dispatchEvent(new CustomEvent("zappy-surprise"))}
          className="mt-4 flex w-full items-center justify-between rounded-full bg-gradient-to-r from-brand to-[var(--brand-accent)] px-5 py-4 text-left text-white shadow-[0_10px_26px_var(--brand-glow)]"
        >
          <span className="flex items-center gap-2.5 text-[16px] font-black">
            <Dices className="h-5.5 w-5.5" /> Sorpréndeme
          </span>
          <span className="flex items-center gap-1 text-[12.5px] font-bold text-white/85">5 platillos al azar <ChevronRight className="h-4 w-4" /></span>
        </motion.button>
      )}

      {/* Filtros en una sola línea deslizable (estilo Uber Eats con Favoritos) */}
      <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <Chip
          small
          active={favOnly}
          onClick={() => setFavOnly(!favOnly)}
          label="Favoritos"
          icon={Heart}
          badgeColor="text-brand"
        />
        <Chip small active={sort === "fast"} onClick={() => setSort(sort === "fast" ? "none" : "fast")} label="⚡ Rápido" />
        <Chip small active={sort === "near"} onClick={() => setSort(sort === "near" ? "none" : "near")} label="📍 Cerca de mí" />
        <Chip small active={freeShip} onClick={() => setFreeShip(!freeShip)} label="🚴 Envío gratis" />
        <Chip small active={openOnly} onClick={() => setOpenOnly(!openOnly)} label="🟢 Abiertos" />
        <Chip small active={pickupOnly} onClick={() => setPickupOnly(!pickupOnly)} label="🏪 Recoger" />
        <Chip small active={deliveryOnly} onClick={() => setDeliveryOnly(!deliveryOnly)} label="🛵 A domicilio" />
      </div>

      {/* 🟢 Carrusel 1: ABIERTO (5 opciones) */}
      {openStores5.length > 0 && (
        <div className="mt-6">
          <div className="flex items-end justify-between">
            <Link href="/buscar?open=1" className="group flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#e6f8ee] text-[#0ea55b]">
                <Store className="h-4 w-4 text-[#0ea55b]" />
              </span>
              <div>
                <p className="text-[16px] font-black tracking-tight text-ink group-hover:text-brand transition">Abiertos ahora</p>
                <p className="text-[11px] font-bold text-ink-soft">5 opciones listas para ordenar ahora</p>
              </div>
            </Link>
            <Link href="/buscar?open=1" className="flex items-center gap-1 rounded-full bg-[#e6f8ee] px-3 py-1 text-[11.5px] font-black text-[#0ea55b] transition hover:bg-[#d5f3e2]">
              Ver todas <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className={embedded ? "mt-3 grid gap-3" : "no-scrollbar -mx-4 mt-3 flex gap-3.5 overflow-x-auto px-4 pb-2 snap-x snap-mandatory"}>
            {openStores5.map((r) => (
              <RestaurantCarouselCard key={`open5-${r.id}`} r={r} fullWidth={embedded} />
            ))}
          </div>
        </div>
      )}

      {/* 🚴 Carrusel 2: ENVÍO GRATIS (5 opciones) */}
      {freeShipStores5.length > 0 && (
        <div className="mt-6">
          <div className="flex items-end justify-between">
            <Link href="/buscar?free=1" className="group flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <Bike className="h-4 w-4 text-brand" />
              </span>
              <div>
                <p className="text-[16px] font-black tracking-tight text-ink group-hover:text-brand transition">Envío gratis</p>
                <p className="text-[11px] font-bold text-ink-soft">5 opciones sin costo de entrega</p>
              </div>
            </Link>
            <Link href="/buscar?free=1" className="flex items-center gap-1 rounded-full bg-brand-soft px-3 py-1 text-[11.5px] font-black text-brand transition hover:bg-brand/15">
              Ver todas <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className={embedded ? "mt-3 grid gap-3" : "no-scrollbar -mx-4 mt-3 flex gap-3.5 overflow-x-auto px-4 pb-2 snap-x snap-mandatory"}>
            {freeShipStores5.map((r) => (
              <RestaurantCarouselCard key={`free5-${r.id}`} r={r} fullWidth={embedded} />
            ))}
          </div>
        </div>
      )}

      {hasFilterActive && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-black text-ink uppercase tracking-wide">
              {favOnly
                ? "❤️ Tus Favoritos"
                : sort === "fast"
                  ? "⚡ Entregas más rápidas"
                  : sort === "near"
                    ? "📍 Más cercanas a ti"
                    : freeShip
                      ? "🚴 Con envío gratis"
                      : pickupOnly
                        ? "🏪 Listas para recoger"
                        : "Opciones filtradas"}
            </p>
            <span className="text-[11.5px] font-bold text-ink-soft">{list.length} encontradas</span>
          </div>

          {list.length > 0 && (
            <div className={embedded ? "mt-2.5 grid gap-3" : "no-scrollbar -mx-4 mt-2.5 flex gap-3.5 overflow-x-auto px-4 pb-2 snap-x snap-mandatory"}>
              {list.map((r) => (
                <RestaurantCarouselCard key={`car-${r.id}`} r={r} fullWidth={embedded} />
              ))}
            </div>
          )}
        </div>
      )}

      {list.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-[26px] bg-mist px-6 py-14 text-center">
          {favOnly ? (
            <>
              <span className="text-4xl">❤️</span>
              <p className="mt-3 text-lg font-black">Aún no tienes tiendas en favoritos</p>
              <p className="mt-1 max-w-xs text-sm font-bold text-ink-soft">Toca el corazón en tus tiendas favoritas para verlas rápidamente aquí.</p>
              <button onClick={() => setFavOnly(false)} className="mt-4 rounded-full bg-brand px-5 py-2.5 text-xs font-black text-white">Ver todas las tiendas</button>
            </>
          ) : (
            <>
              <span className="text-4xl font-black italic text-brand">¡Pronto!</span>
              <p className="mt-2 max-w-xs text-sm font-bold text-ink-soft">No hay tiendas con esos filtros activos. Prueba desactivando alguno.</p>
            </>
          )}
        </div>
      ) : (
        <>
          <p className="mt-8 text-[13px] font-black text-ink-soft uppercase tracking-wide">Todas las opciones</p>
          <div className="mt-3 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {list.map((r, i) => (
              <Fragment key={r.id}>
                {i === 4 && crossItems.length > 0 && (
                  <div className="md:col-span-2 xl:col-span-3 min-w-0 w-full">
                    <CrossSell items={crossItems} title={crossTitle} />
                  </div>
                )}
                <RestaurantCard r={r} index={i} />
                {i === list.length - 1 && list.length < 5 && crossItems.length > 0 && (
                  <div className="md:col-span-2 xl:col-span-3 min-w-0 w-full">
                    <CrossSell items={crossItems} title={crossTitle} />
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        </>
      )}

      <p className="pt-10 text-center text-[11px] font-black tracking-widest text-ink-soft/60 uppercase">Rayte · v1.27</p>
    </section>
  );
}

function Chip({ active, onClick, label, small = false, icon: Icon, badgeColor }: { active: boolean; onClick: () => void; label: string; small?: boolean; icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>; badgeColor?: string }) {
  return (
    <button onClick={onClick} className={`flex shrink-0 items-center gap-1.5 rounded-full font-black transition active:scale-95 ${small ? "px-3 py-1.5 text-[11.5px]" : "px-4 py-2 text-[13px]"} ${active ? "bg-ink text-white shadow-md" : "bg-mist text-ink hover:bg-black/[0.07]"}`}>
      {Icon && <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? (badgeColor ? "fill-rose-400 text-rose-400" : "text-white") : (badgeColor ?? "text-brand")}`} strokeWidth={2.4} />}
      {label}
    </button>
  );
}
