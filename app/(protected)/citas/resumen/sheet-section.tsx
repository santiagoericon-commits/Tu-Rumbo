import type { ReactNode } from "react";
import { card, cardTitle } from "@/components/ui/styles";

type SheetSectionProps = { id: string; title: string; children: ReactNode };

// Sección de la hoja "Para mi cita": tarjeta en pantalla; en papel, sin tarjeta, con un filete fino
// arriba. Los tamaños en pt los da el bloque @media print de globals.css (docs/marca.md §5).
export function SheetSection({ id, title, children }: SheetSectionProps) {
  return (
    <section
      aria-labelledby={id}
      className={`${card} print:rounded-none print:bg-transparent print:p-0 print:pt-3 print:border-t print:border-line`}
    >
      {/* [PENDIENTE REVISIÓN PROFESIONAL] título de sección */}
      <h2 id={id} className={`${cardTitle} print:break-after-avoid`}>
        {title}
      </h2>
      {children}
    </section>
  );
}
