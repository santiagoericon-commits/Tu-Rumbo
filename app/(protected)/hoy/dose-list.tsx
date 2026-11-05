"use client";

import { formatDoseSummary } from "@/lib/dose-summary";
import { DoseItem } from "./dose-item";
import type { SettableDoseStatus } from "@/lib/dose-status";
import type { DoseUpdate, DoseView, UpdateDoseStatus } from "./types";

type DoseListProps = {
  doses: DoseView[];
  applyOptimistic: (update: DoseUpdate) => void;
  updateStatus: UpdateDoseStatus;
  onTap?: (next: SettableDoseStatus) => void;
};

// Resumen y tarjetas. El estado optimista vive en TodayDoses, que también pinta el encabezado.
export function DoseList({ doses, applyOptimistic, updateStatus, onTap }: DoseListProps) {
  const taken = doses.filter((dose) => dose.status === "taken").length;

  return (
    <>
      <p aria-live="polite" className="px-1 text-body text-ink-muted tabular-nums">
        {formatDoseSummary(taken, doses.length)}
      </p>
      <ul className="flex flex-col gap-4">
        {doses.map((dose) => (
          <DoseItem
            key={dose.id}
            dose={dose}
            applyOptimistic={applyOptimistic}
            updateStatus={updateStatus}
            onTap={onTap}
          />
        ))}
      </ul>
    </>
  );
}
