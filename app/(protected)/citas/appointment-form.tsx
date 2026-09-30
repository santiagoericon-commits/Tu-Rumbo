"use client";

import { useActionState, useState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { Notice } from "@/components/ui/notice";
import { buttonPrimary, field, fieldLabel } from "@/components/ui/styles";
import { APPOINTMENT_ERROR_MESSAGES, APPOINTMENT_SAVED_MESSAGE } from "@/lib/appointment-messages";
import { MAX_APPOINTMENT_NOTES_LENGTH, MAX_TITLE_LENGTH } from "@/lib/appointment-validation";
import { createAppointmentAction, type CreateAppointmentState } from "./actions";
import type { AppointmentValues } from "./types";

const INITIAL: CreateAppointmentState = { status: "idle" };
const TITLE_HINT_ID = "titulo-ejemplo";
const NOTES_HINT_ID = "notas-cita-limite";

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
      <div className="flex flex-col gap-2">
        <label className={fieldLabel}>
          Título
          <input
            className={field}
            type="text"
            name="title"
            required
            maxLength={MAX_TITLE_LENGTH}
            autoComplete="off"
            defaultValue={values?.title ?? ""}
            aria-describedby={TITLE_HINT_ID}
          />
        </label>
        <p id={TITLE_HINT_ID} className="text-secondary text-ink-muted">
          Por ejemplo: Estudio de control
        </p>
      </div>

      <label className={fieldLabel}>
        Fecha
        <input
          className={field}
          type="date"
          name="date"
          required
          min={todayLocal}
          max={maxDate}
          defaultValue={values?.date ?? ""}
        />
      </label>

      <label className={fieldLabel}>
        Hora
        <input className={field} type="time" name="time" required defaultValue={values?.time ?? ""} />
      </label>

      <div className="flex flex-col gap-2">
        <label className={fieldLabel}>
          Notas (opcional)
          <textarea
            className={`${field} py-3`}
            name="notes"
            rows={3}
            maxLength={MAX_APPOINTMENT_NOTES_LENGTH}
            defaultValue={values?.notes ?? ""}
            aria-describedby={NOTES_HINT_ID}
          />
        </label>
        <p id={NOTES_HINT_ID} className="text-secondary text-ink-muted">
          Hasta {MAX_APPOINTMENT_NOTES_LENGTH} caracteres.
        </p>
      </div>

      {state.status === "error" ? <Notice kind="error">{APPOINTMENT_ERROR_MESSAGES[state.code]}</Notice> : null}

      <SubmitButton pendingLabel="Guardando…" className={`${buttonPrimary} w-full`}>
        Guardar cita
      </SubmitButton>

      {/* Región viva siempre presente para que el aviso se anuncie al aparecer. */}
      <div role="status">
        {state.status === "saved" ? (
          <Notice kind="success" announce={false}>
            {APPOINTMENT_SAVED_MESSAGE}
          </Notice>
        ) : null}
      </div>
    </form>
  );
}
