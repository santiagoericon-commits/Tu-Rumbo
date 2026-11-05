import type { ReactNode } from "react";

export type IllustrationProps = { className?: string };

// Trazo de la familia "camino y brújula" (docs/marca.md §6). viewBox de 48 pensado para 96 px:
// 1.25 unidades = 2.5 px a 96 px. Los íconos de 24 px usan 1.75; a 96 px una línea de 1.75 px se
// pierde junto al texto de 18 px y una de 3.5 px se ve pesada, así que la familia queda en el punto
// que se lee igual de ligera que un ícono a su tamaño. Cambia aquí y cambian las cinco.
const STROKE = 1.25;

// Marco común: trazo accent con puntas redondeadas y sin relleno; cada dibujo usa a lo más un
// relleno plano fill-sage-soft. Decorativas: el texto va al lado.
export function IllustrationFrame({ className = "size-24", children }: IllustrationProps & { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      fill="none"
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 overflow-visible stroke-accent ${className}`}
    >
      {children}
    </svg>
  );
}
