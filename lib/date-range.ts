import { localParts, offsetMs } from "@/lib/local-time";
import { resolveTimeZone } from "@/lib/timezone";

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

// "martes, 6 de octubre" en la zona del usuario; con "de 2027" si el año local
// del instante no es el año local de `now`.
export function formatLongDate(date: Date, tz: string, now: Date): string {
  const zone = resolveTimeZone(tz);
  const withYear = localParts(date, zone).year !== localParts(now, zone).year;
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: zone,
    weekday: "long",
    day: "numeric",
    month: "long",
    ...(withYear ? { year: "numeric" } : {}),
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
