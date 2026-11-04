// Diccionario cerrado: la UI solo muestra textos de aquí, nunca mensajes crudos de Supabase.

export type MedicationErrorCode = "datos-invalidos" | "generico";

export const MEDICATION_ERROR_MESSAGES: Record<MedicationErrorCode, string> = {
  "datos-invalidos": "Revisa el nombre, los horarios, la fecha de inicio y las tomas.",
  generico: "No pudimos guardar el medicamento. Inténtalo de nuevo.",
};

// Surtido (P9).
export type SupplyErrorCode = "datos-invalidos" | "generico";

export const SUPPLY_ERROR_MESSAGES: Record<SupplyErrorCode, string> = {
  "datos-invalidos": "Escribe un número de 0 a 1000, o déjalo vacío.",
  generico: "No pudimos guardar tus tomas. Inténtalo de nuevo.",
};

export const SUPPLY_SAVED_MESSAGE = "Tus tomas quedaron guardadas.";
