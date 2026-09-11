import ical from "ical.js";

/* Sincronización con el calendario del negocio (Google Calendar, Outlook, etc.)
   vía enlace ICS privado. Convierte los eventos en "horarios ocupados" que el
   calendario de reservas de Rayte bloquea.

   - Los horarios se interpretan con la zona horaria del evento (IANA); los
     tiempos "flotantes" (sin zona) se asumen en America/Mexico_City.
   - Los eventos se cachean 10 min por URL para no martillear el calendario.
   - Se cubre la ventana del calendario de Rayte (12 meses). */

export type BusySlot = { start: number; end: number };

const FLOAT_TZ = "America/Mexico_City";
const TTL_MS = 10 * 60 * 1000;
const MAX_OCCURRENCES = 4000;

const g = globalThis as typeof globalThis & { __icsBusyCache?: Map<string, { at: number; busy: BusySlot[] }> };
const cache = g.__icsBusyCache ?? (g.__icsBusyCache = new Map<string, { at: number; busy: BusySlot[] }>());

/* ────────────────────────── zona horaria vía Intl ────────────────────────── */

const fmtCache = new Map<string, Intl.DateTimeFormat>();
function fmtFor(tz: string): Intl.DateTimeFormat {
  let f = fmtCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    fmtCache.set(tz, f);
  }
  return f;
}

function offsetInTz(ms: number, tz: string): number {
  const parts = fmtFor(tz).formatToParts(new Date(ms));
  const num = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return Date.UTC(num("year"), num("month") - 1, num("day"), num("hour") % 24, num("minute"), num("second")) - ms;
}

type Wall = { y: number; mo: number; d: number; h: number; mi: number; s: number; tz: string; allDay: boolean };

function zonedToEpoch(w: Wall): number {
  if (w.tz === "UTC") return Date.UTC(w.y, w.mo - 1, w.d, w.h, w.mi, w.s);
  try {
    const guess = Date.UTC(w.y, w.mo - 1, w.d, w.h, w.mi, w.s);
    const off1 = offsetInTz(guess, w.tz);
    const epoch = guess - off1;
    const off2 = offsetInTz(epoch, w.tz);
    return off2 === off1 ? epoch : guess - off2;
  } catch {
    // zona IANA desconocida → la tratamos como UTC
    return Date.UTC(w.y, w.mo - 1, w.d, w.h, w.mi, w.s);
  }
}

function parseWall(value: unknown, params?: Record<string, string>): Wall | null {
  const v = String(value ?? "").trim().replace(/[-T:]/g, "");
  const tzid = params ? (params.TZID ?? params.tzid) : undefined;
  if (!/^\d{8}(\d{6})?Z?$/.test(v)) return null;
  const y = +v.slice(0, 4);
  const mo = +v.slice(4, 6);
  const d = +v.slice(6, 8);
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || y < 1970 || y > 2100) return null;
  const hasTime = v.length > 8;
  const h = hasTime ? +v.slice(8, 10) : 0;
  const mi = hasTime ? +v.slice(10, 12) : 0;
  const s = hasTime ? +v.slice(12, 14) : 0;
  if (hasTime && (h > 23 || mi > 59 || s > 59)) return null;
  const tz = v.endsWith("Z") ? "UTC" : (tzid ?? FLOAT_TZ);
  return { y, mo, d, h, mi, s, tz, allDay: !hasTime };
}

/* ─────────────────────────── expansión RRULE ─────────────────────────── */

const wdOf = (y: number, mo: number, d: number) => new Date(Date.UTC(y, mo - 1, d)).getUTCDay(); // 0=Dom
const daysInMonth = (y: number, mo: number) => new Date(Date.UTC(y, mo, 0)).getUTCDate();
const WD_NAMES = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

function monthAdd(y: number, mo: number, n: number): { y: number; mo: number } {
  const total = y * 12 + (mo - 1) + n;
  return { y: Math.floor(total / 12), mo: (total % 12) + 1 };
}

/** Expande una RRULE en fechas-pared (sin zona) entre ahora y windowEnd. */
/* ical.js entrega la RRULE ya hidratada (objeto) o como string "FREQ=...".
   Normalizamos a string. */
function rruleToString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const o = value as Record<string, unknown>;
    const parts: string[] = [];
    const push = (k: string, v: unknown) => {
      if (v === undefined || v === null) return;
      let val: unknown = v;
      if (typeof v === "object" && "toICAL" in (v as object)) val = (v as { toICAL: () => unknown }).toICAL();
      const s = Array.isArray(val) ? val.join(",") : String(val);
      if (s) parts.push(`${k}=${s}`);
    };
    push("FREQ", o.freq);
    push("UNTIL", o.until);
    push("COUNT", o.count);
    push("INTERVAL", o.interval);
    push("BYDAY", o.byday);
    push("BYMONTHDAY", o.bymonthday);
    push("BYMONTH", o.bymonth);
    push("WKST", o.wkst);
    return parts.join(";");
  }
  return "";
}

