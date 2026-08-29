import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { services, serviceOptions, type MedicalVerificationDocs, type UploadedDocument } from "@/db/schema";

export const runtime = "nodejs";

const CATEGORIES = ["belleza", "bienestar", "mascotas", "hogar", "salud"];
const DOC_TYPES = ["certificate", "diploma", "professionalLicense", "ine"] as const;
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const DOC_DIR = path.join(process.cwd(), "public", "uploads", "medical-docs");

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);

const sanitizeFileSegment = (s: string) => slugify(s).replace(/-/g, "-") || "archivo";

const boolish = (value: unknown) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value === "true" || value === "1" || value === "on";
  return !!value;
};

const fileExt = (file: File) => {
  const rawName = file.name?.split(".").pop()?.toLowerCase();
  if (rawName && /^[a-z0-9]+$/.test(rawName)) return rawName;
  if (file.type === "application/pdf") return "pdf";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
};

const allowedMedicalDoc = (file: File) => {
  const ext = fileExt(file);
  return file.type === "application/pdf" || file.type.startsWith("image/") || ["pdf", "png", "jpg", "jpeg", "webp"].includes(ext);
};

const validUpload = (value: FormDataEntryValue | null): File | null => {
  if (!value || typeof value === "string") return null;
  return value.size > 0 ? value : null;
};

