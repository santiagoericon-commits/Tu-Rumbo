"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SECTION_ORDER, SECTIONS, type SectionKey } from "./sections";

// translate en % del propio ancho (1/4 de la fila): cada paso es una columna. Clases completas para Tailwind.
const INDICATOR_POSITION = ["translate-x-0", "translate-x-full", "translate-x-[200%]", "translate-x-[300%]"];

function sectionFor(pathname: string): SectionKey | null {
  return (
    SECTION_ORDER.find((key) => {
      const { href } = SECTIONS[key];
      return pathname === href || pathname.startsWith(`${href}/`);
    }) ?? null
  );
}

// Barra inferior fija. data-app-tabbar hace que globals.css reserve su alto al final del body
// (el footer queda visible arriba) y como scroll-padding (el foco nunca queda debajo).
// La pestaña activa se marca con aria-current, trazo, etiqueta en accent y barra superior: nunca solo color.
// La pestaña tocada se ve activa en el siguiente frame (onNavigate), sin esperar al servidor. Ese estado
// vive solo en memoria y se descarta cuando cambia la ruta; aria-current sigue a la ruta real.
export function TabBar() {
  const pathname = usePathname();
  const current = sectionFor(pathname);
  const [pending, setPending] = useState<SectionKey | null>(null);
  // Reinicio explícito al cambiar la ruta (también con atrás del navegador): un pending viejo nunca revive.
  const [seenPathname, setSeenPathname] = useState(pathname);
  if (seenPathname !== pathname) {
    setSeenPathname(pathname);
    setPending(null);
  }
  const shown = pending ?? current;
  const shownIndex = shown ? SECTION_ORDER.indexOf(shown) : -1;

  return (
    <nav
      aria-label="Secciones"
      data-app-tabbar
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-[calc(8px+env(safe-area-inset-bottom))]"
    >
      <div className="relative mx-auto max-w-lg">
        <ul className="grid grid-cols-4">
          {SECTION_ORDER.map((key) => {
            const { href, tabLabel, Icon } = SECTIONS[key];
            const active = key === shown;
            return (
              <li key={key} className="min-w-0">
                <Link
                  href={href}
                  aria-current={key === current ? "page" : undefined}
                  onNavigate={(event) => {
                    // Tocar la pestaña que ya se ve activa no hace nada.
                    if (active) {
                      event.preventDefault();
                      return;
                    }
                    setPending(key);
                  }}
                  className={`relative flex h-tabbar flex-col items-center justify-center gap-1 pt-1 text-tab transition-colors duration-150 active:bg-surface-muted ${
                    active ? "text-accent" : "text-ink-muted"
                  }`}
                >
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
        {/* Una sola barra que se desliza entre columnas; con reduced motion salta. */}
        {shownIndex >= 0 ? (
          <span
            aria-hidden="true"
            data-tab-indicator
            className={`pointer-events-none absolute top-0 left-0 w-1/4 px-4 motion-safe:transition-[translate] motion-safe:duration-200 motion-safe:ease-out-strong ${INDICATOR_POSITION[shownIndex]}`}
          >
            <span className="block h-0.75 rounded-b-full bg-accent" />
          </span>
        ) : null}
      </div>
    </nav>
  );
}
