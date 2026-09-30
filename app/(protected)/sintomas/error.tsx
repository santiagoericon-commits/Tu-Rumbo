"use client";

import { SafetyNote } from "./safety-note";

// No se muestra ni se registra error.message: puede traer detalles técnicos.
export default function SintomasError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div>
      <p role="alert" className="text-base text-ink">
        No pudimos cargar tu registro. Inténtalo de nuevo.
      </p>
      <button
        type="button"
        onClick={retry}
        className="mt-4 min-h-12 touch-manipulation rounded-md bg-accent px-4 text-base text-accent-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Intentar de nuevo
      </button>
      <SafetyNote />
    </div>
  );
}
