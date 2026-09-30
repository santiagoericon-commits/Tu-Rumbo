import { normalizeMultiline } from "@/lib/form-text";

// Validación en servidor del registro diario. El valor es autorreporte de 1 a 5 (1 = Nada,
// 2 = Un poco, 3 = Algo, 4 = Bastante, 5 = Mucho): se guarda tal cual, nunca se interpreta.
// FormData manipulada devuelve null.

export const SYMPTOM_LEVELS = [1, 2, 3, 4, 5] as const;
export type SymptomLevel = (typeof SYMPTOM_LEVELS)[number];
export const MAX_SYMPTOM_NOTES_LENGTH = 500;

const LEVEL_PATTERN = /^[1-5]$/;

export type SymptomInput = {
  level: SymptomLevel;
  notes: string | null;
};

export function parseSymptomForm(formData: FormData): SymptomInput | null {
  const rawLevel = formData.get("level");
  const rawNotes = formData.get("notes") ?? "";
  if (typeof rawLevel !== "string" || typeof rawNotes !== "string") return null;
  if (!LEVEL_PATTERN.test(rawLevel)) return null;

  const notes = normalizeMultiline(rawNotes);
  if (notes.length > MAX_SYMPTOM_NOTES_LENGTH) return null;

  return { level: Number(rawLevel) as SymptomLevel, notes: notes === "" ? null : notes };
}
