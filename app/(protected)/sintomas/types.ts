export type SymptomLogView = {
  id: string;
  logDate: string; // "2026-09-29"
  dateLabel: string; // "Hoy, martes, 29 de septiembre" o "lunes, 28 de septiembre"
  level: number; // autorreporte 1 a 5
  notes: string | null;
};

export type SymptomValues = { level: number; notes: string | null };
