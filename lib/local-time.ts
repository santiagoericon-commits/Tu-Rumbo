import { resolveTimeZone } from "@/lib/timezone";

// Primitivas de tiempo local. Solo Intl; sin dependencias. Cambian solo con tests.

export type LocalParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function localParts(instant: Date, tz: string): LocalParts {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

// Hora de pared de la zona expresada como milisegundos UTC (para comparar con Date.UTC).
function wallClockMs(instant: number, tz: string): number {
  const p = localParts(new Date(instant), tz);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
}

// Diferencia entre la hora de pared de la zona y UTC en ese instante.
export function offsetMs(instant: number, tz: string): number {
  const whole = Math.floor(instant / 1000) * 1000;
  return wallClockMs(whole, tz) - whole;
}

const pad = (n: number) => String(n).padStart(2, "0");

// Fecha local "YYYY-MM-DD" del instante dado.
export function formatLocalDate(now: Date, tz: string): string {
  const { year, month, day } = localParts(now, resolveTimeZone(tz));
  return `${year}-${pad(month)}-${pad(day)}`;
}

// Suma días de calendario a una fecha ISO "YYYY-MM-DD". Date.UTC normaliza mes y año.
export function addDaysIso(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

// Instante UTC de una hora de pared local ("YYYY-MM-DD" + "HH:MM") en la zona.
// Cambio de horario:
//  - Hora repetida (fin del horario de verano): se toma la primera ocurrencia.
//  - Hora inexistente (inicio del horario de verano): se usa el offset previo al
//    cambio, lo que recorre la hora hacia adelante (02:30 -> 03:30).
export function localDateTimeToInstant(date: string, time: string, tz: string): Date {
  const zone = resolveTimeZone(tz);
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const wall = Date.UTC(year, month - 1, day, hour, minute);

  const offsetBefore = offsetMs(wall - DAY_MS, zone);
  const offsetAfter = offsetMs(wall + DAY_MS, zone);
  const candidates = [...new Set([wall - offsetBefore, wall - offsetAfter])].sort((a, b) => a - b);
  const valid = candidates.filter((candidate) => wallClockMs(candidate, zone) === wall);

  return new Date(valid.length > 0 ? valid[0] : wall - offsetBefore);
}
