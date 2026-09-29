import type { SettableDoseStatus } from "@/lib/dose-status";

export type DoseView = {
  id: string;
  scheduledAt: string;
  timeLabel: string;
  name: string;
  dosage: string | null;
  status: "pending" | "taken" | "missed";
};

export type DoseUpdate = { id: string; status: SettableDoseStatus };
