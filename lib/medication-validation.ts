// Validación en servidor del formulario de medicamento. El formulario puede validar
// también, pero esta es la defensa. Cualquier FormData manipulada devuelve null.

export const MAX_NAME_LENGTH = 80;
export const MAX_DOSAGE_LENGTH = 60;
export const MAX_TIMES = 4;
export const MAX_START_OFFSET_DAYS = 365;

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

export type MedicationInput = {
  name: string;
  dosage: string | null;
  times: string[];
  startDate: string;
};

function isoDateToUtc(value: string): number | null {
  if (!DATE_PATTERN.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const utc = Date.UTC(year, month - 1, day);
  const date = new Date(utc);
  const roundTrips =
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  return roundTrips ? utc : null;
}

// Días de calendario entre dos fechas ISO; null si alguna no es válida.
export function daysBetween(from: string, to: string): number | null {
  const a = isoDateToUtc(from);
  const b = isoDateToUtc(to);
  if (a === null || b === null) return null;
  return Math.round((b - a) / DAY_MS);
}

function parseTimes(raw: FormDataEntryValue[]): string[] | null {
  if (raw.length > MAX_TIMES) return null;
  const times: string[] = [];
  for (const value of raw) {
    if (typeof value !== "string") return null;
    if (value === "") continue; // un horario agregado y no llenado
    if (!TIME_PATTERN.test(value)) return null;
    times.push(value);
  }
  const unique = [...new Set(times)].sort();
  return unique.length >= 1 && unique.length <= MAX_TIMES ? unique : null;
}

export function parseMedicationForm(formData: FormData, todayLocal: string): MedicationInput | null {
  const rawName = formData.get("name");
  const rawDosage = formData.get("dosage") ?? "";
  const rawStart = formData.get("startDate");
  if (typeof rawName !== "string" || typeof rawDosage !== "string" || typeof rawStart !== "string") {
    return null;
  }

  const name = rawName.trim();
  if (name.length < 1 || name.length > MAX_NAME_LENGTH) return null;

  const dosage = rawDosage.trim();
  if (dosage.length > MAX_DOSAGE_LENGTH) return null;

  const times = parseTimes(formData.getAll("times"));
  if (!times) return null;

  const offset = daysBetween(todayLocal, rawStart);
  if (offset === null || offset < 0 || offset > MAX_START_OFFSET_DAYS) return null;

  return { name, dosage: dosage === "" ? null : dosage, times, startDate: rawStart };
}
