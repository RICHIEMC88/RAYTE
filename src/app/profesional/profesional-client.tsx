"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Banknote, CalendarDays, CircleCheck, ClipboardList, Clock3, Home, Lightbulb, MapPin, Phone, Plus, RefreshCw,
  Scissors, HeartPulse, PawPrint, Wrench, Stethoscope, Star, Store, Users, X, XCircle, FileText, AlertTriangle, Trash2, Tag, Check, Sparkles, Search
} from "lucide-react";
import { formatMXN } from "@/lib/utils";
import type { ClinicalSnapshot, MedicalVerificationDocs, Service } from "@/db/schema";

type ServiceLite = Pick<Service, "id" | "name" | "slug" | "category" | "provider" | "proName" | "image" | "rating" | "price" | "durationMin" | "available" | "domicilio" | "local" | "verificationDocs">;

type ServiceOptionItem = {
  id: number;
  serviceId: number;
  name: string;
  description: string;
  price: number;
  durationMin: number;
  popular: boolean;
};

type Appt = {
  id: string;
  code: string;
  serviceId: number;
  serviceName: string;
  optionName: string | null;
  customerName: string;
  phone: string;
  mode: string;
  address: string | null;
  startAt: string;
  endAt: string;
  price: number;
  status: string;
  rating: number | null;
  notes: string | null;
  intake: { edad?: string; sintomas?: string; alergias?: string; medicamentos?: string } | null;
  clinicalSnapshot: ClinicalSnapshot | null;
  proNotes: string | null;
};

/* ============================================================
   Configuración por categoría de servicio (incluye médicos)
   ============================================================ */
type CatConf = {
  label: string;
  emoji: string;
  accent: string;
  soft: string;
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  agendaTitle: string;
  clientNoun: string;
  simLabel: string;
  tips: string[];
  medico?: boolean; // categoría salud: recordatorios clínicos
};

const CATS: Record<string, CatConf> = {
  belleza: {
    label: "Belleza", emoji: "💇", accent: "#db2777", soft: "#fce7f3", Icon: Scissors,
    agendaTitle: "Tu agenda de belleza", clientNoun: "cliente", simLabel: "Simular cita",
    tips: [
      "Confirma la cita 1 hora antes por teléfono: reduce inasistencias a la mitad.",
      "Lleva tu kit completo esterilizado: es lo primero que revisan las reseñas.",
      "Ofrece agendar la siguiente sesión al terminar: clienta recurrente asegurada.",
    ],
  },
  bienestar: {
    label: "Bienestar", emoji: "🧘", accent: "#0d9488", soft: "#ccfbf1", Icon: HeartPulse,
    agendaTitle: "Tu agenda de bienestar", clientNoun: "cliente", simLabel: "Simular sesión",
    tips: [
      "Pregunta lesiones y condiciones físicas ANTES de la primera sesión.",
      "Llega 10 min antes para preparar el espacio (tapetes, aceites, música).",
      "Registra el progreso de cada cliente: es tu mejor argumento de renovación.",
    ],
  },
  mascotas: {
    label: "Mascotas", emoji: "🐾", accent: "#0284c7", soft: "#e0f2fe", Icon: PawPrint,
    agendaTitle: "Tu agenda peluda", clientNoun: "dueño", simLabel: "Simular lomito",
    tips: [
      "Pregunta temperamento y vacunas de la mascota antes de la visita.",
      "Lleva bozal y correa de repuesto: los dueños casi nunca los tienen.",
      "Fotos del antes y después: los dueños las comparten y te traen clientes.",
    ],
  },
  hogar: {
    label: "Hogar", emoji: "🔧", accent: "#FF5A5F", soft: "#ffe9ea", Icon: Wrench,
    agendaTitle: "Tu agenda de servicios", clientNoun: "cliente", simLabel: "Simular visita",
    tips: [
      "Cotiza materiales aparte y por escrito ANTES de empezar el trabajo.",
      "Zapatos con cubrecalzado y lona para muebles: profesionalismo que se nota.",
      "Garantía por escrito de 30 días: cierra más trabajos que cualquier descuento.",
    ],
  },
  salud: {
    label: "Salud · Médicos", emoji: "🩺", accent: "#1d6ae5", soft: "#e8f1fe", Icon: Stethoscope,
    agendaTitle: "Tu agenda médica", clientNoun: "paciente", simLabel: "Simular consulta",
    medico: true,
    tips: [
      "Expediente clínico al día: registra diagnóstico, receta y seguimiento en cada consulta.",
      "Confirma alergias y medicamentos actuales del paciente antes de recetar.",
      "Aviso de privacidad firmado: los datos de salud son información protegida (LFPDPPP).",
      "Si detectas una urgencia real, canaliza a hospital de inmediato — no la atiendas a domicilio.",
    ],
  },
};

const CAT_ORDER = ["salud", "belleza", "bienestar", "hogar", "mascotas"];
const catOf = (c?: string | null) => (c && CATS[c]) || CATS.hogar;

/* Estados de cita */
const APPT_BADGE: Record<string, { label: string; cls: string }> = {
  scheduled: { label: "Agendada", cls: "bg-[#fef4e2] text-[#92600a]" },
  confirmed: { label: "Confirmada", cls: "bg-[#e8f1fe] text-[#1d6ae5]" },
  completed: { label: "Completada", cls: "bg-[#e6f8ee] text-[#0ea55b]" },
  cancelled: { label: "Cancelada", cls: "bg-mist text-ink-soft" },
  no_show: { label: "No asistió", cls: "bg-[#fde8e8] text-[#dc2626]" },
};

const SIM_CLIENTS = ["Ana Sofía P.", "Ricardo M.", "Fernanda L.", "Diego C.", "Paola V.", "El señor Gutiérrez"];
const DOC_ACCEPT = "application/pdf,image/png,image/jpeg,image/webp";

type MedicalDocKey = "certificate" | "diploma" | "professionalLicense" | "ine";

type MedicalDocFiles = Record<MedicalDocKey, File | null>;
type PanelTab = "agenda" | "historial" | "pacientes" | "agendar" | "menu" | "negocio";

const sameJson = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

const MEDICAL_DOC_FIELDS: { key: MedicalDocKey; label: string; hint: string }[] = [
  { key: "certificate", label: "Certificado", hint: "Sube tu certificado o constancia médica." },
  { key: "diploma", label: "Diploma", hint: "Adjunta tu diploma profesional o de especialidad." },
  { key: "professionalLicense", label: "Cédula profesional", hint: "Frente claro de la cédula profesional." },
  { key: "ine", label: "INE", hint: "Identificación oficial vigente del médico." },
];

