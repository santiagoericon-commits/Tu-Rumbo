"use client";

import { buttonPrimary } from "@/components/ui/styles";

// window.print() abre el diálogo del sistema; nada se genera ni se guarda en el servidor.
// En una PWA instalada en iOS puede no abrirse: la pista le dice qué hacer en ese caso.
export function PrintButton() {
  return (
    <div className="flex flex-col gap-2 print:hidden">
      <button type="button" onClick={() => window.print()} className={`${buttonPrimary} w-full`}>
        Imprimir o guardar PDF
      </button>
      {/* [PENDIENTE REVISIÓN PROFESIONAL] */}
      <p className="text-secondary text-ink-muted">Si no se abre, usa Compartir y luego Imprimir.</p>
    </div>
  );
}
