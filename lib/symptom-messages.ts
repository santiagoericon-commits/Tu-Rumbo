// Diccionario cerrado: la UI solo muestra textos de aquí, nunca mensajes crudos de Supabase.

export type SymptomErrorCode = "datos-invalidos" | "generico";

export const SYMPTOM_ERROR_MESSAGES: Record<SymptomErrorCode, string> = {
  "datos-invalidos": "Elige una opción del 1 al 5 y revisa que tus notas no pasen de 500 caracteres.",
  generico: "No pudimos guardar tu registro. Inténtalo de nuevo.",
};

// Misma respuesta para cualquier valor (docs/marca.md §3, regla 2): reconoce el acto, no interpreta.
// [PENDIENTE REVISIÓN PROFESIONAL]
export const SYMPTOM_SAVED_MESSAGE = "Gracias por contarlo. Quedó en tu registro.";
