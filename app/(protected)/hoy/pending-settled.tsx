"use client";

import { useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

// Va dentro de un <form>: avisa cuando el envío termina (pending pasa de true a false). El efecto
// corre después del commit en que SubmitButton deja de estar disabled, así que ya se puede enfocar.
export function PendingSettled({ onSettled }: { onSettled: () => void }) {
  const { pending } = useFormStatus();
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending) onSettled();
    wasPending.current = pending;
  }, [pending, onSettled]);

  return null;
}
