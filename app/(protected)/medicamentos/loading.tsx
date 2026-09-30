export default function Loading() {
  return (
    <div aria-busy="true">
      <span className="sr-only">Cargando tus medicamentos</span>
      <div aria-hidden="true" className="motion-safe:animate-pulse">
        <div className="h-7 w-48 max-w-full rounded-md bg-surface-muted" />
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {[0, 1].map((row) => (
            <li key={row} className="py-5">
              <div className="h-6 w-48 max-w-full rounded-md bg-surface-muted" />
              <div className="mt-2 h-5 w-64 max-w-full rounded-md bg-surface-muted" />
              <div className="mt-2 h-5 w-56 max-w-full rounded-md bg-surface-muted" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
