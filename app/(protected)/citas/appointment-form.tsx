"use client";

import { useActionState, useState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { APPOINTMENT_ERROR_MESSAGES, APPOINTMENT_SAVED_MESSAGE } from "@/lib/appointment-messages";
import { MAX_APPOINTMENT_NOTES_LENGTH, MAX_TITLE_LENGTH } from "@/lib/appointment-validation";
import { createAppointmentAction, type CreateAppointmentState } from "./actions";
import type { AppointmentValues } from "./types";

const INITIAL: CreateAppointmentState = { status: "idle" };
const TITLE_HINT_ID = "titulo-ejemplo";
const NOTES_HINT_ID = "notas-cita-limite";

const fieldClass =
  "min-h-12 w-full rounded-md border border-line bg-surface px-3 text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

type AppointmentFormProps = { todayLocal: string; maxDate: string };

export function AppointmentForm({ todayLocal, maxDate }: AppointmentFormProps) {
  const [state, formAction] = useActionState(createAppointmentAction, INITIAL);
  // React reinicia el formulario al terminar la acción. Lo enviado se guarda aquí, en
  // el cliente (nunca en el estado de la acción, que viaja al servidor), para
  // recuperarlo si falla; tras guardar, queda vacío para la siguiente cita.
  const [submitted, setSubmitted] = useState<AppointmentValues | null>(null);
  const values = state.status === "error" ? submitted : null;

  function submit(formData: FormData) {
    const text = (name: string) => {
      const value = formData.get(name);
      return typeof value === "string" ? value : "";
    };
    setSubmitted({ title: text("title"), date: text("date"), time: text("time"), notes: text("notes") });
    formAction(formData);
  }

  return (
    <form action={submit} className="mt-3 flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <label className="flex flex-col gap-1 text-base text-ink">
          Título
          <input
            className={fieldClass}
            type="text"
            name="title"
            required
            maxLength={MAX_TITLE_LENGTH}
            autoComplete="off"
            defaultValue={values?.title ?? ""}
            aria-describedby={TITLE_HINT_ID}
          />
        </label>
        <p id={TITLE_HINT_ID} className="text-base text-ink-muted">
          Por ejemplo: Estudio de control
        </p>
      </div>

      <label className="flex flex-col gap-1 text-base text-ink">
        Fecha
        <input
          className={fieldClass}
          type="date"
          name="date"
          required
          min={todayLocal}
          max={maxDate}
          defaultValue={values?.date ?? ""}
        />
      </label>

      <label className="flex flex-col gap-1 text-base text-ink">
        Hora
        <input className={fieldClass} type="time" name="time" required defaultValue={values?.time ?? ""} />
      </label>

      <div className="flex flex-col gap-1">
        <label className="flex flex-col gap-1 text-base text-ink">
          Notas (opcional)
          <textarea
            className={`${fieldClass} py-2`}
            name="notes"
            rows={3}
            maxLength={MAX_APPOINTMENT_NOTES_LENGTH}
            defaultValue={values?.notes ?? ""}
            aria-describedby={NOTES_HINT_ID}
          />
        </label>
        <p id={NOTES_HINT_ID} className="text-base text-ink-muted">
          Hasta {MAX_APPOINTMENT_NOTES_LENGTH} caracteres.
        </p>
      </div>

      {state.status === "error" ? (
        <p role="alert" className="text-base text-ink">
          {APPOINTMENT_ERROR_MESSAGES[state.code]}
        </p>
      ) : null}

      <SubmitButton pendingLabel="Guardando…" className="w-full bg-accent text-accent-ink">
        Guardar cita
      </SubmitButton>

      {/* Región viva siempre presente para que el aviso se anuncie al aparecer. */}
      <p role="status" className="text-base text-ink">
        {state.status === "saved" ? APPOINTMENT_SAVED_MESSAGE : null}
      </p>
    </form>
  );
}
