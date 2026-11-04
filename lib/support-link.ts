// Apoyo por WhatsApp (P9, decisión D-WA en CLAUDE.md). Puro; cambia solo con tests.
// El enlace solo lleva una frase fija por opción: nunca nombres de medicamentos, diagnóstico,
// notas ni texto libre. La persona edita el mensaje en WhatsApp, no en Rumbo.

export type SupportOptionKey = "traslado" | "medicamento" | "estudios" | "hablar";

export type SupportOption = {
  key: SupportOptionKey;
  title: string; // fila de /apoyo
  description: string; // una línea text-secondary
  phrase: string; // va dentro del mensaje
};

// [PENDIENTE REVISIÓN PROFESIONAL]
export const SUPPORT_OPTIONS: readonly SupportOption[] = [
  { key: "traslado", title: "Traslado a mis citas", description: "Para llegar a tus consultas y estudios.", phrase: "traslado a mis citas" },
  { key: "medicamento", title: "Mi medicamento", description: "Para conseguir el medicamento de tu receta.", phrase: "mi medicamento" },
  { key: "estudios", title: "Estudios", description: "Para hacerte los estudios que te pidieron.", phrase: "estudios" },
  { key: "hablar", title: "Hablar con alguien", description: "Apoyo emocional para ti o tu familia.", phrase: "hablar con alguien" },
];

const PHRASES: Record<SupportOptionKey, string> = Object.fromEntries(
  SUPPORT_OPTIONS.map((option) => [option.key, option.phrase]),
) as Record<SupportOptionKey, string>;

export function isSupportOption(value: unknown): value is SupportOptionKey {
  return typeof value === "string" && Object.hasOwn(PHRASES, value);
}

// Formato de NEXT_PUBLIC_SUPPORT_WHATSAPP: 52 + 10 dígitos, sin signos ni espacios.
// 10 dígitos se toman como número de México y se les antepone 52; de 11 a 15 se dejan igual.
export function normalizeWhatsAppNumber(raw: string | undefined): string | null {
  const value = raw?.trim() ?? "";
  if (!/^\d+$/.test(value)) return null;
  if (value.length === 10) return `52${value}`;
  return value.length >= 11 && value.length <= 15 ? value : null;
}

export function buildSupportMessage(key: SupportOptionKey): string {
  return `Hola, uso Rumbo y quisiera información sobre apoyo para ${PHRASES[key]}.`;
}

export function buildSupportLink(number: string | null, key: SupportOptionKey): string | null {
  if (number === null) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(buildSupportMessage(key))}`;
}
