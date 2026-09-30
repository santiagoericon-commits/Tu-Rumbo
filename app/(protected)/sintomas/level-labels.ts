import { SYMPTOM_LEVELS, type SymptomLevel } from "@/lib/symptom-validation";

// [PENDIENTE REVISIÓN PROFESIONAL]
// Palabras de la escala 1 a 5, adaptadas del formato verbal de PRO-CTCAE (ver docs/fuentes.md).
// Describen lo que la persona reporta; nunca califican ni interpretan el valor.
export const LEVEL_LABELS: Record<SymptomLevel, string> = {
  1: "Nada",
  2: "Un poco",
  3: "Algo",
  4: "Bastante",
  5: "Mucho",
};

function isSymptomLevel(level: number): level is SymptomLevel {
  return (SYMPTOM_LEVELS as readonly number[]).includes(level);
}

// "Nada, 1 de 5": nombre accesible de cada opción.
export function levelAccessibleName(level: SymptomLevel): string {
  return `${LEVEL_LABELS[level]}, ${level} de 5`;
}

// "Algo · 3 de 5" para el historial; si el valor guardado no está en la escala, solo "n de 5".
export function levelText(level: number): string {
  return isSymptomLevel(level) ? `${LEVEL_LABELS[level]} · ${level} de 5` : `${level} de 5`;
}
