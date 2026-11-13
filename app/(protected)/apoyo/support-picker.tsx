"use client";

import { useState } from "react";
import { BusIcon, CircleCheckIcon, ClipboardListIcon, MessageCircleIcon, PillIcon, type IconComponent } from "@/components/icons";
import { EnvelopeIllustration } from "@/components/illustrations";
import { Notice } from "@/components/ui/notice";
import { buttonPrimary, card, enterFromAbove } from "@/components/ui/styles";
import { buildSupportMessage, SUPPORT_OPTIONS, type SupportOptionKey } from "@/lib/support-link";

const ICONS: Record<SupportOptionKey, IconComponent> = {
  traslado: BusIcon,
  medicamento: PillIcon,
  estudios: ClipboardListIcon,
  hablar: MessageCircleIcon,
};

// links: un enlace wa.me por opción, armado en el servidor; null si no hay número configurado.
// La opción vive solo en este estado: nada viaja en la URL de Rumbo.
export function SupportPicker({ links }: { links: Record<SupportOptionKey, string> | null }) {
  const [selected, setSelected] = useState<SupportOptionKey | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className={card}>
        {/* min-w-0: un fieldset trae min-width: min-content y desborda con zoom alto. */}
        <fieldset className="min-w-0">
          <legend className="font-serif text-subtitle text-ink">¿Con qué necesitas apoyo?</legend>
          <div className="mt-4 flex flex-col gap-2">
            {SUPPORT_OPTIONS.map((option) => {
              const Icon = ICONS[option.key];
              return (
                <label
                  key={option.key}
                  className="group relative flex min-h-18 flex-wrap items-center gap-x-4 gap-y-2 rounded-control border-2 border-line-strong bg-surface px-4 py-3 transition-[background-color,border-color] duration-150 has-checked:border-ink has-checked:bg-surface-muted"
                >
                  <input
                    type="radio"
                    name="tema"
                    value={option.key}
                    checked={selected === option.key}
                    onChange={() => setSelected(option.key)}
                    className="peer absolute inset-0 size-full cursor-pointer appearance-none rounded-control"
                  />
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-muted text-accent group-has-checked:bg-surface">
                    <Icon className="size-6" />
                  </span>
                  {/* Con zoom alto el texto baja debajo del ícono en vez de desbordar (basis-32), como en PageHeader. */}
                  <span className="min-w-0 flex-1 basis-32 wrap-break-word">
                    <span className="block text-name font-normal text-ink group-has-checked:font-semibold">{option.title}</span>
                    {/* [PENDIENTE REVISIÓN PROFESIONAL] */}
                    <span className="block text-secondary text-ink-muted">{option.description}</span>
                  </span>
                  <CircleCheckIcon className="hidden size-6 text-ink group-has-checked:block" active />
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>

      {/* Región viva siempre presente para que la vista previa se anuncie al aparecer. */}
      <div role="status">
        {selected ? (
          <section aria-label="Vista previa del mensaje" className={`flex flex-col gap-4 ${enterFromAbove}`}>
            {links ? (
              <div className="flex flex-wrap items-center gap-4">
                {/* El sobre se cierra en cada elección (key = opción, que es un toque); sin movimiento con
                    reduced motion. Sin número configurado no hay mensaje listo, así que no hay sobre. */}
                <EnvelopeIllustration key={selected} motion="close" className="size-16" />
                <p className="min-w-0 flex-1 basis-40 text-body text-ink">Tu mensaje está listo. Tú decides si lo envías.</p>
              </div>
            ) : null}
            <blockquote className="rounded-card border-2 border-line-strong bg-surface p-4 text-body text-ink">
              {buildSupportMessage(selected)}
            </blockquote>
            {links ? <p className="text-secondary text-ink-muted">Podrás editar el mensaje en WhatsApp antes de enviarlo.</p> : null}
            {links ? (
              <a href={links[selected]} target="_blank" rel="noopener noreferrer" className={`${buttonPrimary} w-full`}>
                Abrir WhatsApp
              </a>
            ) : (
              <Notice kind="info" announce={false}>
                Por ahora no hay un contacto de apoyo disponible desde Rumbo.
              </Notice>
            )}
          </section>
        ) : null}
      </div>
    </div>
  );
}
