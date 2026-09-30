// Diccionario cerrado: la UI solo muestra textos de aquí, nunca mensajes crudos de Supabase.

export type AppointmentErrorCode = "datos-invalidos" | "generico";

export const APPOINTMENT_ERROR_MESSAGES: Record<AppointmentErrorCode, string> = {
  "datos-invalidos": "Revisa el título, la fecha, la hora y las notas.",
  generico: "No pudimos guardar la cita. Inténtalo de nuevo.",
};

export const APPOINTMENT_SAVED_MESSAGE = "Cita guardada.";
