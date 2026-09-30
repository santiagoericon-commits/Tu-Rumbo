"use client";

import { useState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { deleteMedicationAction } from "./actions";
import type { MedicationView } from "./types";

const buttonClass =
  "min-h-12 touch-manipulation rounded-md px-4 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function MedicationItem({ medication }: { medication: MedicationView }) {
  const [confirming, setConfirming] = useState(false);
  const [failed, setFailed] = useState(false);

  async function remove() {
    setFailed(false);
    const result = await deleteMedicationAction(medication.id);
    if (!result.ok) {
      setFailed(true);
      setConfirming(false);
    }
    // Si tuvo éxito, la página se revalida y el elemento desaparece.
  }

  return (
    <li className="py-5">
      <p className="text-lg text-ink">{medication.name}</p>
      {medication.dosage ? <p className="text-base text-ink-muted">{medication.dosage}</p> : null}
      <p className="mt-1 text-base text-ink">{medication.timesLabel}</p>
      <p className="text-base text-ink-muted">{medication.startLabel}</p>

      {confirming ? (
        <form action={remove} className="mt-3 rounded-md bg-surface-muted p-3">
          <p className="text-base text-ink">¿Eliminar este medicamento y sus dosis programadas?</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <SubmitButton pendingLabel="Eliminando…" className="bg-accent text-accent-ink">
              Sí, eliminar<span className="sr-only">: {medication.name}</span>
            </SubmitButton>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className={`${buttonClass} border border-line text-ink`}
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className={`${buttonClass} mt-3 text-ink-muted underline underline-offset-4`}
        >
          Eliminar<span className="sr-only">: {medication.name}</span>
        </button>
      )}

      {failed ? (
        <p role="alert" className="mt-3 text-base text-ink">
          No pudimos eliminar el medicamento. Inténtalo de nuevo.
        </p>
      ) : null}
    </li>
  );
}
