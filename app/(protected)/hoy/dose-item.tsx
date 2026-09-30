"use client";

import { useState } from "react";
import { CircleCheckIcon, ClockIcon } from "@/components/icons";
import { SubmitButton } from "@/components/submit-button";
import { Notice } from "@/components/ui/notice";
import { buttonPrimary, buttonSecondary, card } from "@/components/ui/styles";
import { updateDoseStatusAction } from "./actions";
import type { DoseUpdate, DoseView } from "./types";

type DoseItemProps = {
  dose: DoseView;
  applyOptimistic: (update: DoseUpdate) => void;
};

// Pendiente y tomada se distinguen por ícono, texto y botón; la tarjeta no cambia de color.
export function DoseItem({ dose, applyOptimistic }: DoseItemProps) {
  const [failed, setFailed] = useState(false);
  // "missed" se trata como pendiente: la app nunca lo asigna ni lo resalta.
  const isTaken = dose.status === "taken";
  const StatusIcon = isTaken ? CircleCheckIcon : ClockIcon;

  async function toggle() {
    const next = isTaken ? "pending" : "taken";
    setFailed(false);
    applyOptimistic({ id: dose.id, status: next });
    const result = await updateDoseStatusAction(dose.id, next);
    if (!result.ok) setFailed(true);
  }

  return (
    <li className={card}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-time text-ink tabular-nums">
          <time dateTime={dose.scheduledAt} className="whitespace-nowrap">
            {dose.timeLabel}
          </time>
        </p>
        <p className="inline-flex items-center gap-1.5 text-secondary text-ink-muted">
          <StatusIcon className="size-5" />
          {isTaken ? "Tomada" : "Pendiente"}
        </p>
      </div>
      <p className="mt-2 text-name wrap-break-word text-ink">{dose.name}</p>
      {dose.dosage ? <p className="text-body wrap-break-word text-ink-muted">{dose.dosage}</p> : null}

      <form action={toggle} className="mt-4">
        {isTaken ? (
          <SubmitButton pendingLabel="Guardando…" className={`${buttonSecondary} w-full`}>
            Deshacer<span className="sr-only">: {dose.name}, {dose.timeLabel}</span>
          </SubmitButton>
        ) : (
          // [PENDIENTE REVISIÓN PROFESIONAL]
          <SubmitButton pendingLabel="Guardando…" className={`${buttonPrimary} w-full`}>
            Ya la tomé<span className="sr-only">: {dose.name}, {dose.timeLabel}</span>
          </SubmitButton>
        )}
      </form>

      {failed ? (
        <Notice kind="error" className="mt-3">
          No pudimos guardar el cambio. Inténtalo de nuevo.
        </Notice>
      ) : null}
    </li>
  );
}
