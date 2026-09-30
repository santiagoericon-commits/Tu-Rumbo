// Variantes compartidas. Pine (accent) es el único color de acción. El estado presionado
// (< 100 ms) es el feedback principal; la escala solo con motion-safe. El foco visible es global.
const pressable =
  "inline-flex items-center justify-center gap-2 rounded-control px-5 transition-[background-color,scale] duration-150 ease-out motion-safe:active:scale-[0.98] disabled:cursor-wait";

export const buttonPrimary = `${pressable} min-h-13 bg-accent text-button text-accent-ink hover:bg-accent-strong active:bg-accent-strong`;

export const buttonSecondary = `${pressable} min-h-12 border-2 border-line-strong bg-surface text-button text-ink hover:bg-surface-muted active:bg-surface-muted`;

export const buttonQuiet =
  "inline-flex min-h-12 items-center gap-2 rounded-control px-3 text-secondary text-ink-muted underline underline-offset-4 transition-[background-color] duration-150 hover:bg-surface-muted active:bg-surface-muted";

// Enlace de texto en accent con objetivo de 48 px.
export const textLink =
  "inline-flex min-h-12 items-center text-accent underline underline-offset-4 decoration-2 hover:decoration-accent-strong";

export const fieldLabel = "flex flex-col gap-2 text-body text-ink";

// La sombra interior tapa el azul del autocompletado del navegador con el token surface.
export const field =
  "min-h-13 w-full rounded-control border-2 border-line-strong bg-surface px-4 text-body text-ink autofill:shadow-[inset_0_0_0_100px_var(--color-surface)]";

export const card = "rounded-card bg-surface p-5 shadow-card";

export const cardTitle = "font-serif text-subtitle text-ink";
