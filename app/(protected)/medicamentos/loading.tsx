import { CardSkeleton, HeaderSkeleton } from "@/components/ui/skeletons";

export default function Loading() {
  return (
    <div aria-busy="true">
      <span className="sr-only">Cargando tus medicamentos</span>
      <div aria-hidden="true" className="flex flex-col gap-4 motion-safe:animate-pulse">
        <HeaderSkeleton />
        <CardSkeleton lines={3} />
        <CardSkeleton lines={3} />
      </div>
    </div>
  );
}
