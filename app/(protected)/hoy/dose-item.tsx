"use client";

import type { SettableDoseStatus } from "@/lib/dose-status";
import { useCallback, useRef, useState, type FormEvent } from "react";
import { SubmitButton } from "@/components/submit-button";
import { DoseStatusGlyph } from "@/components/ui/dose-status-glyph";
import { Notice } from "@/components/ui/notice";
import { buttonPrimary, buttonSecondary, card } from "@/components/ui/styles";
import { PendingSettled } from "./pending-settled";
import type { DoseUpdate, DoseView, UpdateDoseStatus } from "./types";

type DoseItemProps = {
  dose: DoseView;
  applyOptimistic: (update: DoseUpdate) => void;
  updateStatus: UpdateDoseStatus;
  // Avisa en el toque (urgente) qué estado se pidió; TodayDoses decide con eso si anima el cierre.
  onTap?: (next: SettableDoseStatus) => void;
};

const SETTLE_CLASS = { a: "motion-safe:animate-settle-a", b: "motion-safe:animate-settle-b" } as const;

// Pendiente y tomada se distinguen por ícono, texto y botón; la tarjeta no cambia de color.
// Reconocimiento sereno (docs/marca.md §3): el check se dibuja (DoseStatusGlyph) y la tarjeta se
// asienta solo al tocar; al montar o recargar no se mueve nada.
export function DoseItem({ dose, applyOptimistic, updateStatus, onTap }: DoseItemProps) {
  const [failed, setFailed] = useState(false);
  // Alterna a/b en cada toque para reiniciar la animación. null al montar: nunca anima al cargar.
  const [settle, setSettle] = useState<"a" | "b" | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const hadFocus = useRef(false);
  // "missed" se trata como pendiente: la app nunca lo asigna ni lo resalta.
  const isTaken = dose.status === "taken";

  // onSubmit es una actualización urgente: el asiento se pinta en el siguiente frame. Un setState
  // dentro de toggle() quedaría en la transición y se vería hasta que responda el servidor.
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    hadFocus.current = event.currentTarget.contains(document.activeElement);
    setSettle((current) => (current === "a" ? "b" : "a"));
    onTap?.(isTaken ? "pending" : "taken");
  }

  // El botón queda disabled mientras guarda y el navegador puede soltar el foco al body. Al terminar
  // (ya habilitado), si el foco estaba en este formulario y nadie lo movió, regresa al botón.
  const restoreFocus = useCallback(() => {
    if (!hadFocus.current) return;
    hadFocus.current = false;
    const active = document.activeElement;
    if (active === null || active === document.body) form.current?.querySelector("button")?.focus();
  }, []);

  async function toggle() {
    const next = isTaken ? "pending" : "taken";
    setFailed(false);
    applyOptimistic({ id: dose.id, status: next });
    const result = await updateStatus(dose.id, next);
    if (!result.ok) setFailed(true);
  }

  return (
    <li className={`${card} ${settle ? SETTLE_CLASS[settle] : ""}`}>
      {/* flex-wrap: con zoom alto el estado baja bajo la hora en vez de desbordar. */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <p className="text-time text-ink tabular-nums">
          <time dateTime={dose.scheduledAt} className="whitespace-nowrap">
            {dose.timeLabel}
          </time>
        </p>
        <p className="inline-flex items-center gap-1.5 text-secondary text-ink-muted">
          <DoseStatusGlyph taken={isTaken} />
          {isTaken ? "Tomada" : "Pendiente"}
        </p>
      </div>
      <p className="mt-2 text-name wrap-break-word text-ink">{dose.name}</p>
      {/* Tres niveles de texto: hora (time), nombre (name) y estado + dosis (secondary). */}
      {dose.dosage ? <p className="text-secondary wrap-break-word text-ink-muted">{dose.dosage}</p> : null}

      <form ref={form} action={toggle} onSubmit={onSubmit} className="mt-4">
        <PendingSettled onSettled={restoreFocus} />
        {/* Mismo SubmitButton en ambas ramas: React conserva el <button> y con él el foco. */}
        {isTaken ? (
          <SubmitButton pendingLabel="Guardando…" className={`${buttonSecondary} w-full`}>
            Deshacer<span className="sr-only">: {dose.name}, {dose.timeLabel}</span>
          </SubmitButton>
        ) : (
          // [PENDIENTE REVISIÓN PROFESIONAL]
          <SubmitButton pendingLabel="Guardando…" className={`${buttonPrimary} w-full`}>
            Ya la tomé<span className="sr-only">: {dose.name}, {dose.timeLabel}</span>
          </SubmitButton>
        )}
      </form>

      {failed ? (
        <Notice kind="error" className="mt-3">
          No pudimos guardar el cambio. Inténtalo de nuevo.
        </Notice>
      ) : null}
    </li>
  );
}
