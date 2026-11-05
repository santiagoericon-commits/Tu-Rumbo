"use client";

import { useRef, useState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { Notice } from "@/components/ui/notice";
import { buttonPrimary, buttonQuiet, buttonSecondary, enterFromAbove, field, fieldLabel } from "@/components/ui/styles";
import type { AppointmentNotesErrorCode } from "@/lib/appointment-messages";
import { MAX_APPOINTMENT_NOTES_LENGTH } from "@/lib/appointment-validation";
import { useReturnFocus } from "../use-return-focus";
import type { UpdateNotesState } from "./actions";

export type UpdateAppointmentNotes = (previous: UpdateNotesState, formData: FormData) => Promise<UpdateNotesState>;

// Diccionario cerrado de esta tarjeta: la nota de una cita pasada no son "preguntas".
// [PENDIENTE REVISIÓN PROFESIONAL]
const ERROR_MESSAGES: Record<AppointmentNotesErrorCode, string> = {
  "datos-invalidos": `Revisa tu nota: hasta ${MAX_APPOINTMENT_NOTES_LENGTH} caracteres.`,
  generico: "No pudimos guardar tu nota. Inténtalo de nuevo.",
};
// [PENDIENTE REVISIÓN PROFESIONAL]
const SAVED_MESSAGE = "Tu nota quedó guardada.";

type PastNotesEditorProps = {
  appointmentId: string;
  title: string;
  notes: string | null;
  updateNotes: UpdateAppointmentNotes;
};

// Cita pasada (docs/marca.md §3): reutiliza las notas de la cita, sin campo nuevo. Al abrir, el foco
// va al campo; al cerrar o guardar, regresa al botón. Si falla, lo escrito se conserva.
export function PastNotesEditor({ appointmentId, title, notes, updateNotes }: PastNotesEditorProps) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(notes ?? "");
  const [error, setError] = useState<AppointmentNotesErrorCode | null>(null);
  const [saved, setSaved] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const hintId = `nota-cita-${appointmentId}`;
  useReturnFocus(editing, toggle);

  function close() {
    setEditing(false);
    setError(null);
  }

  async function save(formData: FormData) {
    setError(null);
    setSaved(false);
    const result = await updateNotes({ status: "idle" }, formData);
    if (result.status === "error") {
      setError(result.code);
      return;
    }
    setSaved(true);
    close();
  }

  return (
    <div className="mt-2">
      {notes && !editing ? (
        <p className="whitespace-pre-line wrap-break-word text-secondary text-ink-muted">{notes}</p>
      ) : null}

      {editing ? (
        <form action={save} className={`mt-3 flex flex-col gap-3 rounded-control bg-surface-muted p-4 ${enterFromAbove}`}>
          <input type="hidden" name="appointmentId" value={appointmentId} />
          <div className="flex flex-col gap-2">
            <label className={fieldLabel}>
              {/* [PENDIENTE REVISIÓN PROFESIONAL] Neutro: el campo ya puede traer las preguntas de antes. */}
              Tus notas de esta cita
              <textarea
                className={`${field} py-3`}
                name="notes"
                rows={4}
                maxLength={MAX_APPOINTMENT_NOTES_LENGTH}
                value={text}
                onChange={(event) => setText(event.target.value)}
                autoFocus
                aria-describedby={hintId}
              />
            </label>
            <p id={hintId} className="text-secondary text-ink-muted">
              Hasta {MAX_APPOINTMENT_NOTES_LENGTH} caracteres.
            </p>
          </div>
          {error ? <Notice kind="error">{ERROR_MESSAGES[error]}</Notice> : null}
          <SubmitButton pendingLabel="Guardando…" className={`${buttonPrimary} w-full`}>
            Guardar nota<span className="sr-only">: {title}</span>
          </SubmitButton>
          <button
            type="button"
            onClick={() => {
              setText(notes ?? "");
              close();
            }}
            className={`${buttonSecondary} w-full`}
          >
            No cambiar
          </button>
        </form>
      ) : (
        // [PENDIENTE REVISIÓN PROFESIONAL]
        <button
          ref={toggle}
          type="button"
          onClick={() => {
            setSaved(false);
            setEditing(true);
          }}
          className={`${buttonQuiet} -ml-3 text-left`}
        >
          ¿Quieres anotar algo de lo que te dijeron?<span className="sr-only">: {title}</span>
        </button>
      )}

      {/* Región viva siempre presente: el aviso de guardado se anuncia al aparecer. */}
      <div role="status">
        {saved ? (
          <Notice kind="success" announce={false} className="mt-2">
            {SAVED_MESSAGE}
          </Notice>
        ) : null}
      </div>
    </div>
  );
}
