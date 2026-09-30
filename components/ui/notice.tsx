import type { ReactNode } from "react";
import { CircleCheckIcon, InfoIcon } from "@/components/icons";

type NoticeProps = {
  kind: "error" | "success" | "info";
  children: ReactNode;
  className?: string;
};

// Aviso neutro: sin rojo ni verde. El tipo se distingue por ícono y texto.
// role="alert" solo en error y role="status" solo en éxito; info es contenido estático sin role.
export function Notice({ kind, children, className = "" }: NoticeProps) {
  const role = kind === "error" ? "alert" : kind === "success" ? "status" : undefined;
  const Icon = kind === "success" ? CircleCheckIcon : InfoIcon;

  return (
    <div role={role} className={`flex gap-3 rounded-card bg-surface-muted p-4 text-body text-ink ${className}`}>
      <Icon className="mt-0.5 size-6 text-ink" />
      <p className="min-w-0">{children}</p>
    </div>
  );
}
