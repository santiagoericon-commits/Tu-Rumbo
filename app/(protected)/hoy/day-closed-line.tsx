import { RumboMark } from "@/components/rumbo-mark";

// "Día cerrado" (docs/marca.md §3). Con animate, la aguja gira a norte y la línea entra al
// asentarse (≤ 1.2 s, solo motion-safe). Sin animate (recarga con todo marcado), quieta.
// Con reduced motion queda el texto. Misma línea siempre: no cuenta dosis ni días.
export function DayClosedLine({ animate }: { animate: boolean }) {
  return (
    <p className="mt-4 flex items-center gap-3 text-body text-ink">
      <RumboMark className="size-8 shrink-0" motion={animate ? "day-close" : undefined} />
      {/* [PENDIENTE REVISIÓN PROFESIONAL] */}
      <span className={animate ? "motion-safe:animate-day-close-line" : undefined}>Listo por hoy.</span>
    </p>
  );
}
