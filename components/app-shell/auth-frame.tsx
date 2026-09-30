import type { ReactNode } from "react";
import { RumboMark } from "@/components/rumbo-mark";

type AuthFrameProps = {
  heading: string;
  settle?: boolean;
  children: ReactNode;
  footer: ReactNode;
};

// Primera impresión de Rumbo: marca, nombre y una frase; la tarea (entrar o crear cuenta) en una tarjeta.
export function AuthFrame({ heading, settle = false, children, footer }: AuthFrameProps) {
  return (
    <main className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center gap-8 px-4 pt-[calc(32px+env(safe-area-inset-top))] pb-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <RumboMark className="size-16" settle={settle} />
        <h1 className="font-serif text-greeting text-ink">Rumbo</h1>
        <p className="text-body text-balance text-ink-muted">Tus dosis, tus citas y tu registro diario, en un solo lugar.</p>
      </div>
      <section aria-labelledby="auth-titulo" className="flex flex-col gap-5 rounded-card bg-surface p-6 shadow-card">
        <h2 id="auth-titulo" className="font-serif text-subtitle text-ink">
          {heading}
        </h2>
        {children}
      </section>
      <p className="text-center text-body text-ink-muted">{footer}</p>
    </main>
  );
}
