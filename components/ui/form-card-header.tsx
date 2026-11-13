import { SECTIONS, type SectionKey } from "@/components/app-shell/sections";
import { cardTitle } from "./styles";

type FormCardHeaderProps = { section: SectionKey; titleId: string; title: string; intro?: string };

// Encabezado de una tarjeta de formulario de alta: ícono de la sección (identidad, nunca acción),
// título y una línea de contexto. Con zoom alto el texto baja debajo del ícono (basis-40).
export function FormCardHeader({ section, titleId, title, intro }: FormCardHeaderProps) {
  const { Icon, tintClass, inkClass } = SECTIONS[section];
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      <span className={`flex size-12 shrink-0 items-center justify-center rounded-full ${tintClass} ${inkClass}`}>
        <Icon className="size-6" />
      </span>
      <div className="min-w-0 flex-1 basis-40">
        <h2 id={titleId} className={cardTitle}>
          {title}
        </h2>
        {intro ? <p className="text-secondary text-ink-muted">{intro}</p> : null}
      </div>
    </div>
  );
}
