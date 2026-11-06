import type { SectionKey } from "@/components/app-shell/sections";
import type { SettableDoseStatus } from "@/lib/dose-status";
import type { DoseActionResult } from "./actions";

export type DoseView = {
  id: string;
  scheduledAt: string;
  timeLabel: string;
  name: string;
  dosage: string | null;
  status: "pending" | "taken" | "missed";
};

export type DoseUpdate = { id: string; status: SettableDoseStatus };

// La acción llega por prop desde page.tsx (así la ruta de QA puede inyectar una simulada).
export type UpdateDoseStatus = (id: string, status: SettableDoseStatus) => Promise<DoseActionResult>;

// Datos serializables del encabezado: TodayDoses (cliente) pinta el PageHeader.
export type TodayHeader = {
  section: SectionKey;
  title: string;
  subtitle?: string;
  size?: "greeting" | "title";
};
