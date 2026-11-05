"use client";

import { ErrorPanel } from "@/components/ui/error-panel";

// No se muestra ni se registra error.message: puede traer detalles técnicos.
export default function ResumenError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <ErrorPanel
      section="citas"
      title="Para mi cita"
      message="No pudimos preparar tu resumen. Inténtalo de nuevo."
      retry={retry}
    />
  );
}
