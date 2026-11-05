import type { ReactNode } from "react";
import { RuledSheetIllustration } from "@/components/illustrations";

type CompactEmptyProps = { children: ReactNode; textClassName?: string };

// Estado vacío compacto para una sección que ya vive dentro de una tarjeta con título (historial de
// síntomas, secciones de "Para mi cita"): EmptyState sería una tarjeta dentro de otra. Hoja con
// renglones a 64 px + la frase. En papel no sale la ilustración, solo el texto.
export function CompactEmpty({ children, textClassName = "text-body text-ink-muted" }: CompactEmptyProps) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-4 print:mt-1">
      <RuledSheetIllustration className="size-16 print:hidden" />
      <p className={`min-w-0 flex-1 basis-40 ${textClassName}`}>{children}</p>
    </div>
  );
}
