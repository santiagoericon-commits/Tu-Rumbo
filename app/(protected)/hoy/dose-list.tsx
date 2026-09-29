"use client";

import { useOptimistic } from "react";
import { formatDoseSummary } from "@/lib/dose-summary";
import { DoseItem } from "./dose-item";
import type { DoseUpdate, DoseView } from "./types";

// El estado optimista solo vive mientras la acción está en curso. Al terminar,
// React vuelve a `doses` del servidor: si la acción falló, nada queda marcado.
function applyUpdate(state: DoseView[], update: DoseUpdate): DoseView[] {
  return state.map((dose) => (dose.id === update.id ? { ...dose, status: update.status } : dose));
}

export function DoseList({ doses }: { doses: DoseView[] }) {
  const [optimisticDoses, applyOptimistic] = useOptimistic(doses, applyUpdate);
  const taken = optimisticDoses.filter((dose) => dose.status === "taken").length;

  return (
    <>
      <p aria-live="polite" className="mt-1 text-base text-ink-muted">
        {formatDoseSummary(taken, optimisticDoses.length)}
      </p>
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {optimisticDoses.map((dose) => (
          <DoseItem key={dose.id} dose={dose} applyOptimistic={applyOptimistic} />
        ))}
      </ul>
    </>
  );
}
