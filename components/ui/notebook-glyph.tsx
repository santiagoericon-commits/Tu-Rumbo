type NotebookGlyphProps = { closing?: boolean; className?: string };

// Cuaderno cerrado de 24 px (paths de Lucide "notebook", ISC; ver components/icons.tsx). Con
// `closing`, la tapa se cierra una vez al montar desde el lomo (200 ms, motion-safe): quien lo usa
// lo vuelve a montar en cada guardado. Sin `closing`, o con reduced motion, queda cerrado y quieto.
export function NotebookGlyph({ closing = false, className = "size-6" }: NotebookGlyphProps) {
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
      <path d="M2 6h4M2 10h4M2 14h4M2 18h4" />
      <g className={closing ? "origin-left [transform-box:fill-box] motion-safe:animate-notebook-close" : undefined}>
        <rect width="16" height="20" x="4" y="2" rx="2" />
        <path d="M16 2v20" />
      </g>
    </svg>
  );
}
