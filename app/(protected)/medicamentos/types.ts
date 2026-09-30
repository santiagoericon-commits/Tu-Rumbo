export type MedicationView = {
  id: string;
  name: string;
  dosage: string | null;
  timesLabel: string; // "8:00 a.m. y 8:00 p.m."
  startLabel: string; // "Desde el martes, 29 de septiembre"
};
