import { IllustrationFrame, type IllustrationProps } from "./illustration-frame";

// Camino con señal: dos orillas rectas que convergen al horizonte (perspectiva sencilla) con una
// línea central discontinua, y un poste con la placa en forma de flecha (el único relleno).
export function PathSignIllustration({ className }: IllustrationProps) {
  return (
    <IllustrationFrame className={className}>
      <path d="M3 27h9M20 27h12M40 27h5" />
      <path d="M3 44 15 27M29 44 17 27" />
      <path d="M16 43.5v-4.5M16 35.5v-3M16 30v-1.5" />
      <path d="M36 44V16" />
      <path d="M26.5 5H41l4.5 5.5L41 16H26.5a1.5 1.5 0 0 1-1.5-1.5v-8A1.5 1.5 0 0 1 26.5 5Z" className="fill-sage-soft" />
      <path d="M32 44h8" />
    </IllustrationFrame>
  );
}
