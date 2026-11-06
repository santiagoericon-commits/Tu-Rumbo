import Link from "next/link";
import type { ReactNode } from "react";
import { SECTIONS, type SectionKey } from "@/components/app-shell/sections";
import { buttonPrimary, card } from "./styles";

type EmptyStateProps = {
  section: SectionKey;
  title: string;
  text: string;
  // Si viene (familia "camino y brújula", components/illustrations), sustituye al ícono de sección.
  illustration?: ReactNode;
  // Opcional: hay estados vacíos sin acción (historial de síntomas, secciones de Para mi cita).
  action?: { href: string; label: string };
};

// Una ilustración o el ícono de la sección, una frase y, a lo más, una sola acción. Sin personas.
export function EmptyState({ section, title, text, illustration, action }: EmptyStateProps) {
  const { Icon, inkClass } = SECTIONS[section];

  return (
    <div className={`${card} flex flex-col items-center gap-3 py-8 text-center`}>
      {illustration ?? <Icon className={`size-16 ${inkClass}`} />}
      <p className="text-name text-ink">{title}</p>
      <p className="max-w-sm text-body text-ink-muted">{text}</p>
      {action ? (
        <Link href={action.href} className={`${buttonPrimary} mt-2 w-full`}>
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
