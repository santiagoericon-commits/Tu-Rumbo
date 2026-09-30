import Link from "next/link";
import { logoutAction } from "@/app/auth-actions";
import { LogOutIcon } from "@/components/icons";
import { RumboMark } from "@/components/rumbo-mark";

// Barra superior no fija. "Cerrar sesión" queda aquí, lejos de las pestañas.
export function TopBar() {
  return (
    <header className="mx-auto flex w-full max-w-lg items-center justify-between gap-3 px-4 pt-[calc(12px+env(safe-area-inset-top))] pb-3">
      <Link href="/hoy" className="-ml-1 flex min-h-12 items-center gap-2 rounded-control px-1">
        <RumboMark className="size-8" />
        <span className="font-serif text-subtitle text-accent">Rumbo</span>
      </Link>
      <form action={logoutAction}>
        <button
          type="submit"
          className="-mr-2 inline-flex min-h-12 items-center gap-2 rounded-control px-3 text-secondary text-ink-muted transition-[background-color] duration-150 hover:bg-surface-muted active:bg-surface-muted"
        >
          <LogOutIcon className="size-5" />
          Cerrar sesión
        </button>
      </form>
    </header>
  );
}
