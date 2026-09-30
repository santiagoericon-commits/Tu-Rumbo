"use client";

import { ErrorPanel } from "@/components/ui/error-panel";

// No se muestra ni se registra error.message: puede traer detalles técnicos.
export default function CitasError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <ErrorPanel
      section="citas"
      title="Citas"
      message="No pudimos cargar tus citas. Inténtalo de nuevo."
      retry={retry}
    />
  );
}
