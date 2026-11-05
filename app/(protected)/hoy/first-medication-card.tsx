"use client";

import { useEffect, useState } from "react";
import { PathSignIllustration } from "@/components/illustrations";
import { card, enterFromAbove } from "@/components/ui/styles";
import { clearFirstMedication, peekFirstMedication } from "../first-medication";

// Tarjeta de primer medicamento: una sola vez por alta. Lee la bandera de memoria al montar (en el
// servidor siempre es false) y la limpia; al recargar no aparece. Se queda mientras dure la visita.
export function FirstMedicationCard() {
  const [show] = useState(() => typeof window !== "undefined" && peekFirstMedication());

  useEffect(() => {
    clearFirstMedication();
  }, []);

  if (!show) return null;

  return (
    <section aria-label="Primer medicamento" className={`${card} flex flex-wrap items-center gap-4 ${enterFromAbove}`}>
      <PathSignIllustration className="size-16" />
      {/* [PENDIENTE REVISIÓN PROFESIONAL] */}
      <p className="min-w-0 flex-1 basis-40 text-body text-ink">Listo. Aquí verás tus dosis de cada día.</p>
    </section>
  );
}
