// Siluetas de carga con la forma de las tarjetas reales. El contenedor pone aria-hidden y animate-pulse.
export function HeaderSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-card bg-surface-muted p-5">
      <div className="size-12 shrink-0 rounded-full bg-surface" />
      <div className="flex grow flex-col gap-2">
        <div className="h-8 w-32 max-w-full rounded-control bg-surface" />
        <div className="h-5 w-48 max-w-full rounded-control bg-surface" />
      </div>
    </div>
  );
}

export function CardSkeleton({ lines = 2, action = false }: { lines?: number; action?: boolean }) {
  return (
    <div className="flex flex-col gap-3 rounded-card bg-surface p-5 shadow-card">
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className={`h-6 max-w-full rounded-control bg-surface-muted ${i === 0 ? "w-40" : "w-56"}`} />
      ))}
      {action ? <div className="mt-1 h-13 w-full rounded-control bg-surface-muted" /> : null}
    </div>
  );
}
