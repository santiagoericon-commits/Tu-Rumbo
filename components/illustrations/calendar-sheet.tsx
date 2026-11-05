import { IllustrationFrame, type IllustrationProps } from "./illustration-frame";

// Calendario de pared: banda superior rellena, argollas, días como puntos y la hoja que se levanta
// en la esquina.
export function CalendarSheetIllustration({ className }: IllustrationProps) {
  return (
    <IllustrationFrame className={className}>
      <path d="M11 9h26a4 4 0 0 1 4 4v5H7v-5a4 4 0 0 1 4-4Z" className="fill-sage-soft" />
      <path d="M7 18v19a4 4 0 0 0 4 4h20l10-10V18" />
      <path d="M31 41v-6a4 4 0 0 1 4-4h6" />
      <path d="M17 5v8M31 5v8" />
      <path d="M15 25h.01M22 25h.01M29 25h.01M15 32h.01M22 32h.01" strokeWidth={2.5} />
    </IllustrationFrame>
  );
}