function fileSizeLabel(size: number) {
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function dateInputValue(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function timeInputValue(date: Date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function nextRoundedTimeValue() {
  const date = new Date(Date.now() + 60 * 60 * 1000);
  date.setSeconds(0, 0);
  const mins = date.getMinutes();
  date.setMinutes(mins <= 30 ? 30 : 0);
  if (mins > 30) date.setHours(date.getHours() + 1);
  return timeInputValue(date);
}

function DocumentPicker({
  label,
  hint,
  accent,
  file,
  onChange,
}: {
  label: string;
  hint: string;
  accent: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-3.5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-black text-ink">{label}</p>
          <p className="mt-0.5 text-[11.5px] font-bold leading-snug text-ink-soft">{hint}</p>
        </div>
        {file ? (
          <span className="shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-black text-white" style={{ backgroundColor: accent }}>
            Listo
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-mist px-2.5 py-1 text-[10.5px] font-black text-ink-soft">Obligatorio</span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={DOC_ACCEPT}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="mt-3 block w-full rounded-2xl border border-dashed bg-mist/40 px-3 py-2.5 text-[12px] font-black text-ink file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-[#1d6ae5] file:px-3.5 file:py-2 file:text-[12px] file:font-black file:text-white hover:file:bg-[#1557c5]"
        style={{ borderColor: `${accent}45`, color: accent } as React.CSSProperties}
      />

      {file && (
        <div className="mt-3 rounded-2xl border border-black/8 bg-mist/60 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white" style={{ backgroundColor: accent }}>
                <Check className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[12.5px] font-black text-ink">{file.name}</p>
                <p className="text-[11px] font-bold text-ink-soft">{fileSizeLabel(file.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onChange(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[11px] font-black text-ink-soft shadow-sm transition hover:text-brand"
            >
              Quitar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

type ClinicalMetricKey = "weightKg" | "heightCm" | "temperatureC" | "systolic" | "diastolic" | "heartRate" | "oxygenSat" | "glucoseMgDl";
type ClinicalDraft = Record<ClinicalMetricKey, string>;

const CLINICAL_FIELDS: {
  key: ClinicalMetricKey;
  label: string;
  shortLabel: string;
  unit: string;
  step?: string;
  min?: number;
  max?: number;
  color: string;
}[] = [
  { key: "weightKg", label: "Peso", shortLabel: "kg", unit: "kg", step: "0.1", min: 1, max: 400, color: "#1d6ae5" },
  { key: "heightCm", label: "Talla", shortLabel: "cm", unit: "cm", step: "0.1", min: 30, max: 250, color: "#7c3aed" },
  { key: "temperatureC", label: "Temperatura", shortLabel: "°C", unit: "°C", step: "0.1", min: 30, max: 45, color: "#ea580c" },
  { key: "systolic", label: "Presión sistólica", shortLabel: "PAS", unit: "mmHg", step: "1", min: 60, max: 260, color: "#dc2626" },
  { key: "diastolic", label: "Presión diastólica", shortLabel: "PAD", unit: "mmHg", step: "1", min: 30, max: 180, color: "#f43f5e" },
  { key: "heartRate", label: "Frecuencia cardiaca", shortLabel: "FC", unit: "lpm", step: "1", min: 20, max: 240, color: "#0891b2" },
  { key: "oxygenSat", label: "Saturación O₂", shortLabel: "SpO₂", unit: "%", step: "1", min: 40, max: 100, color: "#0f766e" },
  { key: "glucoseMgDl", label: "Glucosa", shortLabel: "Glucosa", unit: "mg/dL", step: "1", min: 20, max: 600, color: "#65a30d" },
];

const EMPTY_CLINICAL_DRAFT: ClinicalDraft = {
  weightKg: "",
  heightCm: "",
  temperatureC: "",
  systolic: "",
  diastolic: "",
  heartRate: "",
  oxygenSat: "",
  glucoseMgDl: "",
};

function toClinicalDraft(snapshot?: ClinicalSnapshot | null): ClinicalDraft {
  const draft = { ...EMPTY_CLINICAL_DRAFT };
  for (const field of CLINICAL_FIELDS) {
    const value = snapshot?.[field.key];
    draft[field.key] = typeof value === "number" ? String(value) : "";
  }
  return draft;
}

function numberFromInput(value: string) {
  const normalized = value.replace(/,/g, ".").trim();
  if (!normalized) return null;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

function clinicalSnapshotFromDraft(draft: ClinicalDraft): ClinicalSnapshot | null {
  const snapshot: ClinicalSnapshot = {};
  for (const field of CLINICAL_FIELDS) {
    const value = numberFromInput(draft[field.key]);
    if (value === null) continue;
    snapshot[field.key] = field.step === "0.1" ? Math.round(value * 10) / 10 : Math.round(value);
  }
  return Object.keys(snapshot).length ? snapshot : null;
}

function formatMetricValue(value: number | undefined | null, unit: string) {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  const shown = Number.isInteger(value) ? String(value) : value.toFixed(1);
  return `${shown} ${unit}`;
}

function metricDiff(current: number | undefined, previous: number | undefined) {
  if (typeof current !== "number" || typeof previous !== "number") return null;
  const diff = Math.round((current - previous) * 10) / 10;
  if (!diff) return `Sin cambio`;
  return `${diff > 0 ? "+" : ""}${Number.isInteger(diff) ? diff : diff.toFixed(1)}`;
}

function MetricTrendCard({
  field,
  current,
  previous,
}: {
  field: (typeof CLINICAL_FIELDS)[number];
  current?: number;
  previous?: number;
}) {
  const values = [current, previous].filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  const ceiling = Math.max(...values, field.max ?? 1, 1);
  const currentWidth = current ? Math.max(12, (current / ceiling) * 100) : 0;
  const previousWidth = previous ? Math.max(12, (previous / ceiling) * 100) : 0;
  const diff = metricDiff(current, previous);

  return (
    <div className="rounded-[22px] border border-black/8 bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-ink-soft">{field.shortLabel}</p>
          <p className="mt-1 text-[14px] font-black text-ink">{field.label}</p>
        </div>
        {diff && (
          <span className="rounded-full px-2.5 py-1 text-[10.5px] font-black text-white" style={{ backgroundColor: field.color }}>
            {diff}
          </span>
        )}
      </div>

      <div className="mt-3 space-y-2.5">
        <div>
          <div className="mb-1 flex items-center justify-between gap-2 text-[11.5px] font-bold">
            <span className="text-ink-soft">Actual</span>
            <span className="text-ink">{formatMetricValue(current, field.unit)}</span>
          </div>
          <div className="h-2.5 rounded-full bg-mist">
            {currentWidth > 0 && <div className="h-full rounded-full" style={{ width: `${currentWidth}%`, backgroundColor: field.color }} />}
          </div>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between gap-2 text-[11.5px] font-bold">
            <span className="text-ink-soft">Cita pasada</span>
            <span className="text-ink">{formatMetricValue(previous, field.unit)}</span>
          </div>
          <div className="h-2.5 rounded-full bg-mist">
            {previousWidth > 0 && <div className="h-full rounded-full bg-black/20" style={{ width: `${previousWidth}%` }} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function MedicalVerificationSection({
  docs,
  accent,
  soft,
}: {
  docs?: MedicalVerificationDocs | null;
  accent: string;
  soft: string;
}) {
  const required = [
    { label: "Certificado", doc: docs?.certificate },
    { label: "Diploma", doc: docs?.diploma },
    { label: "Cédula profesional", doc: docs?.professionalLicense },
    { label: "INE", doc: docs?.ine },
  ];
  const completed = required.filter((item) => item.doc).length;

  return (
    <section className="rounded-[26px] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-[15px] font-black">
            <FileText className="h-4.5 w-4.5" style={{ color: accent }} /> Verificación médica
          </p>
          <p className="mt-1 text-[11.5px] font-bold text-ink-soft">Para dar de alta médicos ahora se solicita certificado, diploma, cédula profesional e INE.</p>
        </div>
        <span className="rounded-full px-3 py-1 text-[11px] font-black" style={{ backgroundColor: soft, color: accent }}>
          {completed}/4 docs
        </span>
      </div>

      {docs?.professionalLicenseNumber && (
        <p className="mt-3 rounded-2xl px-3.5 py-2 text-[12px] font-black" style={{ backgroundColor: soft, color: accent }}>
          Cédula registrada: {docs.professionalLicenseNumber}
        </p>
      )}

      <div className="mt-3 space-y-2">
        {required.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3 rounded-2xl border border-black/8 px-3.5 py-3">
            <div className="min-w-0">
              <p className="text-[13px] font-black text-ink">{item.label}</p>
              <p className="truncate text-[11.5px] font-bold text-ink-soft">{item.doc?.name ?? "Pendiente de cargar"}</p>
            </div>
            {item.doc ? (
              <a href={item.doc.url} target="_blank" rel="noreferrer" className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-black text-white transition hover:brightness-110" style={{ backgroundColor: accent }}>
                Ver
              </a>
            ) : (
              <span className="shrink-0 rounded-full bg-[#fde8e8] px-3 py-1.5 text-[11px] font-black text-[#dc2626]">Falta</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Formulario: el socio agrega un servicio o especialidad a su catálogo ── */
function AddOptionModal({
  serviceId,
  accent,
  onClose,
  onAdded,
}: {
  serviceId: number;
  accent: string;
  onClose: () => void;
  onAdded: (opt: ServiceOptionItem) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("45");
  const [popular, setPopular] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!name.trim()) return setError("Escribe el nombre del servicio.");
    if (!price || Number(price) < 10) return setError("El precio mínimo es $10 MXN.");
    setSaving(true);
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_option",
          serviceId,
          name: name.trim(),
          description: description.trim(),
          price: Number(price),
          durationMin: Number(duration) || 30,
          popular,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo guardar.");
        return;
      }
      onAdded(data.option);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-0 backdrop-blur-[2px] sm:items-center sm:p-6" onClick={onClose}>
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 360, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] bg-white sm:rounded-[28px]"
      >
        <div className="flex shrink-0 items-center justify-between px-5 pt-5 pb-3" style={{ borderTop: `4px solid ${accent}` }}>
          <div>
            <p className="text-[18px] font-black tracking-tight">Agregar servicio a tu menú</p>
            <p className="text-[12px] font-bold text-ink-soft">Tus clientes podrán elegirlo al agendar</p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="flex h-9 w-9 items-center justify-center rounded-full bg-mist"><X className="h-4.5 w-4.5" /></button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-5 pb-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del servicio (ej. Corte clásico, Uñas gelish, Consulta pediátrica)"
            className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none focus:border-ink"
          />

          <div className="grid grid-cols-2 gap-2.5">
            <div className="relative">
              <span className="absolute top-3 left-4 text-[14px] font-black text-ink-soft">$</span>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
                inputMode="numeric"
                placeholder="Precio MXN"
                className="w-full rounded-2xl border border-black/10 bg-mist py-3 pr-4 pl-8 text-[14px] font-bold outline-none focus:border-ink"
              />
            </div>
            <div className="relative">
              <input
                value={duration}
                onChange={(e) => setDuration(e.target.value.replace(/[^0-9]/g, ""))}
                inputMode="numeric"
                placeholder="Duración"
                className="w-full rounded-2xl border border-black/10 bg-mist py-3 pr-12 pl-4 text-[14px] font-bold outline-none focus:border-ink"
              />
              <span className="absolute top-3 right-4 text-[12px] font-black text-ink-soft">min</span>
            </div>
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Descripción corta de lo que incluye este servicio..."
            className="w-full resize-none rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[13.5px] font-semibold outline-none focus:border-ink"
          />

          <label className="flex items-center gap-3 rounded-2xl border border-black/10 bg-mist p-3.5 cursor-pointer">
            <input
              type="checkbox"
              checked={popular}
              onChange={(e) => setPopular(e.target.checked)}
              className="h-4.5 w-4.5 accent-ink rounded cursor-pointer"
            />
            <span className="text-[13px] font-black text-ink">Marcar como servicio popular / recomendado</span>
          </label>

          {error && <p className="rounded-2xl bg-brand-soft px-4 py-2.5 text-[13px] font-black text-brand">{error}</p>}
        </div>

        <div className="shrink-0 border-t border-black/5 px-5 py-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={submit}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[14.5px] font-black text-white transition hover:brightness-110 disabled:opacity-60 shadow-md"
            style={{ backgroundColor: accent }}
          >
            <Plus className="h-4.5 w-4.5" /> {saving ? "Guardando..." : "Guardar servicio en mi menú"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Formulario: el negocio da de alta un servicio nuevo ── */
function AddServiceModal({
  onClose,
  onCreated,
  preset,
}: {
  onClose: () => void;
  onCreated: (s: ServiceLite) => void;
  preset?: { category?: string; provider?: string; proName?: string };
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(preset?.category ?? "belleza");
  /* Si viene desde el panel de un negocio, la categoría ya está definida: no se muestra el selector */
  const lockedCategory = !!preset?.category;
  const [provider, setProvider] = useState(preset?.provider ?? "");
  const [proName, setProName] = useState(preset?.proName ?? "");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("60");
  const [description, setDescription] = useState("");
  const [includes, setIncludes] = useState("");
  const [domicilio, setDomicilio] = useState(true);
  const [local, setLocal] = useState(true);
  const [professionalLicenseNumber, setProfessionalLicenseNumber] = useState("");
  const [medicalDocs, setMedicalDocs] = useState<MedicalDocFiles>({
    certificate: null,
    diploma: null,
    professionalLicense: null,
    ine: null,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const conf = catOf(category);
  const isMedical = category === "salud";

  const updateMedicalDoc = (key: MedicalDocKey, file: File | null) => {
    setMedicalDocs((prev) => ({ ...prev, [key]: file }));
  };

  const submit = async () => {
    setError("");

    if (!name.trim() || !provider.trim() || !proName.trim()) {
      return setError("Nombre del servicio, negocio y profesional son obligatorios.");
    }
    if (!price || Number(price) < 10) {
      return setError("El precio mínimo es $10 MXN.");
    }
    if (!duration || Number(duration) < 10) {
      return setError("La duración mínima es de 10 minutos.");
    }
    if (!domicilio && !local) {
      return setError("Elige al menos una modalidad: domicilio o local.");
    }
    if (isMedical) {
      if (!professionalLicenseNumber.trim()) {
        return setError("Escribe el número de cédula profesional.");
      }
      if (MEDICAL_DOC_FIELDS.some((field) => !medicalDocs[field.key])) {
        return setError("Para cuentas médicas debes subir certificado, diploma, cédula profesional e INE.");
      }
    }

    setSaving(true);
    try {
      const form = new FormData();
      form.set("name", name.trim());
      form.set("category", category);
      form.set("provider", provider.trim());
      form.set("proName", proName.trim());
      form.set("price", price);
      form.set("durationMin", duration);
      form.set("description", description.trim());
      form.set("includes", includes);
      form.set("domicilio", String(domicilio));
      form.set("local", String(local));
      if (isMedical) {
        form.set("professionalLicenseNumber", professionalLicenseNumber.trim());
        MEDICAL_DOC_FIELDS.forEach((field) => {
          const file = medicalDocs[field.key];
          if (file) form.set(field.key, file);
        });
      }

      const res = await fetch("/api/services", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No pudimos guardar el servicio.");
        return;
      }
      onCreated(data.service);
    } catch {
      setError("Sin conexión. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-6" onClick={onClose}>
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 360, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] bg-white sm:rounded-[28px]"
      >
        <div className="flex shrink-0 items-center justify-between px-5 pt-5 pb-3" style={{ borderTop: `4px solid ${conf.accent}` }}>
          <div>
            <p className="text-[18px] font-black tracking-tight">Agregar servicio</p>
            <p className="text-[12px] font-bold text-ink-soft">Aparece en la app en cuanto lo guardes</p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="flex h-9 w-9 items-center justify-center rounded-full bg-mist"><X className="h-4.5 w-4.5" /></button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-5 pb-4">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del servicio (ej. Corte y barba premium)" className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none" />

          {!lockedCategory && (
            <div>
              <p className="text-[12px] font-black text-ink-soft uppercase">Categoría</p>
              <div className="no-scrollbar mt-1.5 flex gap-2 overflow-x-auto">
                {CAT_ORDER.map((c) => {
                  const cc = catOf(c);
                  const active = category === c;
                  return (
                    <button key={c} onClick={() => setCategory(c)} className={`shrink-0 rounded-full px-3.5 py-2 text-[12.5px] font-black transition ${active ? "text-white" : "bg-mist text-ink"}`} style={active ? { backgroundColor: cc.accent } : undefined}>
                      {cc.emoji} {cc.label.split(" ")[0]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <input value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="Nombre del negocio" className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none" />
            <input value={proName} onChange={(e) => setProName(e.target.value)} placeholder="Profesional que atiende" className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="relative">
              <span className="absolute top-3 left-4 text-[14px] font-black text-ink-soft">$</span>
              <input value={price} onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" placeholder="Precio MXN" className="w-full rounded-2xl border border-black/10 bg-mist py-3 pr-4 pl-8 text-[14px] font-bold outline-none" />
            </div>
            <div className="relative">
              <input value={duration} onChange={(e) => setDuration(e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" placeholder="Duración" className="w-full rounded-2xl border border-black/10 bg-mist py-3 pr-12 pl-4 text-[14px] font-bold outline-none" />
              <span className="absolute top-3 right-4 text-[12px] font-black text-ink-soft">min</span>
            </div>
          </div>

          <div>
            <p className="text-[12px] font-black text-ink-soft uppercase">Modalidad</p>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <button onClick={() => setDomicilio((v) => !v)} className={`flex items-center justify-center gap-2 rounded-2xl border py-3 text-[13.5px] font-black transition ${domicilio ? "text-white" : "border-black/10 text-ink"}`} style={domicilio ? { backgroundColor: conf.accent, borderColor: conf.accent } : undefined}>
                <Home className="h-4 w-4" /> A domicilio
              </button>
              <button onClick={() => setLocal((v) => !v)} className={`flex items-center justify-center gap-2 rounded-2xl border py-3 text-[13.5px] font-black transition ${local ? "text-white" : "border-black/10 text-ink"}`} style={local ? { backgroundColor: conf.accent, borderColor: conf.accent } : undefined}>
                <Store className="h-4 w-4" /> En local
              </button>
            </div>
          </div>

          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Descripción corta (opcional)" className="w-full resize-none rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[13.5px] font-semibold outline-none" />
          <textarea value={includes} onChange={(e) => setIncludes(e.target.value)} rows={3} placeholder={"¿Qué incluye? Una línea por cosa (opcional)\nEj.\nLavado y secado\nCorte personalizado\nProductos premium"} className="w-full resize-none rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[13.5px] font-semibold outline-none" />

          {isMedical && (
            <div className="space-y-3 rounded-[24px] border border-[#1d6ae5]/15 bg-[#e8f1fe]/55 p-4">
              <div>
                <p className="flex items-center gap-2 text-[14px] font-black text-[#1d6ae5]"><Sparkles className="h-4 w-4" /> Verificación obligatoria para médicos</p>
                <p className="mt-1 text-[11.5px] font-bold leading-snug text-[#3a5f9f]">Antes de crear la cuenta médica deben adjuntar certificado, diploma, cédula profesional e INE.</p>
              </div>

              <input
                value={professionalLicenseNumber}
                onChange={(e) => setProfessionalLicenseNumber(e.target.value)}
                placeholder="Número de cédula profesional"
                className="w-full rounded-2xl border border-[#1d6ae5]/20 bg-white px-4 py-3 text-[14px] font-bold outline-none"
              />

              <div className="grid gap-2.5 sm:grid-cols-2">
                {MEDICAL_DOC_FIELDS.map((field) => (
                  <DocumentPicker
                    key={field.key}
                    label={field.label}
                    hint={field.hint}
                    accent={conf.accent}
                    file={medicalDocs[field.key]}
                    onChange={(file) => updateMedicalDoc(field.key, file)}
                  />
                ))}
              </div>
            </div>
          )}

          {error && <p className="rounded-2xl bg-brand-soft px-4 py-2.5 text-[13px] font-black text-brand">{error}</p>}
        </div>

        <div className="shrink-0 border-t border-black/5 px-5 py-4">
          <motion.button whileTap={{ scale: 0.98 }} onClick={submit} disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[14.5px] font-black text-white transition hover:brightness-110 disabled:opacity-60" style={{ backgroundColor: conf.accent }}>
            <Plus className="h-4.5 w-4.5" /> {saving ? "Guardando..." : "Publicar servicio"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default function ProfesionalClient({ services }: { services: ServiceLite[] }) {
  const [list, setList] = useState<ServiceLite[]>(services);
  const [slug, setSlug] = useState<string | null>(null);
  const [service, setService] = useState<ServiceLite | null>(null);
  const [options, setOptions] = useState<ServiceOptionItem[]>([]);
  const [appts, setAppts] = useState<Appt[]>([]);
  const [simulating, setSimulating] = useState(false);
  const [panelTab, setPanelTab] = useState<PanelTab>("agenda");
  const [showAdd, setShowAdd] = useState(false);
  const [showAddOption, setShowAddOption] = useState(false);
  const [deletingOptionId, setDeletingOptionId] = useState<number | null>(null);
  const [manualName, setManualName] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [manualMode, setManualMode] = useState<"domicilio" | "local">("domicilio");
  const [manualAddress, setManualAddress] = useState("");
  const [manualDate, setManualDate] = useState(() => dateInputValue(new Date()));
  const [manualTime, setManualTime] = useState(() => nextRoundedTimeValue());
  const [manualOptionId, setManualOptionId] = useState("");
  const [manualNotes, setManualNotes] = useState("");
  const [manualEdad, setManualEdad] = useState("");
  const [manualSintomas, setManualSintomas] = useState("");
  const [manualAlergias, setManualAlergias] = useState("");
  const [manualMedicamentos, setManualMedicamentos] = useState("");
  const [manualSaving, setManualSaving] = useState(false);
  const [manualError, setManualError] = useState("");
  const [manualOk, setManualOk] = useState("");
  const [patientQuery, setPatientQuery] = useState("");
  const [noteFor, setNoteFor] = useState<string | null>(null); // cita con el expediente abierto
  const [noteDraft, setNoteDraft] = useState("");
  const [clinicalDraft, setClinicalDraft] = useState<ClinicalDraft>(EMPTY_CLINICAL_DRAFT);
  const [savingNote, setSavingNote] = useState(false);
  const [openClient, setOpenClient] = useState<string | null>(null); // expediente de paciente abierto
  const [detailFor, setDetailFor] = useState<Appt | null>(null); // solicitud detallada abierta
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const pauseLiveRefresh = Boolean(noteFor || detailFor || showAdd || showAddOption);

  useEffect(() => {
    const saved = localStorage.getItem("rayte-profesional");
    if (saved && services.some((s) => s.slug === saved)) setSlug(saved);
  }, [services]);

  /* Al crear un servicio: entra a la lista y abre su panel */
  const handleCreated = (s: ServiceLite) => {
    setList((prev) => [...prev, s]);
    setShowAdd(false);
    setPanelTab("agenda");
    setSlug(s.slug);
  };

  useEffect(() => {
    if (slug) localStorage.setItem("rayte-profesional", slug);
  }, [slug]);

  /* Agenda REAL desde la base de datos + opciones de menú, sondeo cada 6 s */
  const load = useCallback(async (s: string) => {
    try {
      const [apptsRes, servRes] = await Promise.all([
        fetch(`/api/appointments?service=${s}`, { cache: "no-store" }),
        fetch(`/api/services?slug=${s}`, { cache: "no-store" }),
      ]);
      if (apptsRes.ok) {
        const data = await apptsRes.json();
        setService((prev) => (sameJson(prev, data.service) ? prev : data.service));
        setAppts((prev) => (sameJson(prev, data.appointments) ? prev : data.appointments));
      }
      if (servRes.ok) {
        const data = await servRes.json();
        setOptions((prev) => (sameJson(prev, data.options ?? []) ? prev : (data.options ?? [])));
      }
    } catch { /* reintenta */ }
  }, []);

  useEffect(() => {
    if (!slug) return;

    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }

    if (pauseLiveRefresh) {
      return;
    }

    load(slug);
    timer.current = setInterval(() => load(slug), 6000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [slug, load, pauseLiveRefresh]);

  const deleteOption = async (optionId: number) => {
    setDeletingOptionId(optionId);
    try {
      await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_option", optionId }),
      });
      setOptions((prev) => prev.filter((o) => o.id !== optionId));
    } finally {
      setDeletingOptionId(null);
    }
  };

  const setApptStatus = async (a: Appt, status: string) => {
    setAppts((list) => list.map((x) => (x.id === a.id ? { ...x, status } : x)));
    await fetch("/api/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "status", id: a.id, status }),
    });
    if (slug) load(slug);
  };

  const toggleAvailable = async () => {
    if (!service) return;
    const next = !service.available;
    setService({ ...service, available: next });
    await fetch("/api/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "availability", serviceId: service.id, available: next }),
    });
  };

  /* Expediente: guardar nota clínica / bitácora de una cita */
  const openNote = (a: Appt) => {
    setNoteFor(a.id);
    setNoteDraft(a.proNotes ?? "");
    setClinicalDraft(toClinicalDraft(a.clinicalSnapshot));
  };

  const saveNote = async () => {
    if (!noteFor) return;
    const nextSnapshot = clinicalSnapshotFromDraft(clinicalDraft);
    setSavingNote(true);
    try {
      await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "note", id: noteFor, proNotes: noteDraft, clinicalSnapshot: nextSnapshot }),
      });
      setAppts((list) => list.map((x) => (x.id === noteFor ? { ...x, proNotes: noteDraft.trim() || null, clinicalSnapshot: nextSnapshot ? { ...nextSnapshot, updatedAt: new Date().toISOString() } : null } : x)));
      setNoteFor(null);
    } finally {
      setSavingNote(false);
    }
  };

  /* Crea una cita REAL de prueba (hoy, dentro de 1-4 horas) */
  const simulate = async () => {
    if (!service || simulating) return;
    setSimulating(true);
    try {
      const start = new Date(Date.now() + (1 + Math.floor(Math.random() * 4)) * 3600000);
      start.setMinutes(Math.random() > 0.5 ? 30 : 0, 0, 0);
      await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          customerName: SIM_CLIENTS[Math.floor(Math.random() * SIM_CLIENTS.length)],
          phone: "477-000-1111",
          mode: Math.random() > 0.4 ? "domicilio" : "local",
          address: "Cliente de prueba · León, GTO",
          startAt: start.toISOString(),
        }),
      });
      if (slug) await load(slug);
    } finally {
      setSimulating(false);
    }
  };

  const resetManualForm = () => {
    setManualName("");
    setManualPhone("");
    setManualMode("domicilio");
    setManualAddress("");
    setManualDate(dateInputValue(new Date()));
    setManualTime(nextRoundedTimeValue());
    setManualOptionId("");
    setManualNotes("");
    setManualEdad("");
    setManualSintomas("");
    setManualAlergias("");
    setManualMedicamentos("");
    setManualError("");
    setManualOk("");
  };

  const createManualAppointment = async () => {
    if (!service || manualSaving) return;
    setManualError("");
    setManualOk("");

    if (!manualName.trim() || !manualPhone.trim() || !manualDate || !manualTime) {
      setManualError("Completa nombre, teléfono, fecha y hora.");
      return;
    }
    if (manualMode === "domicilio" && !manualAddress.trim()) {
      setManualError("La dirección es obligatoria para citas a domicilio.");
      return;
    }

    const startAt = new Date(`${manualDate}T${manualTime}:00`);
    if (Number.isNaN(startAt.getTime()) || startAt.getTime() <= Date.now()) {
      setManualError("Elige una fecha y hora futuras.");
      return;
    }

    setManualSaving(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          optionId: manualOptionId ? Number(manualOptionId) : undefined,
          customerName: manualName.trim(),
          phone: manualPhone.trim(),
          mode: manualMode,
          address: manualMode === "domicilio" ? manualAddress.trim() : null,
          startAt: startAt.toISOString(),
          notes: manualNotes.trim() || undefined,
          intake: conf.medico
            ? {
                edad: manualEdad.trim() || undefined,
                sintomas: manualSintomas.trim() || undefined,
                alergias: manualAlergias.trim() || undefined,
                medicamentos: manualMedicamentos.trim() || undefined,
              }
            : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setManualError(data.error ?? "No se pudo agendar la cita.");
        return;
      }
      if (slug) await load(slug);
      resetManualForm();
      setPanelTab("agenda");
      setManualOk(`Cita creada: ${data.code ?? data?.appointment?.code ?? data?.id ?? "ok"}`);
    } catch {
      setManualError("Sin conexión. Intenta de nuevo.");
    } finally {
      setManualSaving(false);
    }
  };

  /* ---------- Pantalla 1: elegir servicio (agrupado por categoría) ---------- */
  if (!slug) {
    const grouped = CAT_ORDER.map((c) => ({ c, conf: catOf(c), list: list.filter((s) => s.category === c) })).filter((g) => g.list.length);
    return (
      <div className="min-h-screen bg-white pb-20 sm:pb-24">
        <header className="sticky top-0 z-40 border-b bg-white">
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
            <Link href="/cuenta" aria-label="Volver" className="flex h-9 w-9 items-center justify-center rounded-full bg-mist"><ArrowLeft className="h-5 w-5" /></Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-black tracking-tight">Panel de profesionales</h1>
              <p className="text-[12px] font-bold text-ink-soft">Citas y servicios · ¿quién atiende hoy?</p>
            </div>
            <button onClick={() => setShowAdd(true)} className="flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-3.5 py-2.5 text-[12px] font-black text-white transition hover:bg-black active:scale-95">
              <Plus className="h-4 w-4" /> Agregar servicio
            </button>
          </div>
        </header>
        <div className="mx-auto max-w-3xl px-4 pt-6">
          {grouped.map(({ c, conf, list }) => (
            <div key={c} className="mb-6">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg text-[15px]" style={{ backgroundColor: conf.soft }}>{conf.emoji}</span>
                <p className="text-[13px] font-black tracking-wide uppercase" style={{ color: conf.accent }}>{conf.label} · {list.length}</p>
              </div>
              <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
                {list.map((s) => (
                  <button key={s.slug} onClick={() => { setPanelTab("agenda"); setSlug(s.slug); }} className="flex items-center gap-3 rounded-[22px] border p-3 text-left transition hover:shadow-md" style={{ borderColor: `${conf.accent}33` }}>
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl">
                      <Image src={s.image} alt={s.name} fill className="object-cover" sizes="56px" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14.5px] font-black">{s.name}</p>
                      <p className="truncate text-[12px] font-bold text-ink-soft">{s.proName} · <Star className="mb-0.5 inline h-3 w-3 fill-amber-pop text-amber-pop" /> {s.rating.toFixed(1)}</p>
                      {s.category === "salud" && (
                        <p className={`mt-1 text-[10.5px] font-black ${s.verificationDocs ? "text-[#1d6ae5]" : "text-[#dc2626]"}`}>
                          {s.verificationDocs ? "Documentación médica cargada" : "Faltan documentos médicos"}
                        </p>
                      )}
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[10.5px] font-black ${s.available ? "bg-[#e6f8ee] text-[#0ea55b]" : "bg-mist text-ink-soft"}`}>{s.available ? "Activo" : "Pausado"}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        {showAdd && <AddServiceModal onClose={() => setShowAdd(false)} onCreated={handleCreated} />}
      </div>
    );
  }

  /* ---------- Pantalla 2: panel del profesional ---------- */
  const conf = catOf(service?.category);
  const CatIcon = conf.Icon;

  const today = new Date().toDateString();
  const isActive = (a: Appt) => a.status === "scheduled" || a.status === "confirmed";
  const todayAppts = appts.filter((a) => new Date(a.startAt).toDateString() === today && a.status !== "cancelled");
  const upcoming = appts.filter((a) => isActive(a) && new Date(a.startAt).getTime() >= Date.now()).sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt));
  const history = appts.filter((a) => !isActive(a) || new Date(a.startAt).getTime() < Date.now()).slice(0, 12);
  const ingresos = appts.filter((a) => a.status === "completed" && new Date(a.startAt).toDateString() === today).reduce((x, a) => x + a.price, 0);

  /* Tus clientes/pacientes únicos */
  const clientMap = new Map<string, { name: string; phone: string; count: number }>();
  for (const a of appts) {
    if (a.status === "cancelled") continue;
    const k = a.phone;
    const prev = clientMap.get(k);
    clientMap.set(k, { name: a.customerName, phone: a.phone, count: (prev?.count ?? 0) + 1 });
  }
  const clients = [...clientMap.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "es-MX"));
  const normalizedPatientQuery = patientQuery.trim().toLowerCase();
  const filteredClients = !normalizedPatientQuery
    ? clients
    : clients.filter((client) => `${client.name} ${client.phone}`.toLowerCase().includes(normalizedPatientQuery));
  const noteAppt = noteFor ? appts.find((a) => a.id === noteFor) ?? null : null;
  const notePatientTimeline = noteAppt
    ? appts
        .filter((a) => a.phone === noteAppt.phone && a.status !== "cancelled")
        .sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt))
    : [];
  const notePatientIndex = noteAppt ? notePatientTimeline.findIndex((a) => a.id === noteAppt.id) : -1;
  const previousPatientAppt = notePatientIndex > 0 ? notePatientTimeline[notePatientIndex - 1] : null;
  const currentClinicalSnapshot = clinicalSnapshotFromDraft(clinicalDraft) ?? noteAppt?.clinicalSnapshot ?? null;
  const noteComparisonFields = CLINICAL_FIELDS.filter((field) => {
    const currentValue = currentClinicalSnapshot?.[field.key];
    const previousValue = previousPatientAppt?.clinicalSnapshot?.[field.key];
    return typeof currentValue === "number" || typeof previousValue === "number";
  });
  const tabs: { id: PanelTab; label: string }[] = [
    { id: "agenda", label: "Agenda" },
    { id: "historial", label: "Historial de citas" },
    { id: "pacientes", label: conf.medico ? "Pacientes y expedientes" : "Clientes e historial" },
    { id: "agendar", label: "Agendar" },
    { id: "menu", label: "Servicios" },
    { id: "negocio", label: conf.medico ? "Mis documentos" : "Negocio" },
  ];

  const fmtDay = (iso: string) => {
    const d = new Date(iso);
    const isToday = d.toDateString() === today;
    const isTomorrow = d.toDateString() === new Date(Date.now() + 86400000).toDateString();
    const day = isToday ? "Hoy" : isTomorrow ? "Mañana" : new Intl.DateTimeFormat("es-MX", { weekday: "short", day: "numeric", month: "short" }).format(d);
    return `${day} · ${new Intl.DateTimeFormat("es-MX", { hour: "numeric", minute: "2-digit" }).format(d)}`;
  };

  const renderApptCard = (a: Appt) => {
    const badge = APPT_BADGE[a.status] ?? APPT_BADGE.scheduled;
    const snapshotPreview = CLINICAL_FIELDS.filter((field) => typeof a.clinicalSnapshot?.[field.key] === "number").slice(0, 4);
    return (
      <div key={a.id} className={`rounded-[22px] border p-4 ${a.status === "completed" ? "border-[#0ea55b]/30 bg-[#f2fbf6]" : "border-black/8 bg-white"}`}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[14px] font-black">{a.code} · {a.customerName}</p>
          <span className={`rounded-full px-2.5 py-1 text-[10.5px] font-black ${badge.cls}`}>{badge.label}</span>
        </div>
        <p className="mt-1 flex items-center gap-1.5 text-[12.5px] font-bold text-ink-soft">
          <Clock3 className="h-3.5 w-3.5 shrink-0" style={{ color: conf.accent }} /> {fmtDay(a.startAt)}{a.optionName ? ` · ${a.optionName}` : ` · ${service?.durationMin} min`}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-[12px] font-bold text-ink-soft/90">
          {a.mode === "domicilio" ? <Home className="h-3.5 w-3.5 shrink-0" /> : <Store className="h-3.5 w-3.5 shrink-0" />}
          {a.mode === "domicilio" ? (a.address ?? "A domicilio") : "En el local"} · <Phone className="h-3 w-3 shrink-0" /> {a.phone}
        </p>
        {a.notes && <p className="mt-1 text-[11.5px] font-bold text-ink-soft italic">&quot;{a.notes}&quot;</p>}

        {conf.medico && snapshotPreview.length > 0 && (
          <div className="mt-2 rounded-[18px] border border-[#1d6ae5]/12 bg-[#e8f1fe]/55 p-3">
            <p className="text-[10.5px] font-black uppercase tracking-[0.16em] text-[#1d6ae5]">Datos primordiales</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {snapshotPreview.map((field) => (
                <span key={field.key} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-ink shadow-sm">
                  {field.label}: {formatMetricValue(a.clinicalSnapshot?.[field.key], field.unit)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Expediente / bitácora del profesional */}
        {a.proNotes && noteFor !== a.id && (
          <div className="mt-2 rounded-xl px-3 py-2" style={{ backgroundColor: conf.soft }}>
            <p className="flex items-center gap-1.5 text-[10.5px] font-black uppercase" style={{ color: conf.accent }}>
              <FileText className="h-3 w-3" /> {conf.medico ? "Expediente" : "Bitácora"}
            </p>
            <p className="mt-0.5 text-[12px] leading-snug font-bold whitespace-pre-line text-ink/85">{a.proNotes}</p>
          </div>
        )}
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[14px] font-black">{formatMXN(a.price)}</span>
          <div className="flex flex-wrap justify-end gap-1.5">
            <button onClick={() => setDetailFor(a)} className="flex items-center gap-1.5 rounded-full bg-mist px-3 py-2 text-[11.5px] font-black text-ink transition hover:bg-black/10 active:scale-95">
              <ClipboardList className="h-3.5 w-3.5" /> Ver solicitud
            </button>
            {noteFor !== a.id && a.status !== "cancelled" && (
              <button onClick={() => openNote(a)} className="flex items-center gap-1.5 rounded-full px-3 py-2 text-[11.5px] font-black transition active:scale-95" style={{ backgroundColor: conf.soft, color: conf.accent }}>
                <FileText className="h-3.5 w-3.5" /> {a.proNotes ? "Editar" : conf.medico ? "Expediente" : "Nota"}
              </button>
            )}
            {a.status === "scheduled" && (
              <>
                <button onClick={() => setApptStatus(a, "confirmed")} className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-black text-white transition hover:brightness-110 active:scale-95" style={{ backgroundColor: conf.accent }}>
                  <CircleCheck className="h-3.5 w-3.5" /> Confirmar
                </button>
                <button onClick={() => setApptStatus(a, "cancelled")} aria-label="Cancelar cita" className="flex items-center gap-1 rounded-full bg-mist px-3 py-2 text-[12px] font-black text-ink-soft transition hover:bg-black/10 active:scale-95">
                  <XCircle className="h-3.5 w-3.5" />
                </button>
              </>
            )}
            {a.status === "confirmed" && (
              <>
                <button onClick={() => setApptStatus(a, "completed")} className="flex items-center gap-1.5 rounded-full bg-[#0ea55b] px-3.5 py-2 text-[12px] font-black text-white transition hover:brightness-110 active:scale-95">
                  <CircleCheck className="h-3.5 w-3.5" /> Completada
                </button>
                <button onClick={() => setApptStatus(a, "no_show")} className="rounded-full bg-mist px-3 py-2 text-[11px] font-black text-ink-soft transition hover:bg-black/10 active:scale-95">
                  No asistió
                </button>
              </>
            )}
            {a.status === "completed" && a.rating && (
              <span className="flex items-center gap-1 text-[12px] font-black text-[#0ea55b]">{"★".repeat(a.rating)}</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-mist/50 pb-20 sm:pb-24">
      <header className="sticky top-0 z-40 bg-white shadow-sm" style={{ borderTop: `4px solid ${conf.accent}` }}>
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3.5">
          <Link href="/cuenta" aria-label="Volver" className="flex h-9 w-9 items-center justify-center rounded-full bg-mist"><ArrowLeft className="h-5 w-5" /></Link>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-[19px]" style={{ backgroundColor: conf.soft }}>{conf.emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[16px] font-black tracking-tight">{service?.name ?? "Cargando..."}</p>
            <p className="truncate text-[11.5px] font-black" style={{ color: conf.accent }}>{service?.proName} · Panel {conf.label}</p>
            <p className="truncate text-[10.5px] font-bold text-ink-soft/80">{service?.provider}</p>
          </div>
          <button onClick={() => { setPanelTab("agenda"); setSlug(null); setService(null); setAppts([]); }} className="shrink-0 rounded-full bg-mist px-3.5 py-2 text-[12px] font-black text-ink transition hover:bg-black/10">
            Cambiar
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-4 px-4 pt-5">
        {/* Disponibilidad del servicio */}
        <section className="flex items-center justify-between rounded-[26px] bg-white p-5 shadow-sm">
          <div>
            <p className="text-[13px] font-black text-ink-soft uppercase">Agenda</p>
            <p className={`mt-1 text-[22px] font-black ${service?.available ? "text-[#0ea55b]" : "text-brand"}`}>
              {service?.available ? "Recibiendo citas" : "En pausa"}
            </p>
            <p className="text-[12px] font-bold text-ink-soft">{service?.available ? "Tu servicio aparece en la app" : "Los clientes no pueden agendarte"}</p>
          </div>
          <button
            onClick={toggleAvailable}
            disabled={!service}
            className={`relative h-11 w-20 rounded-full transition disabled:opacity-50 ${service?.available ? "bg-[#0ea55b]" : "bg-black/20"}`}
            aria-label="Cambiar disponibilidad"
          >
            <motion.span layout className={`absolute top-1 h-9 w-9 rounded-full bg-white shadow-md ${service?.available ? "right-1" : "left-1"}`} />
          </button>
        </section>

        {/* Stats del día */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatBox icon={<Banknote className="h-4.5 w-4.5" />} label="Ingresos hoy" value={formatMXN(ingresos)} accentColor={conf.accent} />
          <StatBox icon={<CalendarDays className="h-4.5 w-4.5" />} label={`Citas hoy`} value={String(todayAppts.length)} soft={conf.soft} color={conf.accent} />
          <StatBox icon={<Clock3 className="h-4.5 w-4.5" />} label="Próximas" value={String(upcoming.length)} soft={conf.soft} color={conf.accent} />
          <StatBox icon={<Star className="h-4.5 w-4.5" />} label="Calificación" value={service?.rating.toFixed(1) ?? "—"} soft={conf.soft} color={conf.accent} />
        </section>

        <section className="rounded-[24px] bg-white p-2 shadow-sm">
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const active = panelTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setPanelTab(tab.id)}
                  className={`shrink-0 rounded-full px-4 py-2.5 text-[12.5px] font-black transition ${active ? "text-white shadow-sm" : "bg-mist text-ink-soft hover:text-ink"}`}
                  style={active ? { backgroundColor: conf.accent } : undefined}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </section>

        {panelTab === "agenda" && (
          <section className="rounded-[26px] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-[15px] font-black"><CatIcon className="h-4.5 w-4.5" style={{ color: conf.accent }} /> {conf.agendaTitle} <span className="h-2 w-2 animate-pulse rounded-full bg-[#0ea55b]" /></p>
              <button onClick={simulate} disabled={!service || simulating} className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-black text-white transition hover:brightness-110 disabled:opacity-50" style={{ backgroundColor: conf.accent }}>
                <RefreshCw className={`h-3.5 w-3.5 ${simulating ? "animate-spin" : ""}`} /> {conf.simLabel}
              </button>
            </div>
            <p className="mt-1 text-[11.5px] font-bold text-ink-soft">Las citas nuevas aparecen aquí automáticamente. Si quieres crear una manual, usa la pestaña Agendar.</p>

            {upcoming.length === 0 ? (
              <p className="mt-4 rounded-2xl bg-mist px-4 py-6 text-center text-[13px] font-bold text-ink-soft">
                Sin citas próximas. Agenda una desde la app, usa la pestaña Agendar o toca &quot;{conf.simLabel}&quot;.
              </p>
            ) : (
              <div className="mt-4 space-y-2.5">
                {upcoming.map((a) => renderApptCard(a))}
              </div>
            )}
          </section>
        )}

        {panelTab === "historial" && (
          <section className="rounded-[26px] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4.5 w-4.5" style={{ color: conf.accent }} />
              <p className="text-[15px] font-black">Historial de citas</p>
            </div>
            <p className="mt-1 text-[11.5px] font-bold text-ink-soft">Consultas y servicios anteriores para revisión rápida.</p>
            {history.length === 0 ? (
              <p className="mt-4 rounded-2xl bg-mist px-4 py-6 text-center text-[13px] font-bold text-ink-soft">
                Aún no hay historial reciente.
              </p>
            ) : (
              <div className="mt-4 space-y-2.5">
                {history.map((a) => renderApptCard(a))}
              </div>
            )}
          </section>
        )}

        {/* Tus clientes / pacientes con expediente */}
        {panelTab === "pacientes" && (
          <section className="rounded-[26px] bg-white p-5 shadow-sm">
            <p className="flex items-center gap-2 text-[15px] font-black"><Users className="h-4.5 w-4.5" style={{ color: conf.accent }} /> Tus {conf.clientNoun}s</p>
            <p className="mt-1 text-[11.5px] font-bold text-ink-soft">Toca un {conf.clientNoun} para abrir su {conf.medico ? "expediente clínico" : "historial"}.</p>

            {clients.length > 0 && (
              <div className="mt-3 flex items-center gap-2 rounded-[20px] border border-black/8 bg-mist px-3.5 py-3">
                <Search className="h-4 w-4 shrink-0 text-ink-soft" />
                <input
                  value={patientQuery}
                  onChange={(e) => setPatientQuery(e.target.value)}
                  placeholder={conf.medico ? "Buscar paciente por nombre o teléfono" : "Buscar cliente por nombre o teléfono"}
                  className="w-full bg-transparent text-[13px] font-bold text-ink outline-none placeholder:text-ink-soft/75"
                />
                {patientQuery && (
                  <button
                    type="button"
                    onClick={() => setPatientQuery("")}
                    aria-label="Limpiar búsqueda"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-ink-soft shadow-sm transition hover:text-brand"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}

            {clients.length === 0 ? (
              <p className="mt-4 rounded-2xl bg-mist px-4 py-6 text-center text-[13px] font-bold text-ink-soft">
                Todavía no tienes {conf.medico ? "pacientes" : "clientes"} con historial.
              </p>
            ) : filteredClients.length === 0 ? (
              <p className="mt-4 rounded-2xl bg-mist px-4 py-6 text-center text-[13px] font-bold text-ink-soft">
                No encontramos {conf.medico ? "pacientes" : "clientes"} con “{patientQuery.trim()}”.
              </p>
            ) : (
              <div className="mt-3 space-y-1.5">
                <p className="px-1 text-[11px] font-black uppercase tracking-[0.16em] text-ink-soft/70">
                  {filteredClients.length} {filteredClients.length === 1 ? (conf.medico ? "paciente encontrado" : "cliente encontrado") : (conf.medico ? "pacientes encontrados" : "clientes encontrados")}
                </p>
                {filteredClients.map((c) => {
                  const openRec = openClient === c.phone;
                  const record = appts
                    .filter((a) => a.phone === c.phone && a.status !== "cancelled")
                    .sort((a, b) => +new Date(b.startAt) - +new Date(a.startAt));
                  return (
                    <div key={c.phone} className={`overflow-hidden rounded-2xl border transition ${openRec ? "" : "border-black/8"}`} style={openRec ? { borderColor: `${conf.accent}55` } : undefined}>
                      <button onClick={() => setOpenClient(openRec ? null : c.phone)} className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-black text-white" style={{ backgroundColor: conf.accent }}>
                          {c.name.slice(0, 1).toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13.5px] font-extrabold">{c.name}</p>
                          <p className="text-[11.5px] font-bold text-ink-soft">{c.phone}</p>
                        </div>
                        <span className="shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-black" style={{ backgroundColor: conf.soft, color: conf.accent }}>
                          {c.count} {c.count === 1 ? "cita" : "citas"}
                        </span>
                        <FileText className={`h-4 w-4 shrink-0 transition ${openRec ? "" : "text-ink-soft/50"}`} style={openRec ? { color: conf.accent } : undefined} />
                      </button>

                      {openRec && (
                        <div className="border-t px-3.5 py-3" style={{ borderColor: `${conf.accent}22`, backgroundColor: `${conf.soft}44` }}>
                          <p className="flex items-center gap-1.5 text-[11px] font-black uppercase" style={{ color: conf.accent }}>
                            <FileText className="h-3.5 w-3.5" /> {conf.medico ? "Expediente clínico" : "Historial de servicios"} · {record.length} {record.length === 1 ? "registro" : "registros"}
                          </p>
                          <div className="mt-2 space-y-2">
                            {record.map((a) => {
                              const snapshotPreview = CLINICAL_FIELDS.filter((field) => typeof a.clinicalSnapshot?.[field.key] === "number").slice(0, 4);
                              return (
                              <div key={a.id} className="rounded-xl bg-white p-3 shadow-sm">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-[12px] font-black capitalize">
                                    {new Intl.DateTimeFormat("es-MX", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(a.startAt))}
                                  </p>
                                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${(APPT_BADGE[a.status] ?? APPT_BADGE.scheduled).cls}`}>{(APPT_BADGE[a.status] ?? APPT_BADGE.scheduled).label}</span>
                                </div>
                                <p className="mt-0.5 text-[11.5px] font-bold text-ink-soft">{a.serviceName} · {a.mode === "domicilio" ? "A domicilio" : "En local"} · {formatMXN(a.price)}</p>
                                {conf.medico && snapshotPreview.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {snapshotPreview.map((field) => (
                                      <span key={field.key} className="rounded-full bg-[#e8f1fe] px-2.5 py-1 text-[10.5px] font-black text-[#1d6ae5]">
                                        {field.shortLabel}: {formatMetricValue(a.clinicalSnapshot?.[field.key], field.unit)}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {a.notes && <p className="mt-1 text-[11.5px] font-bold text-ink-soft italic">Motivo: &quot;{a.notes}&quot;</p>}
                                {a.proNotes ? (
                                  <>
                                    <p className="mt-1.5 rounded-lg px-2.5 py-1.5 text-[12px] leading-snug font-bold whitespace-pre-line text-ink/85" style={{ backgroundColor: conf.soft }}>{a.proNotes}</p>
                                    <button onClick={() => openNote(a)} className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-black transition active:scale-95" style={{ backgroundColor: conf.soft, color: conf.accent }}>
                                      <FileText className="h-3.5 w-3.5" /> {conf.medico ? "Editar nota clínica" : "Editar nota"}
                                    </button>
                                  </>
                                ) : (
                                  <button onClick={() => openNote(a)} className="mt-1.5 text-[11.5px] font-black underline-offset-2 hover:underline" style={{ color: conf.accent }}>
                                    + {conf.medico ? "Agregar nota clínica / receta" : "Agregar nota"}
                                  </button>
                                )}
                              </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {conf.medico && (
              <p className="mt-3 flex items-center gap-1.5 text-[11.5px] font-bold text-ink-soft">
                <AlertTriangle className="h-3.5 w-3.5" style={{ color: conf.accent }} /> Datos de pacientes protegidos: no compartas esta lista fuera de la plataforma.
              </p>
            )}
          </section>
        )}

        {panelTab === "agendar" && (
          <section className="rounded-[26px] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4.5 w-4.5" style={{ color: conf.accent }} />
              <p className="text-[15px] font-black">Agendar cita manual</p>
            </div>
            <p className="mt-1 text-[11.5px] font-bold text-ink-soft">Crea una cita desde el panel y aparecerá en la agenda del profesional.</p>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              <input value={manualName} onChange={(e) => setManualName(e.target.value)} placeholder={conf.medico ? "Nombre del paciente" : "Nombre del cliente"} className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none" />
              <input value={manualPhone} onChange={(e) => setManualPhone(e.target.value)} placeholder="Teléfono" className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none" />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={() => setManualMode("domicilio")} className={`rounded-2xl border py-3 text-[13px] font-black transition ${manualMode === "domicilio" ? "text-white" : "border-black/10 text-ink"}`} style={manualMode === "domicilio" ? { backgroundColor: conf.accent, borderColor: conf.accent } : undefined}>
                A domicilio
              </button>
              <button onClick={() => setManualMode("local")} className={`rounded-2xl border py-3 text-[13px] font-black transition ${manualMode === "local" ? "text-white" : "border-black/10 text-ink"}`} style={manualMode === "local" ? { backgroundColor: conf.accent, borderColor: conf.accent } : undefined}>
                En local
              </button>
            </div>

            {manualMode === "domicilio" && (
              <input value={manualAddress} onChange={(e) => setManualAddress(e.target.value)} placeholder="Dirección" className="mt-3 w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none" />
            )}

            <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
              <input type="date" value={manualDate} onChange={(e) => setManualDate(e.target.value)} className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none" />
              <input type="time" value={manualTime} onChange={(e) => setManualTime(e.target.value)} className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none" />
              <select value={manualOptionId} onChange={(e) => setManualOptionId(e.target.value)} className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none">
                <option value="">Servicio base</option>
                {options.map((opt) => (
                  <option key={opt.id} value={String(opt.id)}>{opt.name}</option>
                ))}
              </select>
            </div>

            <textarea value={manualNotes} onChange={(e) => setManualNotes(e.target.value)} rows={2} placeholder="Notas para la cita (opcional)" className="mt-3 w-full resize-none rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[13.5px] font-semibold outline-none" />

            {conf.medico && (
              <div className="mt-3 space-y-2.5 rounded-[24px] border border-[#1d6ae5]/15 bg-[#e8f1fe]/45 p-4">
                <p className="text-[12px] font-black uppercase tracking-wide text-[#1d6ae5]">Datos médicos solicitados</p>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <input value={manualEdad} onChange={(e) => setManualEdad(e.target.value)} placeholder="Edad" className="w-full rounded-2xl border border-[#1d6ae5]/15 bg-white px-4 py-3 text-[14px] font-bold outline-none" />
                  <input value={manualAlergias} onChange={(e) => setManualAlergias(e.target.value)} placeholder="Alergias" className="w-full rounded-2xl border border-[#1d6ae5]/15 bg-white px-4 py-3 text-[14px] font-bold outline-none" />
                </div>
                <textarea value={manualSintomas} onChange={(e) => setManualSintomas(e.target.value)} rows={2} placeholder="Síntomas o motivo de consulta" className="w-full resize-none rounded-2xl border border-[#1d6ae5]/15 bg-white px-4 py-3 text-[13.5px] font-semibold outline-none" />
                <textarea value={manualMedicamentos} onChange={(e) => setManualMedicamentos(e.target.value)} rows={2} placeholder="Medicamentos actuales" className="w-full resize-none rounded-2xl border border-[#1d6ae5]/15 bg-white px-4 py-3 text-[13.5px] font-semibold outline-none" />
              </div>
            )}

            {manualError && <p className="mt-3 rounded-2xl bg-brand-soft px-4 py-2.5 text-[13px] font-black text-brand">{manualError}</p>}
            {manualOk && <p className="mt-3 rounded-2xl bg-[#e6f8ee] px-4 py-2.5 text-[13px] font-black text-[#0ea55b]">{manualOk}</p>}

            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={resetManualForm} className="rounded-full bg-mist px-4 py-3 text-[12.5px] font-black text-ink-soft">
                Limpiar
              </button>
              <button onClick={createManualAppointment} disabled={manualSaving} className="flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-[13.5px] font-black text-white disabled:opacity-50" style={{ backgroundColor: conf.accent }}>
                <CalendarDays className="h-4 w-4" /> {manualSaving ? "Agendando..." : "Guardar cita"}
              </button>
            </div>
          </section>
        )}

        {panelTab === "negocio" && conf.medico && (
          <MedicalVerificationSection docs={service?.verificationDocs} accent={conf.accent} soft={conf.soft} />
        )}

        {/* Consejos de la categoría */}
        {panelTab === "negocio" && (
        <section className="rounded-[26px] p-5" style={{ backgroundColor: conf.soft }}>
          <p className="flex items-center gap-2 text-[14px] font-black" style={{ color: conf.accent }}>
            <Lightbulb className="h-4.5 w-4.5" /> {conf.medico ? "Buenas prácticas médicas" : `Consejos de ${conf.label.toLowerCase()}`}
          </p>
          <ul className="mt-2.5 space-y-2">
            {conf.tips.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-[12.5px] font-bold text-ink/80">
                <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white" style={{ backgroundColor: conf.accent }}>{i + 1}</span>
                {t}
              </li>
            ))}
          </ul>
        </section>
        )}

        {/* Catálogo y Menú de Servicios del Negocio */}
        {panelTab === "menu" && (
        <section className="rounded-[26px] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="flex items-center gap-2 text-[15px] font-black">
                <Tag className="h-4.5 w-4.5" style={{ color: conf.accent }} /> Menú de servicios ({options.length})
              </p>
              <p className="text-[11.5px] font-bold text-ink-soft">Agrega, edita y gestiona las especialidades que ofreces</p>
            </div>
            {service && (
              <button
                onClick={() => setShowAddOption(true)}
                className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-black text-white transition hover:brightness-110 active:scale-95 shadow-sm"
                style={{ backgroundColor: conf.accent }}
              >
                <Plus className="h-4 w-4" /> Agregar servicio
              </button>
            )}
          </div>

          <div className="mt-4 space-y-2">
            {options.length === 0 ? (
              <p className="rounded-2xl bg-mist px-4 py-6 text-center text-[13px] font-bold text-ink-soft">
                Aún no has agregado especialidades a tu menú. Toca &quot;+ Agregar servicio&quot;.
              </p>
            ) : (
              options.map((opt) => (
                <div
                  key={opt.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border p-3.5 transition hover:border-black/25"
                  style={{ borderColor: opt.popular ? `${conf.accent}44` : "rgba(0,0,0,0.08)", backgroundColor: opt.popular ? `${conf.soft}33` : undefined }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[14px] font-black text-ink">{opt.name}</p>
                      {opt.popular && (
                        <span className="rounded-full px-2 py-0.5 text-[9.5px] font-black text-white shadow-xs" style={{ backgroundColor: conf.accent }}>
                          Popular
                        </span>
                      )}
                    </div>
                    {opt.description && <p className="mt-0.5 line-clamp-1 text-[12px] font-semibold text-ink-soft">{opt.description}</p>}
                    <p className="mt-1 flex items-center gap-2 text-[12px] font-bold text-ink-soft">
                      <span className="font-black text-ink" style={{ color: conf.accent }}>{formatMXN(opt.price)}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Clock3 className="h-3 w-3" /> {opt.durationMin} min</span>
                    </p>
                  </div>
                  <button
                    onClick={() => deleteOption(opt.id)}
                    disabled={deletingOptionId === opt.id}
                    aria-label={`Eliminar ${opt.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-mist text-ink-soft transition hover:bg-rose-50 hover:text-rose-600 active:scale-90 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
        )}

        {/* Datos generales del negocio */}
        {panelTab === "negocio" && (
        <section className="rounded-[26px] bg-white p-5 shadow-sm">
          <p className="text-[15px] font-black">Tu negocio</p>
          <div className="mt-3 space-y-2 text-[13.5px] font-bold">
            <p className="flex justify-between"><span className="text-ink-soft">Negocio</span><span className="font-black text-ink">{service?.provider}</span></p>
            <p className="flex justify-between"><span className="text-ink-soft">Profesional</span><span className="font-black text-ink">{service?.proName}</span></p>
            <p className="flex justify-between"><span className="text-ink-soft">Tarifa base</span><span className="font-black" style={{ color: conf.accent }}>{formatMXN(service?.price ?? 0)}</span></p>
            <p className="flex justify-between"><span className="text-ink-soft">Modalidad</span><span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" style={{ color: conf.accent }} /> {service?.domicilio ? "Domicilio" : ""} {service?.local ? "y Local" : ""}</span></p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border-2 border-dashed py-3 text-[13.5px] font-black transition hover:bg-mist/60 active:scale-[0.98]"
            style={{ borderColor: `${conf.accent}55`, color: conf.accent }}
          >
            <Plus className="h-4.5 w-4.5" /> Registrar otro negocio / sucursal
          </button>
        </section>
        )}

        <p className="pb-2 text-center text-[11px] font-black tracking-widest text-ink-soft/60 uppercase">Panel {conf.label} · Profesionales Rayte</p>
      </div>

      {showAdd && (
        <AddServiceModal
          onClose={() => setShowAdd(false)}
          onCreated={handleCreated}
          preset={{ category: service?.category, provider: service?.provider, proName: service?.proName }}
        />
      )}

      {showAddOption && service && (
        <AddOptionModal
          serviceId={service.id}
          accent={conf.accent}
          onClose={() => setShowAddOption(false)}
          onAdded={(opt) => {
            setOptions((prev) => [...prev, opt]);
            setShowAddOption(false);
          }}
        />
      )}

      {noteAppt && (
        <div className="fixed inset-0 z-[84] flex items-end justify-center bg-black/55 backdrop-blur-[2px] sm:items-center sm:p-6" onClick={() => setNoteFor(null)}>
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px]"
          >
            <div className="flex shrink-0 items-start justify-between gap-3 px-5 pt-5 pb-3" style={{ borderTop: `4px solid ${conf.accent}` }}>
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-[17px] font-black tracking-tight"><FileText className="h-4.5 w-4.5" style={{ color: conf.accent }} /> {conf.medico ? "Expediente clínico" : "Bitácora del servicio"}</p>
                <p className="mt-1 text-[12px] font-bold text-ink-soft">{noteAppt.code} · {noteAppt.customerName} · {fmtDay(noteAppt.startAt)}</p>
                <p className="text-[11px] font-bold text-ink-soft">La actualización automática se pausa mientras escribes.</p>
              </div>
              <button onClick={() => setNoteFor(null)} aria-label="Cerrar expediente" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mist">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-5 pb-5">
              <div className="rounded-2xl border border-black/8 bg-mist/40 p-4">
                <p className="text-[11px] font-black tracking-widest text-ink-soft uppercase">Resumen de la solicitud</p>
                <div className="mt-2 space-y-1.5 text-[13px] font-bold text-ink">
                  <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" style={{ color: conf.accent }} /> {noteAppt.phone}</p>
                  <p className="flex items-center gap-2">{noteAppt.mode === "domicilio" ? <Home className="h-3.5 w-3.5" style={{ color: conf.accent }} /> : <Store className="h-3.5 w-3.5" style={{ color: conf.accent }} />}{noteAppt.mode === "domicilio" ? (noteAppt.address ?? "A domicilio") : "En el local"}</p>
                  {noteAppt.optionName && <p className="flex items-center gap-2"><ClipboardList className="h-3.5 w-3.5" style={{ color: conf.accent }} /> {noteAppt.optionName}</p>}
                </div>
              </div>

              {(noteAppt.intake?.sintomas || noteAppt.intake?.alergias || noteAppt.intake?.medicamentos || noteAppt.notes) && (
                <div className="rounded-2xl border border-[#1d6ae5]/15 bg-[#e8f1fe]/45 p-4">
                  <p className="text-[11px] font-black tracking-widest uppercase text-[#1d6ae5]">Lo que pidió el paciente</p>
                  <div className="mt-2 space-y-2 text-[12.5px] font-bold text-ink">
                    {noteAppt.intake?.sintomas && <p><span className="text-ink-soft">Síntomas:</span> {noteAppt.intake.sintomas}</p>}
                    {noteAppt.intake?.alergias && <p><span className="text-ink-soft">Alergias:</span> {noteAppt.intake.alergias}</p>}
                    {noteAppt.intake?.medicamentos && <p><span className="text-ink-soft">Medicamentos:</span> {noteAppt.intake.medicamentos}</p>}
                    {noteAppt.notes && <p><span className="text-ink-soft">Notas:</span> {noteAppt.notes}</p>}
                  </div>
                </div>
              )}

              {conf.medico && (
                <>
                  <div className="rounded-[24px] border border-[#1d6ae5]/15 bg-[#f8fbff] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-black tracking-widest uppercase text-[#1d6ae5]">Datos primordiales del paciente</p>
                        <p className="mt-1 text-[12px] font-bold text-[#45649d]">Guárdalos por cita para que después se puedan ver como gráficas y comparar con consultas pasadas.</p>
                      </div>
                      {noteAppt.clinicalSnapshot?.updatedAt && (
                        <span className="rounded-full bg-white px-3 py-1 text-[10.5px] font-black text-[#1d6ae5] shadow-sm">
                          Última captura: {new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(noteAppt.clinicalSnapshot.updatedAt))}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                      {CLINICAL_FIELDS.map((field) => (
                        <label key={field.key} className="rounded-[20px] border border-black/8 bg-white px-3.5 py-3 shadow-sm">
                          <span className="text-[11px] font-black uppercase tracking-[0.16em] text-ink-soft">{field.shortLabel}</span>
                          <span className="mt-1 block text-[13px] font-black text-ink">{field.label}</span>
                          <div className="mt-2 flex items-center gap-2 rounded-2xl bg-mist px-3 py-2.5">
                            <input
                              value={clinicalDraft[field.key]}
                              onChange={(e) => setClinicalDraft((prev) => ({ ...prev, [field.key]: e.target.value.replace(/[^0-9.,]/g, "") }))}
                              inputMode={field.step === "0.1" ? "decimal" : "numeric"}
                              placeholder="0"
                              className="w-full bg-transparent text-[14px] font-black text-ink outline-none"
                            />
                            <span className="text-[11px] font-black text-ink-soft">{field.unit}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-black/8 bg-white p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-black tracking-widest uppercase text-ink-soft">Comparativa con cita pasada</p>
                        <p className="mt-1 text-[12px] font-bold text-ink-soft">
                          {previousPatientAppt ? `Comparando contra ${fmtDay(previousPatientAppt.startAt)}.` : "Aún no hay una cita anterior guardada para este paciente."}
                        </p>
                      </div>
                      {previousPatientAppt && (
                        <span className="rounded-full px-3 py-1 text-[10.5px] font-black text-white" style={{ backgroundColor: conf.accent }}>
                          {notePatientTimeline.length} citas
                        </span>
                      )}
                    </div>

                    {noteComparisonFields.length > 0 ? (
                      <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                        {noteComparisonFields.map((field) => (
                          <MetricTrendCard
                            key={field.key}
                            field={field}
                            current={currentClinicalSnapshot?.[field.key]}
                            previous={previousPatientAppt?.clinicalSnapshot?.[field.key]}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="mt-3 rounded-2xl bg-mist px-4 py-4 text-[12.5px] font-bold text-ink-soft">
                        Captura al menos un dato primordial para habilitar la comparativa rápida del expediente.
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="rounded-[24px] border-2 p-3" style={{ borderColor: `${conf.accent}33` }}>
                <p className="mb-2 text-[11px] font-black tracking-widest uppercase" style={{ color: conf.accent }}>
                  {conf.medico ? "Escribe diagnóstico, receta, indicaciones y seguimiento" : "Escribe observaciones del servicio"}
                </p>
                <textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  rows={10}
                  autoFocus
                  placeholder={conf.medico ? "Diagnóstico, receta (medicamento y dosis), indicaciones y seguimiento..." : "Notas del servicio: qué se hizo, observaciones, próxima visita..."}
                  className="w-full resize-none rounded-2xl bg-mist px-4 py-3 text-[13px] font-bold leading-relaxed outline-none"
                />
              </div>
            </div>

            <div className="flex shrink-0 gap-2 border-t border-black/5 px-5 py-4">
              <button onClick={() => setNoteFor(null)} className="rounded-full bg-mist px-4 py-3 text-[12.5px] font-black text-ink-soft">
                Cancelar
              </button>
              <button onClick={saveNote} disabled={savingNote} className="flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-[13.5px] font-black text-white disabled:opacity-50" style={{ backgroundColor: conf.accent }}>
                <FileText className="h-4 w-4" /> {savingNote ? "Guardando..." : conf.medico ? "Guardar en expediente" : "Guardar nota"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Solicitud detallada del paciente ── */}
      {detailFor && (
        <div className="fixed inset-0 z-[85] flex items-end justify-center bg-black/50 backdrop-blur-[2px] sm:items-center sm:p-6" onClick={() => setDetailFor(null)}>
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] bg-white sm:rounded-[28px]"
          >
            <div className="flex shrink-0 items-start justify-between px-5 pt-5 pb-3" style={{ borderTop: `4px solid ${conf.accent}` }}>
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-[17px] font-black tracking-tight"><ClipboardList className="h-4.5 w-4.5" style={{ color: conf.accent }} /> Solicitud del {conf.clientNoun}</p>
                <p className="text-[12px] font-bold text-ink-soft">{detailFor.code} · {(APPT_BADGE[detailFor.status] ?? APPT_BADGE.scheduled).label}</p>
              </div>
              <button onClick={() => setDetailFor(null)} aria-label="Cerrar" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mist"><X className="h-4.5 w-4.5" /></button>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-5 pb-5">
              {/* Datos del paciente */}
              <div className="rounded-2xl border border-black/8 p-4">
                <p className="text-[11px] font-black tracking-widest text-ink-soft uppercase">{conf.medico ? "Paciente" : "Cliente"}</p>
                <div className="mt-2 space-y-1.5 text-[13.5px] font-bold">
                  <p className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-black text-white" style={{ backgroundColor: conf.accent }}>{detailFor.customerName[0]?.toUpperCase()}</span> {detailFor.customerName}{detailFor.intake?.edad ? ` · ${detailFor.intake.edad} años` : ""}</p>
                  <p className="flex items-center gap-2 text-ink-soft"><Phone className="h-3.5 w-3.5" style={{ color: conf.accent }} /> {detailFor.phone}</p>
                </div>
              </div>

              {/* Detalles de la cita */}
              <div className="rounded-2xl border border-black/8 p-4">
                <p className="text-[11px] font-black tracking-widest text-ink-soft uppercase">Cita solicitada</p>
                <div className="mt-2 space-y-1.5 text-[13px] font-bold text-ink">
                  <p className="flex items-center gap-2 capitalize"><CalendarDays className="h-3.5 w-3.5 shrink-0" style={{ color: conf.accent }} /> {new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" }).format(new Date(detailFor.startAt))}</p>
                  <p className="flex items-center gap-2"><Clock3 className="h-3.5 w-3.5 shrink-0" style={{ color: conf.accent }} /> {detailFor.optionName ? `${detailFor.optionName} · ` : ""}{detailFor.serviceName} · {formatMXN(detailFor.price)}</p>
                  <p className="flex items-center gap-2">{detailFor.mode === "domicilio" ? <Home className="h-3.5 w-3.5 shrink-0" style={{ color: conf.accent }} /> : <Store className="h-3.5 w-3.5 shrink-0" style={{ color: conf.accent }} />} {detailFor.mode === "domicilio" ? "A domicilio" : "En el local"}</p>
                  {detailFor.mode === "domicilio" && detailFor.address && (
                    <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: conf.accent }} /> {detailFor.address}</p>
                  )}
                </div>
              </div>

              {/* Información clínica que llenó el paciente */}
              {detailFor.intake && (detailFor.intake.sintomas || detailFor.intake.alergias || detailFor.intake.medicamentos) && (
                <div className="rounded-2xl border-2 p-4" style={{ borderColor: `${conf.accent}44`, backgroundColor: `${conf.soft}55` }}>
                  <p className="text-[11px] font-black tracking-widest uppercase" style={{ color: conf.accent }}>🩺 Información del paciente</p>
                  <div className="mt-2 space-y-2.5">
                    {detailFor.intake.sintomas && (
                      <div>
                        <p className="text-[11px] font-black text-ink-soft uppercase">Síntomas / motivo</p>
                        <p className="mt-0.5 text-[13.5px] leading-snug font-bold whitespace-pre-line">{detailFor.intake.sintomas}</p>
                      </div>
                    )}
                    {detailFor.intake.alergias && (
                      <div className="rounded-xl bg-[#fde8e8] px-3 py-2">
                        <p className="flex items-center gap-1.5 text-[11px] font-black text-[#dc2626] uppercase"><AlertTriangle className="h-3.5 w-3.5" /> Alergias</p>
                        <p className="mt-0.5 text-[13.5px] font-black text-[#7f1d1d]">{detailFor.intake.alergias}</p>
                      </div>
                    )}
                    {detailFor.intake.medicamentos && (
                      <div>
                        <p className="text-[11px] font-black text-ink-soft uppercase">Medicamentos actuales</p>
                        <p className="mt-0.5 text-[13.5px] font-bold">{detailFor.intake.medicamentos}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {conf.medico && detailFor.clinicalSnapshot && (
                <div className="rounded-[24px] border border-[#1d6ae5]/15 bg-[#f8fbff] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-black tracking-widest uppercase text-[#1d6ae5]">Datos primordiales guardados</p>
                      <p className="mt-1 text-[12px] font-bold text-[#45649d]">Este bloque ya quedó listo para futuras gráficas y comparativas.</p>
                    </div>
                    {detailFor.clinicalSnapshot.updatedAt && (
                      <span className="rounded-full bg-white px-3 py-1 text-[10.5px] font-black text-[#1d6ae5] shadow-sm">
                        {new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(detailFor.clinicalSnapshot.updatedAt))}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {CLINICAL_FIELDS.filter((field) => typeof detailFor.clinicalSnapshot?.[field.key] === "number").map((field) => (
                      <div key={field.key} className="rounded-2xl border border-black/8 bg-white px-3.5 py-3 shadow-sm">
                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-ink-soft">{field.shortLabel}</p>
                        <p className="mt-1 text-[13px] font-black text-ink">{field.label}</p>
                        <p className="mt-2 text-[18px] font-black" style={{ color: field.color }}>{formatMetricValue(detailFor.clinicalSnapshot?.[field.key], field.unit)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notas generales del cliente */}
              {detailFor.notes && (
                <div className="rounded-2xl border border-black/8 p-4">
                  <p className="text-[11px] font-black tracking-widest text-ink-soft uppercase">Notas del {conf.clientNoun}</p>
                  <p className="mt-1 text-[13.5px] font-bold text-ink italic">&quot;{detailFor.notes}&quot;</p>
                </div>
              )}

              {/* Expediente ya escrito */}
              {detailFor.proNotes && (
                <div className="rounded-2xl p-4" style={{ backgroundColor: conf.soft }}>
                  <p className="flex items-center gap-1.5 text-[11px] font-black tracking-widest uppercase" style={{ color: conf.accent }}><FileText className="h-3.5 w-3.5" /> {conf.medico ? "Expediente" : "Bitácora"}</p>
                  <p className="mt-1 text-[13px] leading-snug font-bold whitespace-pre-line text-ink/85">{detailFor.proNotes}</p>
                </div>
              )}
            </div>

            <div className="flex shrink-0 gap-2 border-t border-black/5 px-5 py-4">
              {detailFor.status === "scheduled" && (
                <button onClick={() => { setApptStatus(detailFor, "confirmed"); setDetailFor(null); }} className="flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-[13.5px] font-black text-white transition hover:brightness-110" style={{ backgroundColor: conf.accent }}>
                  <CircleCheck className="h-4 w-4" /> Confirmar cita
                </button>
              )}
              <button onClick={() => { openNote(detailFor); setDetailFor(null); }} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ink py-3 text-[13.5px] font-black text-white transition hover:bg-black">
                <FileText className="h-4 w-4" /> {detailFor.proNotes ? "Editar expediente" : conf.medico ? "Abrir expediente" : "Agregar nota"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function StatBox({ icon, label, value, accentColor, soft, color }: { icon: React.ReactNode; label: string; value: string; accentColor?: string; soft?: string; color?: string }) {
  if (accentColor) {
    return (
      <div className="rounded-[22px] p-4 text-white shadow-sm" style={{ backgroundColor: accentColor }}>
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">{icon}</span>
        <p className="mt-2 text-[11px] font-black text-white/80 uppercase">{label}</p>
        <p className="text-[16px] font-black">{value}</p>
      </div>
    );
  }
  return (
    <div className="rounded-[22px] bg-white p-4 shadow-sm">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ backgroundColor: soft, color }}>{icon}</span>
      <p className="mt-2 text-[11px] font-black text-ink-soft uppercase">{label}</p>
      <p className="text-[16px] font-black text-ink">{value}</p>
    </div>
  );
}
