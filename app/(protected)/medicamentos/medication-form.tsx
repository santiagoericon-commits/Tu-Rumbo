"use client";

import { useActionState, useState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { Notice } from "@/components/ui/notice";
import { buttonPrimary, buttonSecondary, field, fieldLabel } from "@/components/ui/styles";
import { MEDICATION_ERROR_MESSAGES } from "@/lib/medication-messages";
import { MAX_DOSAGE_LENGTH, MAX_NAME_LENGTH, MAX_TIMES } from "@/lib/medication-validation";
import { createMedicationAction, type CreateMedicationState } from "./actions";

const INITIAL: CreateMedicationState = { status: "idle" };

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
      <p className="text-body text-ink-muted">
        Escribe el medicamento, la dosis y los horarios tal como te los indicó tu médico.
      </p>

      <label className={fieldLabel}>
        Nombre del medicamento
        <input className={field} type="text" name="name" required maxLength={MAX_NAME_LENGTH} autoComplete="off" />
      </label>

      <label className={fieldLabel}>
        Dosis (opcional)
        <input className={field} type="text" name="dosage" maxLength={MAX_DOSAGE_LENGTH} autoComplete="off" />
      </label>

      <fieldset className="flex min-w-0 flex-col gap-3">
        <legend className="mb-3 text-body text-ink">Horarios</legend>
        {times.map((time, index) => (
          <div key={index} className="flex items-end gap-2">
            <label className={`${fieldLabel} grow`}>
              Horario {index + 1}
              <input
                className={field}
                type="time"
                name="times"
                required={index === 0}
                value={time}
                onChange={(event) => updateTime(index, event.target.value)}
              />
            </label>
            {index > 0 ? (
              <button type="button" onClick={() => removeTime(index)} className={`${buttonSecondary} min-h-13`}>
                Quitar<span className="sr-only"> horario {index + 1}</span>
              </button>
            ) : null}
          </div>
        ))}
        {times.length < MAX_TIMES ? (
          <button
            type="button"
            onClick={() => setTimes((current) => [...current, ""])}
            className={`${buttonSecondary} self-start`}
          >
            Agregar otro horario
          </button>
        ) : null}
      </fieldset>

      <label className={fieldLabel}>
        Fecha de inicio
        <input
          className={field}
          type="date"
          name="startDate"
          required
          defaultValue={todayLocal}
          min={todayLocal}
          max={maxStartDate}
        />
      </label>

      {state.status === "error" ? <Notice kind="error">{MEDICATION_ERROR_MESSAGES[state.code]}</Notice> : null}

      <SubmitButton pendingLabel="Guardando…" className={`${buttonPrimary} w-full`}>
        Guardar medicamento
      </SubmitButton>
    </form>
  );
}
