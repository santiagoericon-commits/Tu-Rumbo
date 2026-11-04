"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { PillIcon } from "@/components/icons";
import { SubmitButton } from "@/components/submit-button";
import { Notice } from "@/components/ui/notice";
import { buttonPrimary, buttonQuiet, buttonSecondary, enterFromAbove, textLink } from "@/components/ui/styles";
import { SUPPLY_ERROR_MESSAGES, SUPPLY_SAVED_MESSAGE, type SupplyErrorCode } from "@/lib/medication-messages";
import { updateSupplyAction } from "./actions";
import { SupplyCountField } from "./supply-count-field";
import type { SupplyView } from "./types";

type SupplyEditorProps = { medicationId: string; medicationName: string; supply: SupplyView | null };

// Línea de surtido (docs/marca.md §5) y su editor dentro de la tarjeta. Sin barras, porcentajes,
// color ni íconos de alerta. Al abrir, el foco va al campo; al cerrar, regresa al botón.
export function SupplyEditor({ medicationId, medicationName, supply }: SupplyEditorProps) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<SupplyErrorCode | null>(null);
  const [saved, setSaved] = useState(false);
  // React reinicia el formulario al terminar la acción: lo enviado se guarda aquí para recuperarlo si falla.
  const [draft, setDraft] = useState<{ value: string; version: number } | null>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  function close() {
    setEditing(false);
    setDraft(null);
    requestAnimationFrame(() => toggle.current?.focus());
  }

  async function save(formData: FormData) {
    const value = formData.get("supplyCount");
    setError(null);
    setSaved(false);
    const result = await updateSupplyAction({ status: "idle" }, formData);
    if (result.status === "error") {
      setError(result.code);
      setDraft((current) => ({ value: typeof value === "string" ? value : "", version: (current?.version ?? 0) + 1 }));
      return;
    }
    setSaved(true);
    close();
  }

  const fieldDefault = draft ? (draft.value === "" ? null : Number(draft.value)) : (supply?.remaining ?? null);

  return (
    <div className="mt-3">
      {supply ? (
        <>
          <p className="flex items-start gap-2 text-secondary text-ink">
            <PillIcon className="mt-0.5 size-5 text-ink-muted" />
            <span className="tabular-nums">{supply.line}</span>
          </p>
          {/* [PENDIENTE REVISIÓN PROFESIONAL] */}
          <p className="mt-1 text-secondary text-ink-muted">Se calcula con las dosis que marcas como tomadas.</p>
          {supply.needsSupport ? (
            // [PENDIENTE REVISIÓN PROFESIONAL]
            <Link href="/apoyo" className={`${textLink} text-secondary`}>
              ¿Necesitas apoyo con tu medicamento?
            </Link>
          ) : null}
        </>
      ) : null}

      {editing ? (
        <form action={save} className={`mt-3 flex flex-col gap-3 rounded-control bg-surface-muted p-4 ${enterFromAbove}`}>
          <input type="hidden" name="medicationId" value={medicationId} />
          <SupplyCountField
            key={draft?.version ?? 0}
            hintId={`tomas-${medicationId}`}
            defaultValue={fieldDefault}
            autoFocus
          />
          {error ? <Notice kind="error">{SUPPLY_ERROR_MESSAGES[error]}</Notice> : null}
          <SubmitButton pendingLabel="Guardando…" className={`${buttonPrimary} w-full`}>
            Guardar tomas<span className="sr-only">: {medicationName}</span>
          </SubmitButton>
          <button type="button" onClick={close} className={`${buttonSecondary} w-full`}>
            No cambiar
          </button>
        </form>
      ) : (
        <button ref={toggle} type="button" onClick={() => setEditing(true)} className={`${buttonQuiet} -ml-3`}>
          {supply ? "Actualizar tomas" : "Anotar cuántas tomas te quedan"}
          <span className="sr-only">: {medicationName}</span>
        </button>
      )}

      <div role="status">{saved ? <p className="sr-only">{SUPPLY_SAVED_MESSAGE}</p> : null}</div>
    </div>
  );
}
