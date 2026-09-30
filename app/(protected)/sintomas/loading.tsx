export default function Loading() {
  return (
    <div aria-busy="true">
      <span className="sr-only">Cargando tu registro</span>
      <div aria-hidden="true" className="motion-safe:animate-pulse">
        <div className="h-7 w-32 max-w-full rounded-md bg-surface-muted" />
        <div className="mt-4 h-6 w-64 max-w-full rounded-md bg-surface-muted" />
        <div className="mt-4 grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((level) => (
            <div key={level} className="h-16 rounded-md bg-surface-muted" />
          ))}
        </div>
        <div className="mt-5 h-28 rounded-md bg-surface-muted" />
        <div className="mt-5 h-12 rounded-md bg-surface-muted" />
      </div>
    </div>
  );
}
