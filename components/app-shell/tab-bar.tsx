"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SECTION_ORDER, SECTIONS } from "./sections";

// Barra inferior fija. data-app-tabbar hace que globals.css reserve su alto al final del body
// (el footer queda visible arriba) y como scroll-padding (el foco nunca queda debajo).
// La pestaña activa se marca con aria-current, trazo, etiqueta en accent y barra superior: nunca solo color.
export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Secciones"
      data-app-tabbar
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-[calc(8px+env(safe-area-inset-bottom))]"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-4">
        {SECTION_ORDER.map((key) => {
          const { href, tabLabel, Icon } = SECTIONS[key];
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={key} className="min-w-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex h-tabbar flex-col items-center justify-center gap-1 pt-1 text-tab transition-colors duration-150 active:bg-surface-muted ${
                  active ? "text-accent" : "text-ink-muted"
                }`}
              >
                {active ? (
                  <span aria-hidden="true" className="absolute inset-x-4 top-0 h-0.75 rounded-b-full bg-accent" />
                ) : null}
                <Icon className="size-6" active={active} />
                {/* Con zoom alto la etiqueta se recorta con "…" en vez de encimarse; el texto completo sigue en el DOM. */}
                <span className="max-w-full truncate px-0.5" data-tab-label={key}>
                  {tabLabel}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
