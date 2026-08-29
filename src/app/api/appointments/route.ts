import { NextResponse } from "next/server";
import { and, desc, eq, gte, inArray } from "drizzle-orm";
import { db } from "@/db";
import { appointments, services, serviceOptions, type ClinicalSnapshot } from "@/db/schema";

/* Estados que bloquean el horario */
const ACTIVE = ["scheduled", "confirmed"];

const num = (value: unknown, min: number, max: number, decimals = 0) => {
  const raw = typeof value === "string" ? value.replace(/,/g, ".").trim() : value;
  const n = Number(raw);
  if (!Number.isFinite(n)) return undefined;
  const factor = 10 ** decimals;
  const rounded = Math.round(n * factor) / factor;
  if (rounded < min || rounded > max) return undefined;
  return rounded;
};

const normalizeClinicalSnapshot = (value: unknown): ClinicalSnapshot | null => {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const snapshot: ClinicalSnapshot = {
    weightKg: num(raw.weightKg, 1, 400, 1),
    heightCm: num(raw.heightCm, 30, 250, 1),
    temperatureC: num(raw.temperatureC, 30, 45, 1),
    systolic: num(raw.systolic, 60, 260),
    diastolic: num(raw.diastolic, 30, 180),
    heartRate: num(raw.heartRate, 20, 240),
    oxygenSat: num(raw.oxygenSat, 40, 100),
    glucoseMgDl: num(raw.glucoseMgDl, 20, 600),
  };
  const hasAny = Object.values(snapshot).some((v) => v !== undefined);
  return hasAny ? { ...snapshot, updatedAt: new Date().toISOString() } : null;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const serviceId = Number(body.serviceId);
    const customerName = String(body.customerName ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const mode = body.mode === "local" ? "local" : "domicilio";
    const address = body.address ? String(body.address).trim() : null;
    const notes = body.notes ? String(body.notes).trim() : null;

    /* Solicitud detallada del paciente (opcional, la manda el formulario de salud) */
    const rawIntake = body.intake && typeof body.intake === "object" ? body.intake : null;
    const intake = rawIntake
      ? {
          edad: String(rawIntake.edad ?? "").trim().slice(0, 12) || undefined,
          sintomas: String(rawIntake.sintomas ?? "").trim().slice(0, 600) || undefined,
          alergias: String(rawIntake.alergias ?? "").trim().slice(0, 300) || undefined,
          medicamentos: String(rawIntake.medicamentos ?? "").trim().slice(0, 300) || undefined,
        }
      : null;
    const hasIntake = intake && Object.values(intake).some(Boolean);

    if (!serviceId || !customerName || !phone || !body.startAt) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }
    if (mode === "domicilio" && !address) {
      return NextResponse.json({ error: "La dirección es obligatoria a domicilio" }, { status: 400 });
    }

    const startAt = new Date(body.startAt);
    if (Number.isNaN(startAt.getTime())) {
      return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
    }

    const [service] = await db.select().from(services).where(eq(services.id, serviceId));
    if (!service) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
    }

    /* Servicio específico elegido del menú del negocio (opcional) */
    let option = null;
    if (body.optionId) {
      const [opt] = await db
        .select()
        .from(serviceOptions)
        .where(and(eq(serviceOptions.id, Number(body.optionId)), eq(serviceOptions.serviceId, service.id)));
      if (!opt) return NextResponse.json({ error: "El servicio elegido no existe." }, { status: 400 });
      option = opt;
    }
    const durationMin = option?.durationMin ?? service.durationMin;

    const endAt = new Date(startAt.getTime() + durationMin * 60000);

    /* ⛔ Anti-doble reserva: si otra cita activa se empalma, se rechaza */
    const existing = await db
      .select({ startAt: appointments.startAt, endAt: appointments.endAt })
      .from(appointments)
      .where(and(eq(appointments.serviceId, service.id), inArray(appointments.status, ACTIVE)));
    const clash = existing.some((e) => e.startAt < endAt && e.endAt > startAt);
    if (clash) {
      return NextResponse.json({ error: "Ese horario acaba de ocuparse. Elige otra hora, por favor." }, { status: 409 });
    }

    const code = `ZA-${Math.floor(1000 + Math.random() * 9000)}`;

    const [row] = await db
      .insert(appointments)
      .values({
        id: crypto.randomUUID(),
        code,
        serviceId: service.id,
        serviceName: service.name,
        serviceImage: service.image,
        optionName: option?.name ?? null,
        customerName,
        phone,
        mode,
        address,
        startAt,
        endAt,
        price: option?.price ?? service.price,
        proName: service.proName,
        status: "scheduled",
        notes,
        intake: hasIntake ? intake : null,
      })
      .returning();

    return NextResponse.json(row, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;

  /* Horarios ocupados de un servicio (para bloquear el calendario) */
  if (sp.get("busy")) {
    const [service] = await db.select().from(services).where(eq(services.slug, sp.get("busy")!));
    if (!service) return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const rows = await db
      .select({ startAt: appointments.startAt, endAt: appointments.endAt })
      .from(appointments)
      .where(and(eq(appointments.serviceId, service.id), inArray(appointments.status, ACTIVE), gte(appointments.endAt, since)));
    return NextResponse.json({ busy: rows, durationMin: service.durationMin });
  }

  /* Agenda de un profesional: todas las citas de su servicio */
  if (sp.get("service")) {
    const [service] = await db.select().from(services).where(eq(services.slug, sp.get("service")!));
    if (!service) return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
    const rows = await db
      .select()
      .from(appointments)
      .where(eq(appointments.serviceId, service.id))
      .orderBy(desc(appointments.startAt))
      .limit(60);
    return NextResponse.json({ service, appointments: rows });
  }

  const phone = sp.get("phone");
  if (!phone) return NextResponse.json({ error: "phone o service requerido" }, { status: 400 });
  const rows = await db
    .select()
    .from(appointments)
    .where(eq(appointments.phone, phone))
    .orderBy(desc(appointments.startAt))
    .limit(20);
  return NextResponse.json(rows);
}

