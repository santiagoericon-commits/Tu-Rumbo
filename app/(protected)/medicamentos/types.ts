export type SupplyView = {
  remaining: number;
  line: string; // "Te quedan unas 9 tomas · hasta el dom 15 nov"
  needsSupport: boolean; // 7 días o menos, o sin tomas
};

export type MedicationView = {
  id: string;
  name: string;
  dosage: string | null;
  timesLabel: string; // "8:00 a.m. y 8:00 p.m."
  startLabel: string; // "Desde el martes, 29 de septiembre"
  supply: SupplyView | null;
};
