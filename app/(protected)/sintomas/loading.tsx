import { HeaderSkeleton } from "@/components/ui/skeletons";

export default function Loading() {
  return (
    <div aria-busy="true" className="motion-safe:animate-skeleton-in motion-reduce:animate-skeleton-wait">
      <span className="sr-only">Cargando tu registro</span>
      <div aria-hidden="true" className="flex flex-col gap-4 motion-safe:animate-pulse">
        <HeaderSkeleton />
        <div className="flex flex-col gap-2 rounded-card bg-surface p-5 shadow-card">
          <div className="mb-2 h-7 w-48 max-w-full rounded-control bg-surface-muted" />
          {[1, 2, 3, 4, 5].map((level) => (
            <div key={level} className="h-14 rounded-control bg-surface-muted" />
          ))}
          <div className="mt-4 h-28 rounded-control bg-surface-muted" />
          <div className="mt-4 h-13 rounded-control bg-surface-muted" />
        </div>
      </div>
    </div>
  );
}
