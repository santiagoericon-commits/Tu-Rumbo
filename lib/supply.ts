import { generateDoseInstants } from "@/lib/dose-schedule";
import { formatLocalDate } from "@/lib/local-time";
import { daysBetween } from "@/lib/medication-validation";

// Surtido de un medicamento (P9). Puro; cambia solo con tests.
// Las tomas restantes solo bajan con las dosis marcadas como tomadas desde que se anotó el
// surtido; la fecha estimada cuenta los horarios desde ahora. No interpreta nada clínico.

export const SUPPORT_THRESHOLD_DAYS = 7;

export type SupplySummary = {
  remaining: number;
  lastDay: string | null; // "YYYY-MM-DD" local de la última toma; null si no quedan
  daysLeft: number; // días de calendario de hoy a lastDay
  needsSupport: boolean; // 7 días o menos, o sin tomas
};

export type SupplyInput = {
  supplyCount: number | null;
  supplySetAt: Date | null;
  times: string[]; // "HH:MM" o "HH:MM:SS"
  taken: Date[]; // scheduled_at de las dosis tomadas de este medicamento
  tz: string;
  now: Date;
};

export function summarizeSupply({ supplyCount, supplySetAt, times, taken, tz, now }: SupplyInput): SupplySummary | null {
  if (supplyCount === null || supplySetAt === null) return null;

  const since = supplySetAt.getTime();
  const used = taken.filter((dose) => dose.getTime() >= since).length;
  const remaining = Math.max(0, supplyCount - used);
  if (remaining === 0) return { remaining, lastDay: null, daysLeft: 0, needsSupport: true };

  const today = formatLocalDate(now, tz);
  const perDay = new Set(times.map((time) => time.slice(0, 5))).size;
  const slots = generateDoseInstants({
    times: times.map((time) => time.slice(0, 5)),
    startDate: today,
    tz,
    now,
    days: Math.ceil(remaining / perDay) + 1,
  });
  const lastDay = formatLocalDate(slots[remaining - 1], tz);
  const daysLeft = daysBetween(today, lastDay) ?? 0;

  return { remaining, lastDay, daysLeft, needsSupport: daysLeft <= SUPPORT_THRESHOLD_DAYS };
}

const NBSP = "\u00a0";

const shortDate = new Intl.DateTimeFormat("es-MX", {
  timeZone: "UTC",
  weekday: "short",
  day: "numeric",
  month: "short",
});

// "2026-11-15" -> "dom 15 nov" (con el año si no es el de `today`). Fecha de calendario: se
// formatea en UTC para no depender de la zona del servidor.
export function formatShortDate(date: string, today: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const parts = shortDate.formatToParts(new Date(Date.UTC(year, month - 1, day)));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    (parts.find((part) => part.type === type)?.value ?? "").replace(".", "");
  // Espacios no separables: la fecha nunca se parte entre dos líneas.
  const text = [get("weekday"), get("day"), get("month")].join(NBSP);
  return date.slice(0, 4) === today.slice(0, 4) ? text : `${text}${NBSP}${year}`;
}

// [PENDIENTE REVISIÓN PROFESIONAL]
export function formatSupplyLine(summary: SupplySummary, today: string): string {
  if (summary.remaining === 0 || summary.lastDay === null) return "Según tu registro, ya no te quedan tomas";
  const until =
    summary.daysLeft === 0 ? "hoy" : summary.daysLeft === 1 ? "mañana" : `el${NBSP}${formatShortDate(summary.lastDay, today)}`;
  const count = summary.remaining === 1 ? "Te queda 1 toma" : `Te quedan unas ${summary.remaining} tomas`;
  return `${count} · hasta ${until}`;
}
