// Marca de Rumbo: aguja de brújula (un "rombo" que marca el rumbo). Mismo dibujo que app/icon.svg,
// pintado con tokens. `settle` asienta la aguja una sola vez al cargar (solo en /login, con motion-safe).
export function RumboMark({ className = "", settle = false }: { className?: string; settle?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 512 512" className={`shrink-0 ${className}`}>
      <rect width="512" height="512" rx="112" className="fill-accent" />
      <g transform="translate(256 256) scale(1.05)">
        <g
          className={
            settle ? "origin-center [transform-box:fill-box] motion-safe:animate-needle-settle" : undefined
          }
        >
          <polygon points="0,-170 64,0 -64,0" className="fill-canvas" />
          <polygon points="0,170 64,0 -64,0" className="fill-sage-soft" />
          <circle cx="0" cy="0" r="15" className="fill-accent" />
        </g>
      </g>
    </svg>
  );
}
