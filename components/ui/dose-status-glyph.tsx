type DoseStatusGlyphProps = { taken: boolean; className?: string };

// Estado de la dosis (docs/marca.md §3): el círculo es fijo; las manecillas del reloj cambian por
// opacidad y el check se dibuja con stroke-dashoffset. Son TRANSICIONES, no keyframes: al montar
// (o recargar) con taken ya se ve el check completo y quieto, y Deshacer recorre el trazo a la
// inversa. Decorativo: el texto "Tomada"/"Pendiente" va al lado.
export function DoseStatusGlyph({ taken, className = "size-5" }: DoseStatusGlyphProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      <circle cx="12" cy="12" r="10" />
      <path
        d="M12 6v6l4 2"
        className={`transition-opacity duration-200 ease-out-strong motion-reduce:transition-none ${
          taken ? "opacity-0" : "opacity-100"
        }`}
      />
      {/* Guion de 1 y hueco de 2 (pathLength 1): con 1.05 de desfase el guion queda antes del
          inicio y la punta redonda no deja un punto visible. */}
      <path
        d="m9 12 2 2 4-4"
        pathLength={1}
        strokeDasharray="1 2"
        className={`transition-[stroke-dashoffset] duration-320 ease-out-strong motion-reduce:transition-none ${
          taken ? "[stroke-dashoffset:0]" : "[stroke-dashoffset:1.05]"
        }`}
      />
    </svg>
  );
}
