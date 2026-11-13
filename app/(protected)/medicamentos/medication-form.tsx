"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { Notice } from "@/components/ui/notice";
import { buttonPrimary, field, fieldLabel, formGroup, formGroupTitle, optionalTag } from "@/components/ui/styles";
import { MEDICATION_ERROR_MESSAGES } from "@/lib/medication-messages";
import { MAX_DOSAGE_LENGTH, MAX_NAME_LENGTH } from "@/lib/medication-validation";
import { clearFirstMedication, markFirstMedication } from "../first-medication";
import { createMedicationAction, type CreateMedicationState } from "./actions";
import { ScheduleTimesField } from "./schedule-times-field";
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
  return (
    <form
      action={formAction}
      onSubmit={() => (isFirst ? markFirstMedication() : clearFirstMedication())}
      className="mt-5 flex flex-col gap-6"
    >
      {/* Grupo 1: qué tomas. La indicación "tal como te los indicó tu médico" vive en el encabezado (page.tsx). */}
      <fieldset className={formGroup}>
        {/* [PENDIENTE REVISIÓN PROFESIONAL] */}
        <legend className={`${formGroupTitle} float-left w-full`}>Qué tomas</legend>
        <label className={fieldLabel}>
          Nombre del medicamento
          <input className={field} type="text" name="name" required maxLength={MAX_NAME_LENGTH} autoComplete="off" />
        </label>

        <label className={fieldLabel}>
          <span>
            Dosis <span className={optionalTag}>opcional</span>
          </span>
          <input className={field} type="text" name="dosage" maxLength={MAX_DOSAGE_LENGTH} autoComplete="off" />
        </label>
      </fieldset>

      {/* Grupo 2: cuándo. Los horarios son un fieldset propio dentro del grupo. */}
      <fieldset className={formGroup}>
        {/* [PENDIENTE REVISIÓN PROFESIONAL] */}
        <legend className={`${formGroupTitle} float-left w-full`}>Cuándo</legend>

        <ScheduleTimesField />

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
      </fieldset>

      {/* Grupo 3: surtido (opcional). */}
      <fieldset className={formGroup}>
        {/* [PENDIENTE REVISIÓN PROFESIONAL] */}
        <legend className={`${formGroupTitle} float-left w-full`}>Surtido</legend>
        <SupplyCountField hintId="tomas-alta" />
      </fieldset>

      {state.status === "error" ? <Notice kind="error">{MEDICATION_ERROR_MESSAGES[state.code]}</Notice> : null}

      <SubmitButton pendingLabel="Guardando…" className={`${buttonPrimary} w-full`}>
        Guardar medicamento
      </SubmitButton>
    </form>
  );
}
