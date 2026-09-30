// Diccionario cerrado: la UI solo muestra textos de aquí, nunca mensajes crudos de Supabase.

export type MedicationErrorCode = "datos-invalidos" | "generico";

export const MEDICATION_ERROR_MESSAGES: Record<MedicationErrorCode, string> = {
  "datos-invalidos": "Revisa el nombre, los horarios y la fecha de inicio.",
  generico: "No pudimos guardar el medicamento. Inténtalo de nuevo.",
};
