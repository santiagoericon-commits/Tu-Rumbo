"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { Notice } from "@/components/ui/notice";
import { buttonSecondary, field, fieldLabel, textLink } from "@/components/ui/styles";
import { APPOINTMENT_NOTES_ERROR_MESSAGES, APPOINTMENT_NOTES_SAVED_MESSAGE } from "@/lib/appointment-messages";
import { MAX_APPOINTMENT_NOTES_LENGTH } from "@/lib/appointment-validation";
import { updateAppointmentNotesAction, type UpdateNotesState } from "../actions";
import { SheetSection } from "./sheet-section";

const INITIAL: UpdateNotesState = { status: "idle" };
const HINT_ID = "preguntas-limite";
const PRINT_RULED_LINES = 4;

type QuestionsFormProps = { appointment: { id: string; notes: string | null } | null };

// "Lo que quiero preguntar" = las notas de la próxima cita. El textarea es controlado: en papel sale el
// texto que se ve en pantalla, esté guardado o no. Si está vacío, quedan renglones para escribir a mano.
export function QuestionsForm({ appointment }: QuestionsFormProps) {
  const [state, formAction] = useActionState(updateAppointmentNotesAction, INITIAL);
  const [text, setText] = useState(appointment?.notes ?? "");

  return (
    <SheetSection id="resumen-preguntas" title="Lo que quiero preguntar">
      {appointment ? (
        <form action={formAction} className="mt-3 flex flex-col gap-4 print:hidden">
          <input type="hidden" name="appointmentId" value={appointment.id} />
          <div className="flex flex-col gap-2">
            <label className={fieldLabel}>
              Escribe aquí lo que quieres preguntar
              <textarea
                className={`${field} py-3`}
                name="notes"
                rows={4}
                maxLength={MAX_APPOINTMENT_NOTES_LENGTH}
                value={text}
                onChange={(event) => setText(event.target.value)}
                aria-describedby={HINT_ID}
              />
            </label>
            <p id={HINT_ID} className="text-secondary text-ink-muted">
              Hasta {MAX_APPOINTMENT_NOTES_LENGTH} caracteres.
            </p>
          </div>

          {state.status === "error" ? (
            <Notice kind="error">{APPOINTMENT_NOTES_ERROR_MESSAGES[state.code]}</Notice>
          ) : null}

          <SubmitButton pendingLabel="Guardando…" className={`${buttonSecondary} w-full`}>
            Guardar preguntas
          </SubmitButton>

          {/* Región viva siempre presente para que el aviso se anuncie al aparecer. */}
          <div role="status">
            {state.status === "saved" ? (
              <Notice kind="success" announce={false}>
                {APPOINTMENT_NOTES_SAVED_MESSAGE}
              </Notice>
            ) : null}
          </div>
        </form>
      ) : (
        <div className="mt-2 print:hidden">
          <p className="text-secondary text-ink-muted">No tienes una cita próxima. Agrégala para anotar tus preguntas.</p>
          <Link href="/citas#agregar-cita" className={textLink}>
            Agregar cita
          </Link>
        </div>
      )}

      <div className="hidden print:block">
        {text.trim() !== "" ? (
          <p className="mt-1 whitespace-pre-line wrap-break-word text-body text-ink">{text}</p>
        ) : (
          <div aria-hidden="true">
            {Array.from({ length: PRINT_RULED_LINES }, (_, i) => (
              <div key={i} className="h-[9mm] border-b border-line" />
            ))}
          </div>
        )}
      </div>
    </SheetSection>
  );
}
