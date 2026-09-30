"use client";

import { useState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { deleteAppointmentAction } from "./actions";
import type { AppointmentView } from "./types";

const buttonClass =
  "min-h-12 touch-manipulation rounded-md px-4 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

type AppointmentItemProps = { appointment: AppointmentView; past?: boolean };

export function AppointmentItem({ appointment, past = false }: AppointmentItemProps) {
  const [confirming, setConfirming] = useState(false);
  const [failed, setFailed] = useState(false);
  // Las anteriores se muestran más discretas.
  const tone = past ? "text-ink-muted" : "text-ink";

  async function remove() {
    setFailed(false);
    const result = await deleteAppointmentAction(appointment.id);
    if (!result.ok) {
      setFailed(true);
      setConfirming(false);
    }
    // Si tuvo éxito, la página se revalida y el elemento desaparece.
  }

  return (
    <li className="py-5">
      <p className={`wrap-break-word text-lg ${tone}`}>{appointment.title}</p>
      <p className={`mt-1 text-base first-letter:uppercase ${tone}`}>
        <time dateTime={appointment.scheduledAt}>
          {appointment.dateLabel} · <span className="whitespace-nowrap">{appointment.timeLabel}</span>
        </time>
      </p>
      {appointment.notes ? (
        <p className="mt-1 whitespace-pre-line wrap-break-word text-base text-ink-muted">{appointment.notes}</p>
      ) : null}

      {confirming ? (
        <form action={remove} className="mt-3 rounded-md bg-surface-muted p-3">
          <p className="text-base text-ink">¿Eliminar esta cita?</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <SubmitButton pendingLabel="Eliminando…" className="bg-accent text-accent-ink">
              Sí, eliminar<span className="sr-only">: {appointment.title}</span>
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
          Eliminar<span className="sr-only">: {appointment.title}</span>
        </button>
      )}

      {failed ? (
        <p role="alert" className="mt-3 text-base text-ink">
          No pudimos eliminar la cita. Inténtalo de nuevo.
        </p>
      ) : null}
    </li>
  );
}
