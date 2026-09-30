import { addDaysIso, localDateTimeToInstant } from "@/lib/local-time";

// Generación de dosis a partir de los horarios del medicamento. Puro; cambia solo con tests.

export const SCHEDULE_WINDOW_DAYS = 14;

export type ScheduleInput = {
  times: string[]; // "HH:MM" en hora local del usuario
  startDate: string; // "YYYY-MM-DD" en el calendario local del usuario
  tz: string;
  now: Date;
  days?: number;
};

// Instantes UTC de las dosis de la ventana, ordenados. Nunca genera dosis en el
// pasado: una hora que ya pasó hoy no se crea; la que coincide con `now` sí.
export function generateDoseInstants({
  times,
  startDate,
  tz,
  now,
  days = SCHEDULE_WINDOW_DAYS,
}: ScheduleInput): Date[] {
  const uniqueTimes = [...new Set(times)].sort();
  const result: Date[] = [];

  for (let offset = 0; offset < days; offset++) {
    const isoDate = addDaysIso(startDate, offset);
    for (const time of uniqueTimes) {
      const instant = localDateTimeToInstant(isoDate, time, tz);
      if (instant.getTime() >= now.getTime()) result.push(instant);
    }
  }

  return result.sort((a, b) => a.getTime() - b.getTime());
}
