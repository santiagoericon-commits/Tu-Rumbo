"use client";

import { useActionState, useState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { SYMPTOM_ERROR_MESSAGES, SYMPTOM_SAVED_MESSAGE } from "@/lib/symptom-messages";
import { MAX_SYMPTOM_NOTES_LENGTH } from "@/lib/symptom-validation";
import { saveSymptomLogAction, type SaveSymptomState } from "./actions";
import { SymptomLevelField } from "./symptom-level-field";
import type { SymptomValues } from "./types";

const INITIAL: SaveSymptomState = { status: "idle" };
const NOTES_HINT_ID = "notas-limite";

const fieldClass =
  "w-full rounded-md border border-line bg-surface px-3 py-2 text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

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
    <form action={submit} className="mt-3 flex flex-col gap-5">
      {todayLog ? (
        <p className="text-base text-ink-muted">Ya tienes un registro de hoy. Puedes cambiarlo.</p>
      ) : null}

      <SymptomLevelField defaultLevel={values?.level ?? null} />

      <div className="flex flex-col gap-1">
        <label className="flex flex-col gap-1 text-base text-ink">
          ¿Algo que quieras contarle a tu equipo médico? (opcional)
          <textarea
            className={fieldClass}
            name="notes"
            rows={4}
            maxLength={MAX_SYMPTOM_NOTES_LENGTH}
            defaultValue={values?.notes ?? ""}
            aria-describedby={NOTES_HINT_ID}
          />
        </label>
        <p id={NOTES_HINT_ID} className="text-base text-ink-muted">
          Hasta {MAX_SYMPTOM_NOTES_LENGTH} caracteres.
        </p>
      </div>

      {state.status === "error" ? (
        <p role="alert" className="text-base text-ink">
          {SYMPTOM_ERROR_MESSAGES[state.code]}
        </p>
      ) : null}

      <SubmitButton pendingLabel="Guardando…" className="w-full bg-accent text-accent-ink">
        Guardar registro
      </SubmitButton>

      {/* Región viva siempre presente para que el aviso se anuncie al aparecer. */}
      <p role="status" className="text-base text-ink">
        {state.status === "saved" ? SYMPTOM_SAVED_MESSAGE : null}
      </p>
    </form>
  );
}
