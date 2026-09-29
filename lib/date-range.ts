import { resolveTimeZone } from "@/lib/timezone";

type LocalParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function localParts(instant: Date, tz: string): LocalParts {
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

// Diferencia entre la hora de pared de la zona y UTC en ese instante.
function offsetMs(instant: number, tz: string): number {
  const whole = Math.floor(instant / 1000) * 1000;
  const p = localParts(new Date(whole), tz);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - whole;
}

// Instante UTC de la medianoche local. Date.UTC normaliza el desborde de día, mes y año.
function startOfLocalDay(year: number, month: number, day: number, tz: string): Date {
  const wallClock = Date.UTC(year, month - 1, day);
  const firstGuess = wallClock - offsetMs(wallClock, tz);
  // Segunda pasada: si hubo cambio de horario entre ambos instantes, corrige el offset.
  return new Date(wallClock - offsetMs(firstGuess, tz));
}

export function getDayRange(tz: string, now: Date): { start: Date; end: Date } {
  const zone = resolveTimeZone(tz);
  const { year, month, day } = localParts(now, zone);
  return {
    start: startOfLocalDay(year, month, day, zone),
    end: startOfLocalDay(year, month, day + 1, zone),
  };
}

export function formatTime(date: Date, tz: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: resolveTimeZone(tz),
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatDayHeading(date: Date, tz: string): string {
  const day = new Intl.DateTimeFormat("es-MX", {
    timeZone: resolveTimeZone(tz),
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
  return `Hoy, ${day}`;
}
