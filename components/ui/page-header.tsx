import type { ReactNode } from "react";
import { SECTIONS, type SectionKey } from "@/components/app-shell/sections";

type PageHeaderProps = {
  section: SectionKey;
  title: string;
  size?: "greeting" | "title";
  subtitle?: string;
  children?: ReactNode;
};

// Banda con el tinte de la sección. El título va en ink, nunca en el acento.
export function PageHeader({ section, title, size = "title", subtitle, children }: PageHeaderProps) {
  const { Icon, tintClass, inkClass } = SECTIONS[section];
  const titleClass = size === "greeting" ? "text-greeting" : "text-title";

  return (
    <header className={`rounded-card p-5 ${tintClass}`}>
      <div className="flex items-center gap-4">
        <span className={`flex size-12 shrink-0 items-center justify-center rounded-full bg-surface ${inkClass}`}>
          <Icon className="size-6" />
        </span>
        <div className="min-w-0">
          <h1 className={`font-serif ${titleClass} text-ink`}>{title}</h1>
          {subtitle ? <p className="text-body text-ink-muted first-letter:uppercase">{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </header>
  );
}
