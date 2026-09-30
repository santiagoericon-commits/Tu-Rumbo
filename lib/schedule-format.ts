// Texto de los horarios y la fecha de inicio de un medicamento. Los valores son
// hora de pared y fecha de calendario del usuario: se formatean en UTC para que
// no dependan de la zona del servidor.

const timeFormatter = new Intl.DateTimeFormat("es-MX", {
  timeZone: "UTC",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const listFormatter = new Intl.ListFormat("es-MX", { style: "long", type: "conjunction" });

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  timeZone: "UTC",
  weekday: "long",
  day: "numeric",
  month: "long",
});

// "08:00" o "08:00:00" (como lo devuelve Postgres) -> "8:00 a.m."
export function formatClockTime(time: string): string {
  const [hour, minute] = time.split(":").map(Number);
  return timeFormatter.format(new Date(Date.UTC(1970, 0, 1, hour, minute)));
}

// ["08:00", "20:00"] -> "8:00 a.m. y 8:00 p.m."
export function formatScheduleTimes(times: string[]): string {
  return listFormatter.format(times.map(formatClockTime));
}

// "2026-09-29" -> "Desde el martes, 29 de septiembre"
export function formatStartDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return `Desde el ${dateFormatter.format(new Date(Date.UTC(year, month - 1, day)))}`;
}
