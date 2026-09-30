import Link from "next/link";
import { SECTIONS, type SectionKey } from "@/components/app-shell/sections";
import { buttonPrimary, card } from "./styles";

type EmptyStateProps = {
  section: SectionKey;
  title: string;
  text: string;
  action: { href: string; label: string };
};

// Un ícono de la sección, una frase y una sola acción. Sin ilustraciones de personas.
export function EmptyState({ section, title, text, action }: EmptyStateProps) {
  const { Icon, inkClass } = SECTIONS[section];

  return (
    <div className={`${card} flex flex-col items-center gap-3 py-8 text-center`}>
      <Icon className={`size-16 ${inkClass}`} />
      <p className="text-name text-ink">{title}</p>
      <p className="max-w-sm text-body text-ink-muted">{text}</p>
      <Link href={action.href} className={`${buttonPrimary} mt-2 w-full`}>
        {action.label}
      </Link>
    </div>
  );
}
