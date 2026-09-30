"use client";

import { ErrorPanel } from "@/components/ui/error-panel";
import { SafetyNote } from "./safety-note";

// No se muestra ni se registra error.message: puede traer detalles técnicos.
// La línea de seguridad se conserva también aquí.
export default function SintomasError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <ErrorPanel
      section="sintomas"
      title="Síntomas"
      message="No pudimos cargar tu registro. Inténtalo de nuevo."
      retry={retry}
    >
      <SafetyNote />
    </ErrorPanel>
  );
}
