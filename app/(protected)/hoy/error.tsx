"use client";

import { ErrorPanel } from "@/components/ui/error-panel";

// No se muestra ni se registra error.message: puede traer detalles técnicos.
export default function HoyError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <ErrorPanel
      section="hoy"
      title="Hoy"
      message="No pudimos cargar tus dosis de hoy. Inténtalo de nuevo."
      retry={retry}
    />
  );
}