async function saveMedicalDoc(file: File, slug: string, label: string): Promise<UploadedDocument> {
  if (!allowedMedicalDoc(file)) {
    throw new Error(`El archivo ${label} debe ser PDF o imagen.`);
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`El archivo ${label} supera el límite de 8 MB.`);
  }

  await mkdir(DOC_DIR, { recursive: true });

  const ext = fileExt(file);
  const fileName = `${slug}-${sanitizeFileSegment(label)}-${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(DOC_DIR, fileName), buffer);

  return {
    name: file.name || `${label}.${ext}`,
    url: `/uploads/medical-docs/${fileName}`,
    type: file.type || "application/octet-stream",
    size: file.size,
  };
}

async function readBody(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    return {
      data: {
        action: String(form.get("action") ?? ""),
        serviceId: String(form.get("serviceId") ?? ""),
        optionId: String(form.get("optionId") ?? ""),
        name: String(form.get("name") ?? ""),
        category: String(form.get("category") ?? ""),
        provider: String(form.get("provider") ?? ""),
        proName: String(form.get("proName") ?? ""),
        description: String(form.get("description") ?? ""),
        price: String(form.get("price") ?? ""),
        durationMin: String(form.get("durationMin") ?? ""),
        domicilio: String(form.get("domicilio") ?? ""),
        local: String(form.get("local") ?? ""),
        includes: String(form.get("includes") ?? ""),
        image: String(form.get("image") ?? ""),
        popular: String(form.get("popular") ?? ""),
        professionalLicenseNumber: String(form.get("professionalLicenseNumber") ?? ""),
      },
      files: {
        certificate: validUpload(form.get("certificate")),
        diploma: validUpload(form.get("diploma")),
        professionalLicense: validUpload(form.get("professionalLicense")),
        ine: validUpload(form.get("ine")),
      },
    };
  }

  return {
    data: await req.json(),
    files: {
      certificate: null,
      diploma: null,
      professionalLicense: null,
      ine: null,
    },
  };
}

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const slug = sp.get("slug");

  if (slug) {
    const [service] = await db.select().from(services).where(eq(services.slug, slug));
    if (!service) return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
    const options = await db
      .select()
      .from(serviceOptions)
      .where(eq(serviceOptions.serviceId, service.id))
      .orderBy(asc(serviceOptions.sort));
    return NextResponse.json({ service, options });
  }

  const list = await db.select().from(services).orderBy(asc(services.sort));
  return NextResponse.json({ services: list });
}

/* POST: agregar opción al menú del negocio O crear un servicio nuevo */
export async function POST(req: Request) {
  try {
    const { data: b, files } = await readBody(req);

    /* ➕ Agregar opción al catálogo / menú del negocio */
    if (b.action === "add_option") {
      const serviceId = Number(b.serviceId);
      const name = String(b.name ?? "").trim();
      const description = String(b.description ?? "").trim();
      const price = Math.round(Number(b.price) || 0);
      const durationMin = Math.round(Number(b.durationMin) || 30);
      const popular = !!b.popular;

      if (!serviceId || !name) {
        return NextResponse.json({ error: "Nombre y servicio son obligatorios." }, { status: 400 });
      }
      if (price < 10) {
        return NextResponse.json({ error: "El precio mínimo es $10 MXN." }, { status: 400 });
      }

      const allOpts = await db
        .select()
        .from(serviceOptions)
        .where(eq(serviceOptions.serviceId, serviceId));
      const maxSort = allOpts.reduce((m, o) => Math.max(m, o.sort), 0);

      const [opt] = await db
        .insert(serviceOptions)
        .values({
          serviceId,
          name,
          description,
          price,
          durationMin,
          popular,
          sort: maxSort + 1,
        })
        .returning();

      return NextResponse.json({ ok: true, option: opt }, { status: 201 });
    }

    /* 🗑️ Eliminar opción del catálogo */
    if (b.action === "delete_option") {
      const optionId = Number(b.optionId);
      if (!optionId) return NextResponse.json({ error: "ID inválido" }, { status: 400 });
      await db.delete(serviceOptions).where(eq(serviceOptions.id, optionId));
      return NextResponse.json({ ok: true });
    }

    /* ➕ Crear nuevo negocio / servicio */
    const name = String(b.name ?? "").trim();
    const category = String(b.category ?? "");
    const provider = String(b.provider ?? "").trim();
    const proName = String(b.proName ?? "").trim();
    const description = String(b.description ?? "").trim();
    const price = Math.round(Number(b.price) || 0);
    const durationMin = Math.round(Number(b.durationMin) || 0);
    const domicilio = boolish(b.domicilio);
    const local = boolish(b.local);
    const includes = (Array.isArray(b.includes) ? b.includes : String(b.includes ?? "").split("\n"))
      .map((x: string) => String(x).trim())
      .filter(Boolean)
      .slice(0, 6);
    const professionalLicenseNumber = String(b.professionalLicenseNumber ?? "").trim();

    if (!name || !provider || !proName) return NextResponse.json({ error: "Nombre del servicio, negocio y profesional son obligatorios." }, { status: 400 });
    if (!CATEGORIES.includes(category)) return NextResponse.json({ error: "Categoría inválida." }, { status: 400 });
    if (price < 10) return NextResponse.json({ error: "El precio mínimo es $10 MXN." }, { status: 400 });
    if (durationMin < 10) return NextResponse.json({ error: "La duración mínima es de 10 minutos." }, { status: 400 });
    if (!domicilio && !local) return NextResponse.json({ error: "Elige al menos una modalidad (domicilio o local)." }, { status: 400 });

    const isMedical = category === "salud";
    if (isMedical) {
      const missing = DOC_TYPES.filter((key) => !files[key]);
      if (!professionalLicenseNumber) {
        return NextResponse.json({ error: "Ingresa el número de cédula profesional del médico." }, { status: 400 });
      }
      if (missing.length > 0) {
        return NextResponse.json({ error: "Para dar de alta médicos debes adjuntar certificado, diploma, cédula profesional e INE." }, { status: 400 });
      }
    }

    /* Slug único */
    const base = slugify(name) || "servicio";
    let slug = base;
    for (let i = 2; ; i++) {
      const [exists] = await db.select({ id: services.id }).from(services).where(eq(services.slug, slug));
      if (!exists) break;
      slug = `${base}-${i}`;
    }

    let verificationDocs: MedicalVerificationDocs | null = null;
    if (isMedical) {
      verificationDocs = {
        certificate: await saveMedicalDoc(files.certificate!, slug, "certificado"),
        diploma: await saveMedicalDoc(files.diploma!, slug, "diploma"),
        professionalLicense: await saveMedicalDoc(files.professionalLicense!, slug, "cedula-profesional"),
        professionalLicenseNumber,
        ine: await saveMedicalDoc(files.ine!, slug, "ine"),
        uploadedAt: new Date().toISOString(),
      };
    }

    /* Foto: hereda la de otro servicio de la misma categoría (URL garantizada) */
    const all = await db.select().from(services).orderBy(asc(services.sort));
    const sibling = all.find((s) => s.category === category) ?? all[0];
    const image = String(b.image ?? "").trim() || sibling?.image || "";
    const maxSort = all.reduce((m, s) => Math.max(m, s.sort), 0);

    const [row] = await db
      .insert(services)
      .values({
        name,
        slug,
        category,
        provider,
        proName,
        description: description || `${name} con ${proName} — agenda tu cita en Rayte.`,
        includes,
        image,
        rating: 5.0,
        ratingCount: 1,
        price,
        durationMin,
        domicilio,
        local,
        available: true,
        verificationDocs,
        sort: maxSort + 1,
      })
      .returning();

    // Crear la primera opción base en el catálogo
    await db.insert(serviceOptions).values({
      serviceId: row.id,
      name: `${name} estándar`,
      description: description || "Servicio completo",
      price,
      durationMin,
      popular: true,
      sort: 1,
    });

    return NextResponse.json({ ok: true, service: row }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno";
    const status = error instanceof Error && (message.includes("8 MB") || message.includes("PDF o imagen")) ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
