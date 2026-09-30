import { CardSkeleton, HeaderSkeleton } from "@/components/ui/skeletons";

export default function Loading() {
  return (
    <div aria-busy="true" className="motion-safe:animate-skeleton-in motion-reduce:animate-skeleton-wait">
      <span className="sr-only">Cargando tus dosis de hoy</span>
      <div aria-hidden="true" className="flex flex-col gap-4 motion-safe:animate-pulse">
        <HeaderSkeleton />
        <div className="h-7 w-56 max-w-full rounded-control bg-surface-muted" />
        <CardSkeleton lines={2} action />
        <CardSkeleton lines={2} action />
      </div>
    </div>
  );
}
