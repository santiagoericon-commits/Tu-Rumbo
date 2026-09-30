"use client";

import { useActionState, useState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { MEDICATION_ERROR_MESSAGES } from "@/lib/medication-messages";
import { MAX_DOSAGE_LENGTH, MAX_NAME_LENGTH, MAX_TIMES } from "@/lib/medication-validation";
import { createMedicationAction, type CreateMedicationState } from "./actions";

const INITIAL: CreateMedicationState = { status: "idle" };

const fieldClass =
  "min-h-12 w-full rounded-md border border-line bg-surface px-3 text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const secondaryButtonClass =
  "inline-flex min-h-12 touch-manipulation items-center rounded-md border border-line px-4 text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

type MedicationFormProps = { todayLocal: string; maxStartDate: string };

export function MedicationForm({ todayLocal, maxStartDate }: MedicationFormProps) {
  const [state, formAction] = useActionState(createMedicationAction, INITIAL);
  // Un horario por entrada; empieza con uno vacío y se agregan hasta MAX_TIMES.
  const [times, setTimes] = useState<string[]>([""]);

  function updateTime(index: number, value: string) {
    setTimes((current) => current.map((time, i) => (i === index ? value : time)));
  }

  function removeTime(index: number) {
    setTimes((current) => current.filter((_, i) => i !== index));
  }

  return (
    <form action={formAction} className="mt-3 flex flex-col gap-5">
      {/* [PENDIENTE REVISIÓN PROFESIONAL] */}
      <p className="text-base text-ink-muted">
        Escribe el medicamento, la dosis y los horarios tal como te los indicó tu médico.
      </p>

      <label className="flex flex-col gap-1 text-base text-ink">
        Nombre del medicamento
        <input className={fieldClass} type="text" name="name" required maxLength={MAX_NAME_LENGTH} autoComplete="off" />
      </label>

      <label className="flex flex-col gap-1 text-base text-ink">
        Dosis (opcional)
        <input className={fieldClass} type="text" name="dosage" maxLength={MAX_DOSAGE_LENGTH} autoComplete="off" />
      </label>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-base text-ink">Horarios</legend>
        {times.map((time, index) => (
          <div key={index} className="flex items-end gap-2">
            <label className="flex grow flex-col gap-1 text-base text-ink">
              Horario {index + 1}
              <input
                className={fieldClass}
                type="time"
                name="times"
                required={index === 0}
                value={time}
                onChange={(event) => updateTime(index, event.target.value)}
              />
            </label>
            {index > 0 ? (
              <button type="button" onClick={() => removeTime(index)} className={secondaryButtonClass}>
                Quitar<span className="sr-only"> horario {index + 1}</span>
              </button>
            ) : null}
          </div>
        ))}
        {times.length < MAX_TIMES ? (
          <button
            type="button"
            onClick={() => setTimes((current) => [...current, ""])}
            className={`${secondaryButtonClass} self-start`}
          >
            Agregar otro horario
          </button>
        ) : null}
      </fieldset>

      <label className="flex flex-col gap-1 text-base text-ink">
        Fecha de inicio
        <input
          className={fieldClass}
          type="date"
          name="startDate"
          required
          defaultValue={todayLocal}
          min={todayLocal}
          max={maxStartDate}
        />
      </label>

      {state.status === "error" ? (
        <p role="alert" className="text-base text-ink">
          {MEDICATION_ERROR_MESSAGES[state.code]}
        </p>
      ) : null}

      <SubmitButton pendingLabel="Guardando…" className="w-full bg-accent text-accent-ink">
        Guardar medicamento
      </SubmitButton>
    </form>
  );
}
