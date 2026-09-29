export const DEFAULT_TZ = "America/Mazatlan";

// Caracteres que usan los nombres IANA. Seguros en una cookie sin codificar.
export const TIME_ZONE_PATTERN = /^[A-Za-z0-9_+\-/]{1,64}$/;

export function isValidTimeZone(tz: unknown): tz is string {
  if (typeof tz !== "string" || !TIME_ZONE_PATTERN.test(tz)) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export function resolveTimeZone(raw: unknown): string {
  if (typeof raw !== "string") return DEFAULT_TZ;
  let value: string;
  try {
    value = decodeURIComponent(raw);
  } catch {
    return DEFAULT_TZ;
  }
  return isValidTimeZone(value) ? value : DEFAULT_TZ;
}
