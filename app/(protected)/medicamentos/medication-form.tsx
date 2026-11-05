"use client";

import { useActionState, useState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { Notice } from "@/components/ui/notice";
import { buttonPrimary, buttonSecondary, enterFromAbove, field, fieldLabel } from "@/components/ui/styles";
import { MEDICATION_ERROR_MESSAGES } from "@/lib/medication-messages";
import { MAX_DOSAGE_LENGTH, MAX_NAME_LENGTH, MAX_TIMES } from "@/lib/medication-validation";
import { clearFirstMedication, markFirstMedication } from "../first-medication";
import { createMedicationAction, type CreateMedicationState } from "./actions";
import { SupplyCountField } from "./supply-count-field";

const INITIAL: CreateMedicationState = { status: "idle" };

// Next no documenta un detector público en el cliente; su error de redirect() lleva un digest que
// empieza con "NEXT_REDIRECT" (sin importar rutas internas de next/dist).
function isRedirect(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("digest" in error)) return false;
  return typeof error.digest === "string" && error.digest.startsWith("NEXT_REDIRECT");
}

// isFirst: la lista está vacía; si este alta sale bien, /hoy muestra la tarjeta de primer medicamento.
type MedicationFormProps = { todayLocal: string; maxStartDate: string; isFirst: boolean };

export function MedicationForm({ todayLocal, maxStartDate, isFirst }: MedicationFormProps) {
  // Si sale bien, la acción redirige a /hoy: Next rechaza la promesa con un error de redirección que
  // se relanza intacto y la bandera sigue en pie. Con un error devuelto o lanzado (red, 500), se limpia.
  async function create(previous: CreateMedicationState, formData: FormData): Promise<CreateMedicationState> {
    try {
      const result = await createMedicationAction(previous, formData);
      if (result.status === "error") clearFirstMedication();
      return result;
    } catch (error) {
      if (!isRedirect(error)) clearFirstMedication();
      throw error;
    }
  }
  const [state, formAction] = useActionState(create, INITIAL);
  // Un horario por entrada; empieza con uno vacío y se agregan hasta MAX_TIMES.
  const [times, setTimes] = useState<string[]>([""]);

  function updateTime(index: number, value: string) {
    setTimes((current) => current.map((time, i) => (i === index ? value : time)));
  }

  // Con keys por índice se desmonta la última fila, así que el input anterior sigue ahí para recibir el foco.
  function removeTime(index: number, fieldset: Element | null) {
    fieldset?.querySelectorAll<HTMLInputElement>('input[name="times"]')[index - 1]?.focus();
    setTimes((current) => current.filter((_, i) => i !== index));
  }

  return (
    <form
      action={formAction}
      onSubmit={() => (isFirst ? markFirstMedication() : clearFirstMedication())}
      className="mt-3 flex flex-col gap-5"
    >
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
          // Las filas nuevas (index > 0) solo se montan al agregar: entran y reciben el foco.
          <div key={index} className={`flex items-end gap-2 ${index > 0 ? enterFromAbove : ""}`}>
            <label className={`${fieldLabel} grow`}>
              Horario {index + 1}
              <input
                className={field}
                type="time"
                name="times"
                autoFocus={index > 0}
                required={index === 0}
                value={time}
                onChange={(event) => updateTime(index, event.target.value)}
              />
            </label>
            {index > 0 ? (
              <button
                type="button"
                onClick={(event) => removeTime(index, event.currentTarget.closest("fieldset"))}
                className={`${buttonSecondary} min-h-13`}
              >
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

      <SupplyCountField hintId="tomas-alta" />

      {state.status === "error" ? <Notice kind="error">{MEDICATION_ERROR_MESSAGES[state.code]}</Notice> : null}

      <SubmitButton pendingLabel="Guardando…" className={`${buttonPrimary} w-full`}>
        Guardar medicamento
      </SubmitButton>
    </form>
  );
}
