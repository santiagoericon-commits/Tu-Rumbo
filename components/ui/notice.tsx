import type { ReactNode } from "react";
import { CircleCheckIcon, InfoIcon } from "@/components/icons";
import { enterFromAbove } from "./styles";

type NoticeProps = {
  kind: "error" | "success" | "info";
  children: ReactNode;
  className?: string;
  // false cuando el aviso vive dentro de una región viva que ya existe (evita roles anidados).
  announce?: boolean;
  // Sustituye al ícono por defecto (ej. <NotebookGlyph closing /> al guardar síntomas). Decorativo.
  icon?: ReactNode;
};

// Aviso neutro: sin rojo ni verde. El tipo se distingue por ícono y texto.
// role="alert" solo en error y role="status" solo en éxito; info es contenido estático sin role.
export function Notice({ kind, children, className = "", announce = true, icon }: NoticeProps) {
  const role = !announce ? undefined : kind === "error" ? "alert" : kind === "success" ? "status" : undefined;
  const Icon = kind === "success" ? CircleCheckIcon : InfoIcon;
  // error y success entran (@starting-style); info es contenido estático y no se anima.
  const enter = kind === "info" ? "" : enterFromAbove;

  return (
    <div role={role} className={`flex gap-3 rounded-card bg-surface-muted p-4 text-body text-ink ${enter} ${className}`}>
      {/* Caja de 24 px centrada en la primera línea (28 px) del texto. */}
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center text-ink">
        {icon ?? <Icon className="size-6" />}
      </span>
      <p className="min-w-0">{children}</p>
    </div>
  );
}
