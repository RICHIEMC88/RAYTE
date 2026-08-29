"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { CalendarDays, Clock3, LayoutGrid, Search, Star, Home, Store } from "lucide-react";
import type { Service } from "@/db/schema";
import { formatMXN } from "@/lib/utils";
import { serviceCat } from "@/lib/service-cats";
import BackButton from "@/components/back-button";
import CrossSell, { type CrossSellItem } from "@/components/cross-sell";

const CAT_LABELS: Record<string, string> = {
  belleza: "Belleza",
  bienestar: "Bienestar",
  mascotas: "Mascotas",
  hogar: "Hogar",
  salud: "Médicos y Especialistas",
};

const SUBCATS: Record<string, { label: string; tag: string }[]> = {
  todos: [
    { label: "Todos", tag: "" },
    { label: "Barbería", tag: "barberia" },
    { label: "Uñas & Spa", tag: "manicure" },
    { label: "Masajes", tag: "masaje" },
    { label: "Limpieza", tag: "limpieza" },
    { label: "Plomería", tag: "plomeria" },
    { label: "Médico general", tag: "medico" },
    { label: "Peluquería canina", tag: "peluqueria" },
    { label: "Entrenador", tag: "entrenador" },
    { label: "A domicilio", tag: "domicilio" },
  ],
  belleza: [
    { label: "Todas en Belleza", tag: "" },
    { label: "Barbería a domicilio", tag: "barberia" },
    { label: "Corte y peinado", tag: "corte" },
    { label: "Manicure & Pedicure", tag: "manicure" },
    { label: "Uñas & Spa", tag: "uñas" },
  ],
  bienestar: [
    { label: "Todo en Bienestar", tag: "" },
    { label: "Masaje relajante", tag: "masaje" },
    { label: "Entrenador personal", tag: "entrenador" },
    { label: "Yoga en casa", tag: "yoga" },
    { label: "Fisioterapia", tag: "fisioterapeuta" },
  ],
  mascotas: [
    { label: "Todo en Mascotas", tag: "" },
    { label: "Peluquería canina", tag: "peluqueria" },
    { label: "Veterinario a domicilio", tag: "veterinario" },
    { label: "Paseo de perros", tag: "paseo" },
    { label: "Tiendas de mascota", tag: "tiendas" },
  ],
  hogar: [
    { label: "Todo en Hogar", tag: "" },
    { label: "Limpieza profunda", tag: "limpieza" },
    { label: "Plomería express", tag: "plomeria" },
    { label: "Técnico electricista", tag: "tecnico" },
    { label: "Chef a domicilio", tag: "chef" },
  ],
  salud: [
    { label: "Todos en Salud", tag: "" },
    { label: "Médico a domicilio", tag: "medico" },
    { label: "Enfermería general", tag: "enfermeria" },
    { label: "Nutricionista", tag: "nutricionista" },
    { label: "Psicología a domicilio", tag: "psicologia" },
  ],
};

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export default function ServicesClient({
  services,
  cat,
  crossItems = [],
  crossTitle,
  petStores = [],
}: {
  services: Service[];
  cat: string | null;
  crossItems?: CrossSellItem[];
  crossTitle?: string;
  petStores?: { name: string; slug: string; image: string; rating: number; timeMin: number; timeMax: number; isOpen: boolean }[];
}) {
  const [query, setQuery] = useState("");
  const [subCat, setSubCat] = useState("");
  const q = norm(query.trim());

  useEffect(() => {
    setSubCat("");
  }, [cat]);

  /* Línea divisora estilo Uber Eats: invisible arriba, hairline sutil + sombra al hacer scroll */
  const [stuck, setStuck] = useState(false);
  const headRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 2);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const currentCat = cat ? serviceCat(cat) : { accent: "#7c3aed", soft: "#f3e8ff", glow: "rgba(124,58,237,0.35)", label: "Servicios" };
  const currentSubCats = SUBCATS[cat ?? "todos"] ?? SUBCATS.todos;

  const filtered = services.filter((s) => {
    const inCat = !cat || s.category === cat;
    const matchesQuery = !q || norm(`${s.name} ${s.provider} ${s.description} ${s.category}`).includes(q);
    const matchesSub =
      !subCat ||
      (subCat === "domicilio"
        ? s.domicilio
        : norm(`${s.name} ${s.provider} ${s.description} ${s.category}`).includes(norm(subCat)));
    return inCat && matchesQuery && matchesSub;
  });

  return (
    <div className="min-h-screen bg-white pb-28">
      <div
        ref={headRef}
        className={`sticky top-0 z-40 bg-white/95 backdrop-blur transition-all duration-300 ${
          stuck ? "border-b border-black/[0.07] shadow-[0_8px_20px_rgba(0,0,0,0.07)]" : "border-b border-transparent"
        }`}
      >
        <div className="mx-auto max-w-5xl px-4 pt-2.5 pb-1.5">
          <div className="flex items-center gap-2.5">
            <BackButton />
            <div className="relative flex-1">
              <Search className="absolute top-3 left-4 h-4.5 w-4.5 text-ink-soft" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar en Rayte Servicios"
                className="w-full rounded-2xl border border-black/10 bg-mist py-2.5 pr-4 pl-11 text-[14.5px] font-bold outline-none placeholder:text-ink-soft transition"
                onFocus={(e) => (e.currentTarget.style.borderColor = currentCat.accent)}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.1)")}
              />
            </div>
          </div>

          {/* Carrusel de categorías estilo Uber Eats: foto real en círculo + color del rubro */}
          <div className="no-scrollbar -mx-4 mt-2 flex gap-3 overflow-x-auto px-4 pb-0.5">
            <Link href="/servicios" className="flex w-[68px] shrink-0 flex-col items-center gap-1 transition active:scale-90">
              <span
                className={`flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] text-white transition ${
                  !cat ? "ring-2 ring-[#7c3aed] ring-offset-2 shadow-md" : "opacity-80"
                }`}
              >
                <LayoutGrid className="h-5.5 w-5.5 text-white" strokeWidth={2.2} />
              </span>
              <span className={`text-[10.5px] font-extrabold ${!cat ? "text-[#7c3aed]" : "text-ink-soft"}`}>Todos</span>
            </Link>
            {[...new Set(services.map((s) => s.category))].map((c) => {
              const cc = serviceCat(c);
              const img = services.find((s) => s.category === c)?.image;
              const active = cat === c;
              return (
                <Link key={c} href={`/servicios?cat=${c}`} className="flex w-[68px] shrink-0 flex-col items-center gap-1 transition active:scale-90">
                  <span
                    className="relative h-13 w-13 overflow-hidden rounded-full bg-mist transition"
                    style={active ? { boxShadow: `0 0 0 2px #fff, 0 0 0 4px ${cc.accent}` } : undefined}
                  >
                    {img && <Image src={img} alt={CAT_LABELS[c] ?? c} fill sizes="52px" className="object-cover" />}
                  </span>
                  <span className={`text-[10.5px] font-extrabold transition ${active ? "font-black" : "text-ink-soft"}`} style={active ? { color: cc.accent } : undefined}>
                    {CAT_LABELS[c] ?? c}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* 🏷️ Subcategorías debajo de los círculos */}
          <div className="no-scrollbar -mx-4 mt-2.5 flex gap-2 overflow-x-auto px-4 pb-0.5">
            {currentSubCats.map((sc) => {
              const active = subCat === sc.tag;
              return (
                <button
                  key={sc.label}
                  type="button"
                  onClick={() => setSubCat(active && sc.tag !== "" ? "" : sc.tag)}
                  className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold transition active:scale-95 ${
                    active
                      ? "text-white shadow-sm font-black"
                      : "bg-mist text-ink-soft hover:text-ink hover:bg-black/[0.08]"
                  }`}
                  style={active ? { backgroundColor: currentCat.accent, color: "#fff" } : undefined}
                >
                  {sc.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pt-1.5">
        <h1 className="text-xl font-black tracking-tight leading-tight">{cat ? (CAT_LABELS[cat] ?? "Servicios") : "Elige tu servicio"}</h1>
        <p className="mt-0.5 text-[12px] font-bold text-ink-soft">
          Mostrando {filtered.length} de {services.length} · toca <span className="font-black" style={{ color: currentCat.accent }}>Agendar</span> para escoger día y hora
        </p>

        {/* Tiendas de mascotas (los productos también viven aquí) */}
        {cat === "mascotas" && petStores.length > 0 && (
          <div className="mt-2.5">
            <p className="text-[12px] font-black tracking-wide uppercase" style={{ color: "#0284c7" }}>🐾 Tiendas para tu mascota</p>
            <div className="no-scrollbar -mx-4 mt-1.5 flex gap-3 overflow-x-auto px-4 pb-1">
              {petStores.map((s) => (
                <Link key={s.slug} href={`/restaurante/${s.slug}`} className="w-[220px] shrink-0 overflow-hidden rounded-[20px] border transition active:scale-95" style={{ borderColor: "#0284c733" }}>
                  <div className="relative h-24">
                    <Image src={s.image} alt={s.name} fill className="object-cover" sizes="220px" />
                    <span className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-black ${s.isOpen ? "bg-[#e6f8ee] text-[#0ea55b]" : "bg-white text-ink-soft"}`}>{s.isOpen ? "Abierto" : "Cerrado"}</span>
                  </div>
                  <div className="p-2.5">
                    <p className="truncate text-[13.5px] font-black">{s.name}</p>
                    <p className="text-[11.5px] font-bold text-ink-soft"><Star className="mb-0.5 inline h-3 w-3 fill-amber-pop text-amber-pop" /> {s.rating.toFixed(1)} · {s.timeMin}-{s.timeMax} min · Envío a domicilio</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="mt-6 flex flex-col items-center rounded-[26px] bg-mist px-6 py-12 text-center">
            <span className="text-3xl font-black italic" style={{ color: currentCat.accent }}>¡Ups!</span>
            <p className="mt-2 max-w-xs text-sm font-bold text-ink-soft">No encontramos ese servicio. Prueba con otra palabra o categoría.</p>
          </div>
        ) : (
          <div className="mt-2.5 grid gap-4 md:grid-cols-2">
            {filtered.map((sv, i) => {
              const cc = serviceCat(sv.category);
              return (
                <Fragment key={sv.id}>
                  {i === 4 && crossItems.length > 0 && (
                    <div className="md:col-span-2 min-w-0 w-full">
                      <CrossSell items={crossItems} title={crossTitle} />
                    </div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group overflow-hidden rounded-[26px] border transition hover:shadow-md"
                    style={{ borderColor: `${cc.accent}33` }}
                  >
                    <Link href={`/servicios/${sv.slug}`} className="block">
                      <div className="relative h-44">
                        <Image src={sv.image} alt={sv.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 50vw" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                        <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black text-white shadow" style={{ backgroundColor: cc.accent }}>
                          {cc.emoji} {cc.label}
                        </span>
                        <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[12px] font-black text-ink shadow">
                          <Star className="h-3.5 w-3.5 fill-amber-pop text-amber-pop" />{sv.rating.toFixed(1)}
                        </span>
                        <div className="absolute right-4 bottom-3 left-4 text-white">
                          <p className="text-xl font-black drop-shadow">{sv.name}</p>
                          <p className="text-[13px] font-bold text-white/90">{sv.provider}</p>
                        </div>
                      </div>
                    </Link>
                    <div className="flex items-center justify-between gap-3 p-4 bg-white">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 text-[11.5px] font-bold text-ink-soft">
                          <span className="flex items-center gap-1 rounded-full px-2.5 py-1" style={{ backgroundColor: cc.soft, color: cc.accent }}><Clock3 className="h-3.5 w-3.5" /> {sv.durationMin} min</span>
                          {sv.domicilio && <span className="flex items-center gap-1 rounded-full bg-[#e6f8ee] px-2.5 py-1 text-[#0ea55b]"><Home className="h-3.5 w-3.5" /> Domicilio</span>}
                          {sv.local && <span className="flex items-center gap-1 rounded-full bg-mist px-2.5 py-1 text-ink"><Store className="h-3.5 w-3.5" /> Local</span>}
                        </div>
                        <p className="mt-1.5 text-[16px] font-black" style={{ color: cc.accent }}>{formatMXN(sv.price)}</p>
                      </div>
                      <Link
                        href={`/servicios/${sv.slug}`}
                        className="flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-black text-white transition hover:brightness-110 active:scale-95 shadow-sm"
                        style={{ backgroundColor: cc.accent, boxShadow: `0 8px 20px ${cc.glow}` }}
                      >
                        <CalendarDays className="h-4 w-4" /> Agendar
                      </Link>
                    </div>
                  </motion.div>
                  {i === filtered.length - 1 && filtered.length < 5 && crossItems.length > 0 && (
                    <div className="md:col-span-2 min-w-0 w-full">
                      <CrossSell items={crossItems} title={crossTitle} />
                    </div>
                  )}
                </Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
