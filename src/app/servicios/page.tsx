import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Clock3, Star, Home, Store, MapPin, UserRound } from "lucide-react";
import { db } from "@/db";
import { services, serviceOptions } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { formatMXN } from "@/lib/utils";
import { serviceCat } from "@/lib/service-cats";
import BookingClient from "./booking-client";

export const dynamic = "force-dynamic";

export default async function ServicioDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [service] = await db.select().from(services).where(eq(services.slug, slug));
  if (!service) notFound();
  const options = await db
    .select()
    .from(serviceOptions)
    .where(eq(serviceOptions.serviceId, service.id))
    .orderBy(asc(serviceOptions.sort));
  const cat = serviceCat(service.category);

  return (
    <div className="min-h-screen bg-white pb-24 sm:pb-28">
      <div className="relative">
        {/* Foto hero */}
        <div className="relative h-[240px] sm:h-[280px]">
          <Image src={service.image} alt={service.name} fill priority className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-black/25" />
            <div className="absolute top-4 left-4 flex items-center gap-2">
            <Link href="/servicios" aria-label="Volver" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white backdrop-blur-md transition hover:bg-black/55 active:scale-90">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </div>
          <span
            className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[11px] font-black text-white shadow-lg"
            style={{ backgroundColor: cat.accent }}
          >
            {cat.emoji} {cat.label}
          </span>
        </div>

        {/* Tarjeta encimada estilo Rappi */}
        <div className="relative -mt-7 rounded-t-[30px] bg-white pb-1 shadow-[0_-10px_30px_rgba(0,0,0,0.10)]">
          <div className="mx-auto max-w-2xl px-5 pt-4">
            <div className="flex items-start gap-3.5">
              <span className="relative -mt-11 h-[76px] w-[76px] shrink-0 overflow-hidden rounded-[24px] border-4 border-white bg-white shadow-xl">
                <Image src={service.image} alt={service.name} fill className="object-cover" sizes="76px" />
              </span>
              <div className="min-w-0 flex-1 pt-1.5">
                <h1 className="text-[22px] leading-[1.05] font-black tracking-tight break-words sm:text-[25px]">{service.name}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12.5px] font-bold text-ink-soft">
                  <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-pop text-amber-pop" /> {service.rating.toFixed(1)} <span className="font-semibold text-ink-soft/70">({service.ratingCount.toLocaleString("es-MX")})</span></span>
                  <span className={`flex items-center gap-1 ${service.available ? "text-[#0ea55b]" : "text-brand"}`}>
                    <span className={`h-2 w-2 rounded-full ${service.available ? "bg-[#0ea55b]" : "bg-brand"}`} />
                    {service.available ? "Disponible" : "En pausa"}
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-2.5 text-[13.5px] leading-snug font-semibold text-ink-soft">{service.description}</p>

            {/* Chips con el color exacto del rubro */}
            <div className="no-scrollbar mt-3.5 flex gap-2 overflow-x-auto pb-0.5">
              <span className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-black" style={{ backgroundColor: cat.soft, color: cat.accent }}>
                <Clock3 className="h-3.5 w-3.5" /> {service.durationMin} min
              </span>
              <span className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-black" style={{ backgroundColor: cat.soft, color: cat.accent }}>
                <BadgeCheck className="h-3.5 w-3.5" /> Tarifa fija {formatMXN(service.price)}
              </span>
              {service.domicilio && (
                <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#e6f8ee] px-3 py-1.5 text-[12px] font-black text-[#0ea55b]"><Home className="h-3.5 w-3.5" /> A domicilio</span>
              )}
              {service.local && (
                <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-mist px-3 py-1.5 text-[12px] font-black text-ink"><Store className="h-3.5 w-3.5" /> En local</span>
              )}
            </div>

            {/* Profesional a cargo */}
            <div className="mt-3.5 flex items-center gap-2 border-t border-black/5 py-3">
              <UserRound className="h-4 w-4 shrink-0" style={{ color: cat.accent }} />
              <span className="min-w-0 flex-1 truncate text-[12.5px] font-extrabold text-ink">{service.proName} · {service.provider}</span>
              <MapPin className="h-3.5 w-3.5 shrink-0 text-ink-soft" />
              <span className="text-[11.5px] font-bold text-ink-soft">León, GTO</span>
            </div>
          </div>
        </div>
      </div>

      {!service.available && (
        <div className="mx-auto mt-3 max-w-2xl px-4">
          <p className="rounded-2xl bg-mist px-4 py-3 text-center text-[13.5px] font-black text-ink-soft">Agenda en pausa — puedes ver el servicio, pero no agendar por ahora</p>
        </div>
      )}

      <div className="mx-auto max-w-2xl px-4 pt-4">
        <div className="rounded-[26px] border p-5" style={{ borderColor: `${cat.accent}33` }}>
          <p className="text-lg font-black">¿Qué incluye?</p>
          <ul className="mt-3 space-y-2">
            {service.includes.map((inc) => (
              <li key={inc} className="flex items-center gap-2 text-[14px] font-bold text-ink-soft">
                <span className="flex h-5 w-5 items-center justify-center rounded-full text-[15px] font-black" style={{ backgroundColor: cat.soft, color: cat.accent }}>✓</span>
                {inc}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[16px] font-black" style={{ color: cat.accent }}>Tarifa fija: {formatMXN(service.price)}</p>
        </div>

        <BookingClient service={service} options={options} accent={cat.accent} soft={cat.soft} glow={cat.glow} />
      </div>
    </div>
  );
}
