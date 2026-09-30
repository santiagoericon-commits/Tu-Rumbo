"use client";

import { ErrorPanel } from "@/components/ui/error-panel";

// No se muestra ni se registra error.message: puede traer detalles técnicos.
export default function MedicamentosError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <ErrorPanel
      section="medicamentos"
      title="Medicamentos"
      message="No pudimos cargar tus medicamentos. Inténtalo de nuevo."
      retry={retry}
    />
  );
}
