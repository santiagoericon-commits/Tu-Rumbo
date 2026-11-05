import { addDaysIso, formatLocalDate } from "@/lib/local-time";

// Hitos de uso (docs/marca.md §3): una semana o un mes desde que la persona creó su cuenta,
// en días de calendario de su zona (no en horas: un día de 23 o 25 h cuenta como uno).
// Igual para todas: no depende de cuántas dosis marcó. Solo cambia con tests.
export type UsageMilestone = "semana" | "mes";

const MILESTONES: ReadonlyArray<readonly [UsageMilestone, number]> = [
  ["semana", 7],
  ["mes", 30],
];

export function usageMilestone(createdAt: Date, tz: string, now: Date): UsageMilestone | null {
  const createdDay = formatLocalDate(createdAt, tz);
  const today = formatLocalDate(now, tz);
  for (const [milestone, days] of MILESTONES) {
    if (addDaysIso(createdDay, days) === today) return milestone;
  }
  return null;
}