function expandRrule(dt: Wall, rrule: string, windowStart: number, windowEnd: number): Wall[] {
  const rules: Record<string, string> = {};
  for (const part of String(rrule).split(";")) {
    const i = part.indexOf("=");
    if (i > 0) rules[part.slice(0, i).trim().toUpperCase()] = part.slice(i + 1).trim();
  }
  const freq = rules.FREQ;
  if (!freq) return [];
  const dtEpoch = zonedToEpoch(dt);
  const interval = Math.max(1, Number(rules.INTERVAL) || 1);
  const count = rules.COUNT ? Math.max(1, Number(rules.COUNT) || 1) : Infinity;
  const untilWall = rules.UNTIL ? parseWall(rules.UNTIL, {}) : null;
  const until = untilWall ? zonedToEpoch(untilWall) : null;

  const out: Wall[] = [];
  const push = (w: Wall) => {
    if (out.length >= count) return;
    const ep = zonedToEpoch(w);
    if (ep < dtEpoch) return; // una recurrencia no retrocede antes de su DTSTART
    if (ep + 86400e3 < windowStart) return;
    if (ep > windowEnd) return;
    if (until !== null && ep > until) return;
    out.push(w);
  };
  const at = (y: number, mo: number, d: number): Wall => ({ ...dt, y, mo, d });
  const stop = (ep: number) => (until !== null && ep > until) || ep > windowEnd;

  if (freq === "DAILY") {
    for (let i = 0; i < 3000 && out.length < count; i++) {
      const steps = i * interval;
      const date = new Date(Date.UTC(dt.y, dt.mo - 1, dt.d + steps));
      const w = at(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
      const ep = zonedToEpoch(w);
      if (stop(ep)) break;
      push(w);
      if (out.length >= MAX_OCCURRENCES) break;
    }
  } else if (freq === "WEEKLY") {
    const startWd = wdOf(dt.y, dt.mo, dt.d);
    const mondayOfStart = dt.d - ((startWd + 6) % 7); // lunes de la semana inicial (ISO)
    const byDay = (rules.BYDAY ?? "").split(",").map((x) => x.trim().toUpperCase().slice(-2)).filter((x) => WD_NAMES.includes(x));
    const wds = byDay.length ? [...new Set(byDay.map((x) => WD_NAMES.indexOf(x)))] : [startWd];
    for (let w = 0; w < 800 && out.length < count; w++) {
      const offsetDays = w * interval * 7;
      for (const wd of wds) {
        const date = new Date(Date.UTC(dt.y, dt.mo - 1, mondayOfStart + offsetDays + ((wd + 6) % 7)));
        const w2 = at(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
        const ep = zonedToEpoch(w2);
        if (stop(ep)) return out;
        push(w2);
      }
      if (out.length >= MAX_OCCURRENCES) break;
    }
  } else if (freq === "MONTHLY") {
    const mdayStr = rules.BYMONTHDAY;
    const fixedDays = mdayStr
      ? mdayStr.split(",").map((x) => Number(x.trim())).filter((n) => Number.isFinite(n) && n !== 0)
      : [dt.d];
    let m = { y: dt.y, mo: dt.mo };
    for (let w = 0; w < 400 && out.length < count; w++) {
      const last = daysInMonth(m.y, m.mo);
      const days = [...new Set(fixedDays.map((n) => (n < 0 ? last + n + 1 : n)))].sort((a, b) => a - b);
      for (const day of days) {
        if (day < 1 || day > last) continue;
        const w2 = at(m.y, m.mo, day);
        const ep = zonedToEpoch(w2);
        if (stop(ep)) return out;
        push(w2);
      }
      m = monthAdd(m.y, m.mo, interval);
      if (out.length >= MAX_OCCURRENCES) break;
    }
  } else if (freq === "YEARLY") {
    const moY = rules.BYMONTH ? Math.min(12, Math.max(1, Number(rules.BYMONTH) || dt.mo)) : dt.mo;
    const dayY = rules.BYMONTHDAY ? Math.max(1, Number(rules.BYMONTHDAY) || dt.d) : dt.d;
    for (let y = dt.y; y < dt.y + 100 && out.length < count; y += interval) {
      const day = Math.min(dayY, daysInMonth(y, moY));
      const w2 = at(y, moY, day);
      const ep = zonedToEpoch(w2);
      if (stop(ep)) break;
      push(w2);
    }
  }

  return out.slice(0, MAX_OCCURRENCES);
}

function parseDurationMs(v: string): number {
  const m = String(v).match(/^([+-]?)P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/);
  if (!m) return 3600e3;
  const sign = m[1] === "-" ? -1 : 1;
  return sign * (((Number(m[2] ?? 0) * 7 + Number(m[3] ?? 0)) * 24 + Number(m[4] ?? 0)) * 3600 + Number(m[5] ?? 0) * 60 + Number(m[6] ?? 0)) * 1000 || 3600e3;
}

/* ──────────────────────────── parseo principal ──────────────────────────── */

type JProp = [string, Record<string, string> | null, string, unknown];

function eventProps(sub: unknown): JProp[] {
  if (!Array.isArray(sub)) return [];
  const props = (sub as unknown[])[1];
  return Array.isArray(props) ? (props as JProp[]) : [];
}

export async function externalBusy(icsUrl: string, windowStart: number, windowEnd: number): Promise<BusySlot[]> {
  const key = icsUrl;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS && hit.busy.some((b) => b.end > windowStart && b.start < windowEnd)) {
    return hit.busy;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9000);
  let res: Response;
  try {
    res = await fetch(icsUrl, {
      signal: controller.signal,
      redirect: "follow",
      headers: { accept: "text/calendar, text/plain, */*" },
    });
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) throw new Error(`Calendario no disponible (HTTP ${res.status})`);
  const text = await res.text();
  if (text.length > 2_500_000) throw new Error("Calendario demasiado grande para leer");

  let jcal: unknown;
  try {
    jcal = ical.parse(text);
  } catch {
    throw new Error("El enlace no parece un calendario ICS válido");
  }
  const root = jcal as unknown[];
  const subs = Array.isArray(root?.[2]) ? (root[2] as unknown[]) : [];

  const raw: BusySlot[] = [];
  for (const sub of subs) {
    if (!Array.isArray(sub) || String(sub[0]).toUpperCase() !== "VEVENT") continue;
    const props = eventProps(sub);
    const find = (n: string) => props.find((p) => String(p[0]).toUpperCase() === n);
    const findRaw = (n: string) => props.filter((p) => String(p[0]).toUpperCase() === n);
    const startP = find("DTSTART");
    if (!startP) continue;
    const start = parseWall(startP[3], (startP[1] ?? {}) as Record<string, string>);
    if (!start) continue;

    /* Ocurrencias: RRULE > DTSTART + RDATE */
    let occs: Wall[] = [];
    const rruleP = find("RRULE");
    const rruleStr = rruleP ? rruleToString(rruleP[3]) : "";
    if (rruleStr) {
      try {
        occs = expandRrule(start, rruleStr, windowStart, windowEnd);
      } catch {
        occs = [];
      }
      if (occs.length === 0) occs = [start];
    } else {
      occs = [start];
      for (const rd of findRaw("RDATE")) {
        const w = parseWall(rd[3], (rd[1] ?? {}) as Record<string, string>);
        if (w) occs.push(w);
      }
    }

    /* Exclusiones (EXDATE) */
    const exSet = new Set(
      findRaw("EXDATE")
        .map((p) => parseWall(p[3], (p[1] ?? {}) as Record<string, string>))
        .filter((w): w is Wall => !!w)
        .map((w) => `${w.y}-${w.mo}-${w.d}T${w.h}:${w.mi}:${w.s}@${w.tz}`),
    );

    const endP = find("DTEND");
    const durP = find("DURATION");

    for (const w of occs) {
      const keyW = `${w.y}-${w.mo}-${w.d}T${w.h}:${w.mi}:${w.s}@${w.tz}`;
      if (exSet.has(keyW)) continue;
      const s = zonedToEpoch(w);
      let e: number;
      if (w.allDay) {
        e = s + 86400e3;
      } else if (endP) {
        const ew = parseWall(endP[3], (endP[1] ?? {}) as Record<string, string>);
        e = ew ? Math.max(s + 5 * 60e3, zonedToEpoch(ew)) : s + 3600e3;
      } else if (durP && typeof durP[3] === "string") {
        e = s + Math.max(5 * 60e3, parseDurationMs(String(durP[3])));
      } else {
        e = s + 3600e3;
      }
      if (e > windowStart && s < windowEnd) raw.push({ start: s, end: e });
    }
  }

  /* Ordena y funde solapados */
  raw.sort((a, b) => a.start - b.start);
  const busy: BusySlot[] = [];
  for (const b of raw) {
    const last = busy[busy.length - 1];
    if (last && b.start <= last.end) last.end = Math.max(last.end, b.end);
    else busy.push({ ...b });
  }

  cache.set(key, { at: Date.now(), busy });
  return busy;
}
