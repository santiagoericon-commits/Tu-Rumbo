"use client";

import { useEffect, useState } from "react";
import { ShieldCheckIcon } from "@/components/icons";
import { RumboMark } from "@/components/rumbo-mark";
import { OPENING_SEEN_KEY } from "@/lib/opening";

// Telón de bienvenida (docs/diseno.md §8 y §13). Se pinta desde el HTML del servidor y anima solo
// con CSS, sin esperar a la hidratación. Es decorativo: aria-hidden y sin elementos enfocables; la
// página real queda debajo con sus landmarks. Tocar o cualquier tecla lo quita de inmediato.
export function OpeningIntro() {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    try {
      sessionStorage.setItem(OPENING_SEEN_KEY, "1");
    } catch {
      // Sin almacenamiento (Safari privado estricto): el telón se ve en cada carga.
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);

  if (!open) return null;

  return (
    <div
      data-opening-curtain
      aria-hidden="true"
      onClick={() => setOpen(false)}
      onAnimationEnd={(event) => {
        // Las animaciones de los hijos también burbujean hasta aquí.
        if (event.target === event.currentTarget) setOpen(false);
      }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-accent-strong px-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] text-center select-none motion-safe:animate-opening-curtain motion-reduce:animate-opening-curtain-reduced"
    >
      <div className="relative flex size-36 items-center justify-center">
        {/* El halo termina antes del texto: sage-soft sobre accent baja a 3.8:1. */}
        <div className="absolute -inset-16 bg-radial-[closest-side] from-accent to-transparent to-70%" />
        <div className="absolute inset-0 rounded-full border border-sage-soft opacity-15 motion-safe:animate-opening-ring" />
        <div className="relative rounded-[21.875%] ring-1 ring-sage-soft/30 motion-safe:animate-opening-emblem">
          <RumboMark className="block size-22" motion="opening" />
        </div>
      </div>
      <div className="relative flex flex-col items-center gap-2">
        <p className="font-serif text-greeting text-canvas motion-safe:animate-opening-title">Rumbo</p>
        {/* [PENDIENTE REVISIÓN PROFESIONAL] */}
        <p className="text-secondary text-balance text-sage-soft motion-safe:animate-opening-subtitle">
          <ShieldCheckIcon className="mr-1.5 inline-block size-5 align-[-0.25em]" />
          Tu espacio personal y seguro de seguimiento
        </p>
      </div>
    </div>
  );
}
