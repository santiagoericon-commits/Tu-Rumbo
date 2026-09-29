"use client";

import { useState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { updateDoseStatusAction } from "./actions";
import type { DoseUpdate, DoseView } from "./types";

type DoseItemProps = {
  dose: DoseView;
  applyOptimistic: (update: DoseUpdate) => void;
};

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="size-5 shrink-0" fill="none">
      <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.5 10.5l2.3 2.3 4.7-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CircleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="size-5 shrink-0" fill="none">
      <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function DoseItem({ dose, applyOptimistic }: DoseItemProps) {
  const [failed, setFailed] = useState(false);
  // "missed" se trata como pendiente: la app nunca lo asigna ni lo resalta.
  const isTaken = dose.status === "taken";

  async function toggle() {
    const next = isTaken ? "pending" : "taken";
    setFailed(false);
    applyOptimistic({ id: dose.id, status: next });
    const result = await updateDoseStatusAction(dose.id, next);
    if (!result.ok) setFailed(true);
  }

  return (
    <li className="py-5">
      <p className="text-base tabular-nums text-ink-muted">
        <time dateTime={dose.scheduledAt} className="whitespace-nowrap">
          {dose.timeLabel}
        </time>
      </p>
      <p className="mt-1 text-lg text-ink">{dose.name}</p>
      {dose.dosage ? <p className="text-base text-ink-muted">{dose.dosage}</p> : null}

      <form action={toggle} className="mt-3">
        {isTaken ? (
          <div className="flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 rounded-md bg-surface-muted px-3 py-2 text-base text-ink">
              <CheckIcon />
              Tomada
            </span>
            <SubmitButton pendingLabel="Guardando…" className="text-ink-muted underline underline-offset-4">
              Deshacer<span className="sr-only">: {dose.name}, {dose.timeLabel}</span>
            </SubmitButton>
          </div>
        ) : (
          <>
            <p className="inline-flex items-center gap-2 text-base text-ink-muted">
              <CircleIcon />
              Pendiente
            </p>
            <SubmitButton pendingLabel="Guardando…" className="mt-3 w-full bg-accent text-accent-ink">
              Marcar como tomada<span className="sr-only">: {dose.name}, {dose.timeLabel}</span>
            </SubmitButton>
          </>
        )}
      </form>

      {failed ? (
        <p role="alert" className="mt-3 text-base text-ink">
          No pudimos guardar el cambio. Inténtalo de nuevo.
        </p>
      ) : null}
    </li>
  );
}
