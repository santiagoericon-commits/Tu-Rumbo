"use client";

import { ClockIcon } from "@/components/icons";
import { DeleteConfirm } from "@/components/ui/delete-confirm";
import { card } from "@/components/ui/styles";
import { deleteMedicationAction } from "./actions";
import type { MedicationView } from "./types";

export function MedicationItem({ medication }: { medication: MedicationView }) {
  return (
    <li className={card}>
      <p className="text-name wrap-break-word text-ink">{medication.name}</p>
      {medication.dosage ? <p className="text-body wrap-break-word text-ink-muted">{medication.dosage}</p> : null}
      <p className="mt-3 flex items-start gap-2 text-body text-ink">
        <ClockIcon className="mt-0.5 size-6 text-ink-muted" />
        {medication.timesLabel}
      </p>
      <p className="mt-1 text-secondary text-ink-muted">{medication.startLabel}</p>

      <DeleteConfirm
        question="¿Eliminar este medicamento y sus dosis programadas?"
        itemName={medication.name}
        failedMessage="No pudimos eliminar el medicamento. Inténtalo de nuevo."
        onDelete={() => deleteMedicationAction(medication.id)}
      />
    </li>
  );
}
