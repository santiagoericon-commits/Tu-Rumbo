import { normalizeMultiline } from "@/lib/form-text";
import { isUuid } from "@/lib/ids";
import { daysBetween, TIME_PATTERN } from "@/lib/medication-validation";

// Validación en servidor del formulario de cita. Fecha y hora son de pared en la
// zona del usuario; la acción las convierte a instante. FormData manipulada devuelve null.

export const MAX_TITLE_LENGTH = 80;
export const MAX_APPOINTMENT_NOTES_LENGTH = 300;
export const MAX_APPOINTMENT_OFFSET_DAYS = 730;

export type AppointmentInput = {
  title: string;
  date: string; // "YYYY-MM-DD" local
  time: string; // "HH:MM" local
  notes: string | null;
};

export function parseAppointmentForm(formData: FormData, todayLocal: string): AppointmentInput | null {
  const rawTitle = formData.get("title");
  const rawDate = formData.get("date");
  const rawTime = formData.get("time");
  const rawNotes = formData.get("notes") ?? "";
  if (
    typeof rawTitle !== "string" ||
    typeof rawDate !== "string" ||
    typeof rawTime !== "string" ||
    typeof rawNotes !== "string"
  ) {
    return null;
  }

  const title = rawTitle.trim();
  if (title.length < 1 || title.length > MAX_TITLE_LENGTH) return null;

  const offset = daysBetween(todayLocal, rawDate);
  if (offset === null || offset < 0 || offset > MAX_APPOINTMENT_OFFSET_DAYS) return null;

  if (!TIME_PATTERN.test(rawTime)) return null;

  const notes = normalizeMultiline(rawNotes);
  if (notes.length > MAX_APPOINTMENT_NOTES_LENGTH) return null;

  return { title, date: rawDate, time: rawTime, notes: notes === "" ? null : notes };
}

export type AppointmentNotesInput = { appointmentId: string; notes: string | null };

// Edición de solo las notas de una cita ("Lo que quiero preguntar" en Para mi cita).
// FormData manipulada devuelve null. El id solo identifica la fila: RLS y user_id la acotan.
export function parseAppointmentNotesForm(formData: FormData): AppointmentNotesInput | null {
  const rawId = formData.get("appointmentId");
  const rawNotes = formData.get("notes") ?? "";
  if (!isUuid(rawId) || typeof rawNotes !== "string") return null;

  const notes = normalizeMultiline(rawNotes);
  if (notes.length > MAX_APPOINTMENT_NOTES_LENGTH) return null;

  return { appointmentId: rawId, notes: notes === "" ? null : notes };
}
