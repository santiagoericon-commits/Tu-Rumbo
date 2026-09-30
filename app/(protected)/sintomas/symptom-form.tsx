"use client";

import { useActionState, useState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { Notice } from "@/components/ui/notice";
import { buttonPrimary, field, fieldLabel } from "@/components/ui/styles";
import { SYMPTOM_ERROR_MESSAGES, SYMPTOM_SAVED_MESSAGE } from "@/lib/symptom-messages";
import { MAX_SYMPTOM_NOTES_LENGTH } from "@/lib/symptom-validation";
import { saveSymptomLogAction, type SaveSymptomState } from "./actions";
import { SymptomLevelField } from "./symptom-level-field";
import type { SymptomValues } from "./types";

const INITIAL: SaveSymptomState = { status: "idle" };
const NOTES_HINT_ID = "notas-limite";

export function SymptomForm({ todayLog }: { todayLog: SymptomValues | null }) {
  const [state, formAction] = useActionState(saveSymptomLogAction, INITIAL);
  // React reinicia el formulario al terminar la acción. Lo enviado se guarda aquí, en
  // el cliente (nunca en el estado de la acción, que viaja al servidor), para
  // recuperarlo si falla; si no, se muestran los valores del registro de hoy.
  const [submitted, setSubmitted] = useState<SymptomValues | null>(null);
  const values = state.status === "error" && submitted ? submitted : todayLog;

  function submit(formData: FormData) {
    const notes = formData.get("notes");
    setSubmitted({ level: Number(formData.get("level")), notes: typeof notes === "string" ? notes : null });
    formAction(formData);
  }

  return (
    <form action={submit} className="mt-3 flex flex-col gap-6">
      {todayLog ? (
        <p className="text-body text-ink-muted">Ya tienes un registro de hoy. Puedes cambiarlo.</p>
      ) : null}

      <SymptomLevelField defaultLevel={values?.level ?? null} />

      <div className="flex flex-col gap-2">
        <label className={fieldLabel}>
          ¿Algo que quieras contarle a tu equipo médico? (opcional)
          <textarea
            className={`${field} py-3`}
            name="notes"
            rows={4}
            maxLength={MAX_SYMPTOM_NOTES_LENGTH}
            defaultValue={values?.notes ?? ""}
            aria-describedby={NOTES_HINT_ID}
          />
        </label>
        <p id={NOTES_HINT_ID} className="text-secondary text-ink-muted">
          Hasta {MAX_SYMPTOM_NOTES_LENGTH} caracteres.
        </p>
      </div>

      {state.status === "error" ? <Notice kind="error">{SYMPTOM_ERROR_MESSAGES[state.code]}</Notice> : null}

      <SubmitButton pendingLabel="Guardando…" className={`${buttonPrimary} w-full`}>
        Guardar registro
      </SubmitButton>

      {/* Región viva siempre presente para que el aviso se anuncie al aparecer. */}
      <div role="status">
        {state.status === "saved" ? <Notice kind="success" announce={false}>{SYMPTOM_SAVED_MESSAGE}</Notice> : null}
      </div>
    </form>
  );
}
