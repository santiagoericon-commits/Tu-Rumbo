// Diccionario cerrado: la UI solo muestra textos de aquí, nunca mensajes crudos de Supabase.

export type AppointmentErrorCode = "datos-invalidos" | "generico";

export const APPOINTMENT_ERROR_MESSAGES: Record<AppointmentErrorCode, string> = {
  "datos-invalidos": "Revisa el título, la fecha, la hora y las notas.",
  generico: "No pudimos guardar la cita. Inténtalo de nuevo.",
};

export const APPOINTMENT_SAVED_MESSAGE = "Cita guardada.";

// Notas de la cita editadas desde "Para mi cita" (P10).
// [PENDIENTE REVISIÓN PROFESIONAL]
export type AppointmentNotesErrorCode = "datos-invalidos" | "generico";

export const APPOINTMENT_NOTES_ERROR_MESSAGES: Record<AppointmentNotesErrorCode, string> = {
  "datos-invalidos": "Revisa tus preguntas: hasta 300 caracteres.",
  generico: "No pudimos guardar tus preguntas. Inténtalo de nuevo.",
};

export const APPOINTMENT_NOTES_SAVED_MESSAGE = "Preguntas guardadas.";
