import { getDayRange } from "@/lib/date-range";
import { generateDoseInstants, SCHEDULE_WINDOW_DAYS } from "@/lib/dose-schedule";
import { formatLocalDate } from "@/lib/local-time";

// Relleno de dosis (SCHED-01). Puro; cambia solo con tests.
//
// Ventana: hoy local y los 13 días siguientes. Solo llena los días locales que no tienen
// ninguna dosis de ese medicamento: si la zona cambió (o el primer render usó el fallback),
// la misma hora de pared es otro instante y el índice único no lo detectaría.

export type TopUpMedication = {
  id: string;
  times: string[]; // "HH:MM" locales
  startDate: string; // "YYYY-MM-DD" local
  createdAt: Date;
};

export type TopUpDose = { medicationId: string; scheduledAt: Date };

export type TopUpInput = {
  medications: TopUpMedication[];
  existing: TopUpDose[]; // dosis ya guardadas dentro de la ventana
  tz: string;
  now: Date;
};

export function planDoseTopUp({ medications, existing, tz, now }: TopUpInput): TopUpDose[] {
  const today = formatLocalDate(now, tz);
  const dayStart = getDayRange(tz, now).start;

  const coveredDays = new Set(
    existing.map((dose) => `${dose.medicationId}|${formatLocalDate(dose.scheduledAt, tz)}`),
  );

  const rows: TopUpDose[] = [];
  for (const medication of medications) {
    // Un inicio futuro ya tiene su ventana completa desde la alta (todo o nada).
    if (medication.startDate > today) continue;

    // Desde el inicio de hoy (la dosis de 8:00 aparece aunque se abra a las 10:00),
    // pero nunca antes de la alta del medicamento. Ayer nunca entra.
    const floor = new Date(Math.max(dayStart.getTime(), medication.createdAt.getTime()));
    const instants = generateDoseInstants({
      times: medication.times,
      startDate: today,
      tz,
      now: floor,
      days: SCHEDULE_WINDOW_DAYS,
    });

    for (const instant of instants) {
      if (coveredDays.has(`${medication.id}|${formatLocalDate(instant, tz)}`)) continue;
      rows.push({ medicationId: medication.id, scheduledAt: instant });
    }
  }
  return rows;
}
