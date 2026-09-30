"use client";

import type { ReactNode } from "react";
import type { SectionKey } from "@/components/app-shell/sections";
import { Notice } from "./notice";
import { PageHeader } from "./page-header";
import { buttonPrimary } from "./styles";

type ErrorPanelProps = {
  section: SectionKey;
  title: string;
  message: string;
  retry: () => void;
  children?: ReactNode;
};

// Cuerpo común de los error.tsx: la persona ve en qué sección está, qué pasó y cómo reintentar.
// Nunca muestra error.message.
export function ErrorPanel({ section, title, message, retry, children }: ErrorPanelProps) {
  return (
    <div className="flex flex-col gap-4 motion-safe:animate-screen-enter">
      <PageHeader section={section} title={title} size={section === "hoy" ? "greeting" : "title"} />
      <Notice kind="error">{message}</Notice>
      <button type="button" onClick={retry} className={`${buttonPrimary} w-full`}>
        Intentar de nuevo
      </button>
      {children}
    </div>
  );
}
