"use client";

import { useRef, useState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { Notice } from "./notice";
import { buttonPrimary, buttonQuiet, buttonSecondary, enterFromAbove } from "./styles";

type DeleteConfirmProps = {
  question: string;
  itemName: string;
  failedMessage: string;
  onDelete: () => Promise<{ ok: boolean }>;
};

// Eliminar en dos pasos, dentro de la tarjeta. Al abrir, el foco va a la opción segura;
// al cancelar, regresa a "Eliminar". La caja entra con @starting-style (solo opacidad con reduced motion).
export function DeleteConfirm({ question, itemName, failedMessage, onDelete }: DeleteConfirmProps) {
  const [confirming, setConfirming] = useState(false);
  const [failed, setFailed] = useState(false);
  const deleteButton = useRef<HTMLButtonElement>(null);

  function close() {
    setConfirming(false);
    requestAnimationFrame(() => deleteButton.current?.focus());
  }

  async function remove() {
    setFailed(false);
    const result = await onDelete();
    if (!result.ok) {
      setFailed(true);
      close();
    }
    // Si tuvo éxito, la página se revalida y el elemento desaparece.
  }

  return (
    <>
      {confirming ? (
        <form
          action={remove}
          className={`mt-4 flex flex-col gap-3 rounded-control bg-surface-muted p-4 ${enterFromAbove}`}
        >
          <p className="text-body text-ink">{question}</p>
          <SubmitButton pendingLabel="Eliminando…" className={`${buttonPrimary} w-full`}>
            Sí, eliminar<span className="sr-only">: {itemName}</span>
          </SubmitButton>
          <button type="button" autoFocus onClick={close} className={`${buttonSecondary} w-full`}>
            No, conservar
          </button>
        </form>
      ) : (
        <button ref={deleteButton} type="button" onClick={() => setConfirming(true)} className={`${buttonQuiet} mt-3 -ml-3`}>
          Eliminar<span className="sr-only">: {itemName}</span>
        </button>
      )}

      {failed ? (
        <Notice kind="error" className="mt-3">
          {failedMessage}
        </Notice>
      ) : null}
    </>
  );
}
