import { formatTime } from "@/lib/date-range";
import { addDaysIso, formatLocalDate, localDateTimeToInstant } from "@/lib/local-time";

// Lógica pura de "Para mi cita" (P10). Todas las fechas "YYYY-MM-DD" son fechas locales del
// usuario. Solo agrupa lo registrado: no cuenta, no promedia y no interpreta.

export const SUMMARY_MAX_DAYS = 30;

export type SummaryWindow = { startDate: string; endDate: string };

// Fin = hoy. Inicio = el más tardío entre (hoy − 29) y el día local de la última cita pasada,
// con ese día incluido.
export function summaryWindow(today: string, previousAppointmentAt: Date | null, tz: string): SummaryWindow {
  const earliest = addDaysIso(today, -(SUMMARY_MAX_DAYS - 1));
  let startDate = earliest;
  if (previousAppointmentAt) {
    const previousDate = formatLocalDate(previousAppointmentAt, tz);
    // Las fechas ISO se comparan como texto. Nunca empieza después de hoy.
    if (previousDate > startDate) startDate = previousDate > today ? today : previousDate;
  }
  return { startDate, endDate: today };
}

// Medianoche local del primer día de la ventana, como instante.
export function windowStartInstant(window: SummaryWindow, tz: string): Date {
  return localDateTimeToInstant(window.startDate, "00:00", tz);
}

// Primer día de la ventana con datos reales (una dosis o un registro). null si no hay ninguno.
export function coveredStart(
  window: SummaryWindow,
  firstDoseAt: Date | null,
  firstLogDate: string | null,
  tz: string,
): string | null {
  const candidates: string[] = [];
  if (firstDoseAt) candidates.push(formatLocalDate(firstDoseAt, tz));
  if (firstLogDate) candidates.push(firstLogDate);
  if (candidates.length === 0) return null;
  const earliest = candidates.reduce((a, b) => (a < b ? a : b));
  return earliest < window.startDate ? window.startDate : earliest;
}

export type DoseRowLite = { medicationId: string; scheduledAt: string; status: "pending" | "taken" | "missed" };
export type MedicationLite = { id: string; name: string; dosage: string | null };
export type UnmarkedGroup = MedicationLite & { days: { date: string; instants: string[] }[] };

// Dosis que no están marcadas como tomadas y cuya hora ya pasó, por medicamento (en el orden
// recibido) y por día local. `missed` se trata igual que `pending`: la app nunca lo asigna.
export function groupUnmarkedDoses(
  doses: DoseRowLite[],
  medications: MedicationLite[],
  tz: string,
  now: Date,
): UnmarkedGroup[] {
  const nowMs = now.getTime();
  const byMedication = new Map<string, Map<string, string[]>>();

  for (const dose of doses) {
    if (dose.status === "taken") continue;
    const time = Date.parse(dose.scheduledAt);
    if (Number.isNaN(time) || time >= nowMs) continue;
    const date = formatLocalDate(new Date(time), tz);
    const days = byMedication.get(dose.medicationId) ?? new Map<string, string[]>();
    days.set(date, [...(days.get(date) ?? []), dose.scheduledAt]);
    byMedication.set(dose.medicationId, days);
  }

  const groups: UnmarkedGroup[] = [];
  for (const medication of medications) {
    const days = byMedication.get(medication.id);
    if (!days) continue;
    groups.push({
      ...medication,
      days: [...days.entries()]
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([date, instants]) => ({
          date,
          instants: [...instants].sort((a, b) => Date.parse(a) - Date.parse(b)),
        })),
    });
  }
  return groups;
}

const dayMonth = new Intl.DateTimeFormat("es-MX", { timeZone: "UTC", day: "numeric", month: "long" });
const dayMonthYear = new Intl.DateTimeFormat("es-MX", {
  timeZone: "UTC",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function isoToUtcDate(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

// "Del 20 de octubre al 5 de noviembre de 2026"; el año va en los dos extremos si son de años distintos.
export function formatPeriodLabel(startDate: string, endDate: string): string {
  if (startDate === endDate) return dayMonthYear.format(isoToUtcDate(endDate));
  const start = isoToUtcDate(startDate);
  const end = isoToUtcDate(endDate);
  const startText =
    start.getUTCFullYear() === end.getUTCFullYear() ? dayMonth.format(start) : dayMonthYear.format(start);
  return `Del ${startText} al ${dayMonthYear.format(end)}`;
}

const listFormatter = new Intl.ListFormat("es-MX", { style: "long", type: "conjunction" });

// ["…15:00Z", "…03:00Z"] -> "8:00 a.m. y 8:00 p.m."
export function formatTimeList(instants: string[], tz: string): string {
  return listFormatter.format(instants.map((instant) => formatTime(new Date(instant), tz)));
}