/* ── PATCH ──
   { action: "status", id, status }            → agendada | confirmada | completada | cancelada | no asistió
   { action: "availability", serviceId, available } → pausar/activar el servicio en la app */
const APPT_STATUSES = ["scheduled", "confirmed", "completed", "cancelled", "no_show"] as const;

export async function PATCH(req: Request) {
  try {
    const b = await req.json();

    if (b.action === "status") {
      const status = String(b.status);
      if (!APPT_STATUSES.includes(status as (typeof APPT_STATUSES)[number])) {
        return NextResponse.json({ error: "estado inválido" }, { status: 400 });
      }
      const [row] = await db
        .update(appointments)
        .set({ status })
        .where(eq(appointments.id, String(b.id)))
        .returning();
      if (!row) return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
      return NextResponse.json({ ok: true, appointment: row });
    }

    if (b.action === "availability") {
      const [row] = await db
        .update(services)
        .set({ available: !!b.available })
        .where(eq(services.id, Number(b.serviceId)))
        .returning();
      if (!row) return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
      return NextResponse.json({ ok: true, service: row });
    }

    /* Expediente: el profesional guarda su nota clínica / bitácora de la cita */
    if (b.action === "note") {
      const [row] = await db
        .update(appointments)
        .set({
          proNotes: String(b.proNotes ?? "").trim() || null,
          clinicalSnapshot: normalizeClinicalSnapshot(b.clinicalSnapshot),
        })
        .where(eq(appointments.id, String(b.id)))
        .returning();
      if (!row) return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
      return NextResponse.json({ ok: true, appointment: row });
    }

    return NextResponse.json({ error: "acción inválida" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
