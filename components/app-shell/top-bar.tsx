"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/auth-actions";
import { HandHelpingIcon, LogOutIcon } from "@/components/icons";
import { RumboMark } from "@/components/rumbo-mark";

const quietAction =
  "inline-flex min-h-12 items-center gap-2 rounded-control px-3 text-secondary text-ink-muted transition-[background-color] duration-150 hover:bg-surface-muted active:bg-surface-muted";

// Barra superior no fija. "Apoyo" (P9) es la entrada a /apoyo sin quinta pestaña (docs/marca.md §5):
// ícono siempre con etiqueta. "Salir" queda aquí, lejos de las pestañas.
export function TopBar() {
  const pathname = usePathname();
  const onSupport = pathname === "/apoyo";

  return (
    <header className="mx-auto flex w-full max-w-lg flex-wrap items-center justify-between gap-x-3 px-4 pt-[calc(12px+env(safe-area-inset-top))] pb-3">
      <Link href="/hoy" className="-ml-1 flex min-h-12 items-center gap-2 rounded-control px-1">
        <RumboMark className="size-8" />
        <span className="font-serif text-subtitle text-accent">Rumbo</span>
      </Link>
      <div className="-mr-2 flex flex-wrap items-center">
        <Link
          href="/apoyo"
          aria-current={onSupport ? "page" : undefined}
          className={`${quietAction} ${onSupport ? "text-ink" : ""}`}
        >
          <HandHelpingIcon className="size-5" active={onSupport} />
          Apoyo
        </Link>
        <form action={logoutAction}>
          <button type="submit" className={quietAction}>
            <LogOutIcon className="size-5" />
            Salir
          </button>
        </form>
      </div>
    </header>
  );
}
