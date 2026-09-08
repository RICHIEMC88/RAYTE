"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Stethoscope, CalendarDays, Clock3, Star, Home, Store, Search,
  BadgeCheck, UserRound, BriefcaseMedical, ShieldCheck, HeartPulse,
} from "lucide-react";
import type { Service } from "@/db/schema";
import { formatMXN } from "@/lib/utils";
import BackButton from "@/components/back-button";

const BLUE = "#1d6ae5";
const SOFT = "#e8f1fe";

/* Especialidades / filtros rápidos del directorio médico */
const SPECIALTIES: { label: string; tag: string }[] = [
  { label: "Médico a domicilio", tag: "medico" },
  { label: "Enfermería", tag: "enfermeria" },
  { label: "Nutrición", tag: "nutricionista" },
  { label: "Psicología", tag: "psicologia" },
  { label: "Ginecología", tag: "ginecologia" },
  { label: "Pediatría", tag: "pediatria" },
  { label: "Dermatología", tag: "dermatologia" },
  { label: "A domicilio", tag: "domicilio" },
];

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export default function MedicosClient({ services }: { services: Service[] }) {
  const [query, setQuery] = useState("");
  const [spec, setSpec] = useState("");
  const [onlyDomicilio, setOnlyDomicilio] = useState(false);
  const q = norm(query.trim());

  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 2);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filtered = services.filter((s) => {
    const hay = norm(`${s.name} ${s.provider} ${s.description} ${s.proName}`);
    const mq = !q || hay.includes(q);
    const ms = !spec || hay.includes(norm(spec));
    const md = !onlyDomicilio || s.domicilio;
    return mq && ms && md;
  });

  return (
    <div className="min-h-screen bg-white pb-28">
      {/* Cabecera fija */}
      <div
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
                placeholder="Buscar médico, especialidad, doctor..."
                className="w-full rounded-2xl border border-black/10 bg-mist py-2.5 pr-4 pl-11 text-[14.5px] font-bold outline-none placeholder:text-ink-soft transition focus:border-[#1d6ae5]"
              />
            </div>
          </div>

          {/* Filtros de especialidad */}
          <div className="no-scrollbar -mx-4 mt-2.5 flex gap-2 overflow-x-auto px-4 pb-0.5">
            <button
              type="button"
              onClick={() => setSpec("")}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[11.5px] font-bold transition active:scale-95 ${
                !spec ? "bg-[#1d6ae5] text-white font-black shadow-sm" : "bg-mist text-ink-soft hover:text-ink hover:bg-black/[0.08]"
              }`}
            >
              Todos
            </button>
            {SPECIALTIES.map((sp) => {
              const active = spec === sp.tag;
              return (
                <button
                  key={sp.tag}
                  type="button"
                  onClick={() => setSpec(active ? "" : sp.tag)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[11.5px] font-bold transition active:scale-95 ${
                    active ? "bg-[#1d6ae5] text-white font-black shadow-sm" : "bg-mist text-ink-soft hover:text-ink hover:bg-black/[0.08]"
                  }`}
                >
                  {sp.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pt-2">
        {/* Banner del directorio médico */}
        <div className="overflow-hidden rounded-[26px] bg-gradient-to-br from-[#1d6ae5] to-[#3b82f6] p-5 text-white sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20">
              <Stethoscope className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-[22px] font-black tracking-tight leading-tight">Médicos y Especialistas</h1>
              <p className="text-[12.5px] font-bold text-white/85">Profesionales de la salud verificados, a domicilio o en consultorio</p>
            </div>
          </div>
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            <span className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10.5px] font-black"><ShieldCheck className="h-3.5 w-3.5" /> Cédula verificada</span>
            <span className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10.5px] font-black"><HeartPulse className="h-3.5 w-3.5" /> Seguimiento clínico</span>
            <span className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10.5px] font-black"><CalendarDays className="h-3.5 w-3.5" /> Agenda hoy</span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12px] font-bold text-ink-soft">
            Mostrando <span className="font-black" style={{ color: BLUE }}>{filtered.length}</span> profesionales · toca <b>Agendar</b> para elegir día y hora
          </p>
          <button
            type="button"
            onClick={() => setOnlyDomicilio((v) => !v)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-black transition active:scale-95 ${
              onlyDomicilio ? "bg-[#0ea55b] text-white shadow-sm" : "bg-[#e6f8ee] text-[#0ea55b]"
            }`}
          >
            <Home className="h-3.5 w-3.5" /> Solo a domicilio
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-6 flex flex-col items-center rounded-[26px] bg-mist px-6 py-12 text-center">
            <BriefcaseMedical className="h-9 w-9 text-ink-soft/50" />
            <p className="mt-2 max-w-xs text-sm font-bold text-ink-soft">No encontramos médicos con ese filtro. Prueba otra especialidad o palabra.</p>
          </div>
        ) : (
          <div className="mt-2.5 grid gap-4 md:grid-cols-2">
            {filtered.map((sv, i) => (
              <Fragment key={sv.id}>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.2) }}
                  className="group overflow-hidden rounded-[26px] border transition hover:shadow-md"
                  style={{ borderColor: `${BLUE}33` }}
                >
                  <Link href={`/servicios/${sv.slug}`} className="block">
                    <div className="relative h-48">
                      <Image src={sv.image} alt={sv.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 50vw" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
                      {/* Sello de profesional verificado */}
                      <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10.5px] font-black text-[#0ea55b] shadow">
                        <BadgeCheck className="h-3.5 w-3.5" /> Verificado
                      </span>
                      <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[12px] font-black text-ink shadow">
                        <Star className="h-3.5 w-3.5 fill-amber-pop text-amber-pop" />{sv.rating.toFixed(1)}
                        <span className="text-[10px] font-bold text-ink-soft">({sv.ratingCount})</span>
                      </span>
                      <div className="absolute right-4 bottom-3 left-4 text-white">
                        <p className="text-[20px] font-black drop-shadow">{sv.name}</p>
                        <p className="text-[13px] font-bold text-white/90"><UserRound className="mb-0.5 mr-1 inline h-3.5 w-3.5" />{sv.proName} · {sv.provider}</p>
                      </div>
                    </div>
                  </Link>
                  <div className="bg-white p-4">
                    {sv.description && (
                      <p className="line-clamp-2 text-[12.5px] font-semibold leading-relaxed text-ink-soft">{sv.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11.5px] font-bold text-ink-soft">
                      <span className="flex items-center gap-1 rounded-full px-2.5 py-1" style={{ backgroundColor: SOFT, color: BLUE }}><Clock3 className="h-3.5 w-3.5" /> {sv.durationMin} min</span>
                      {sv.domicilio && <span className="flex items-center gap-1 rounded-full bg-[#e6f8ee] px-2.5 py-1 text-[#0ea55b]"><Home className="h-3.5 w-3.5" /> Domicilio</span>}
                      {sv.local && <span className="flex items-center gap-1 rounded-full bg-mist px-2.5 py-1 text-ink"><Store className="h-3.5 w-3.5" /> Consultorio</span>}
                    </div>
                    <div className="mt-2.5 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[16px] font-black" style={{ color: BLUE }}>{formatMXN(sv.price)}</p>
                        <p className="text-[10.5px] font-bold text-ink-soft">por consulta</p>
                      </div>
                      <Link
                        href={`/servicios/${sv.slug}`}
                        className="flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-black text-white transition hover:brightness-110 active:scale-95 shadow-sm"
                        style={{ backgroundColor: BLUE, boxShadow: `0 8px 20px rgba(29,106,229,0.35)` }}
                      >
                        <CalendarDays className="h-4 w-4" /> Agendar
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
