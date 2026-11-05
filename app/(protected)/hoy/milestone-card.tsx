"use client";

import { useState } from "react";
import { CompassIllustration } from "@/components/illustrations";
import { buttonSecondary, card } from "@/components/ui/styles";
import type { UsageMilestone } from "@/lib/usage-milestone";

// Hitos de uso (docs/marca.md §3): una semana o un mes desde que se creó la cuenta. Igual para todas,
// se hayan marcado dosis o no; sin conteos. Quieta (no hubo un toque que reconocer). "Gracias" la
// oculta solo en esta visita: no se guarda nada, así que ese día puede volver a verse al recargar.
// [PENDIENTE REVISIÓN PROFESIONAL]
const TEXT: Record<UsageMilestone, string> = {
  semana: "Hoy hace una semana que usas Rumbo.",
  mes: "Hoy hace un mes que usas Rumbo.",
};

export function MilestoneCard({ milestone }: { milestone: UsageMilestone }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <section aria-label="Tu tiempo en Rumbo" className={`${card} flex flex-col gap-4`}>
      <div className="flex flex-wrap items-center gap-4">
        <CompassIllustration className="size-16" />
        <p className="min-w-0 flex-1 basis-40 text-body text-ink">{TEXT[milestone]}</p>
      </div>
      <button type="button" onClick={() => setDismissed(true)} className={`${buttonSecondary} w-full`}>
        Gracias
      </button>
    </section>
  );
}
