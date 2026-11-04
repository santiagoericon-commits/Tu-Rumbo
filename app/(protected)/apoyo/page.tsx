import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { buildSupportLink, normalizeWhatsAppNumber, SUPPORT_OPTIONS, type SupportOptionKey } from "@/lib/support-link";
import { SupportPicker } from "./support-picker";

// Pide apoyo (P9, decisión D-WA en CLAUDE.md). La solicitud sale desde el WhatsApp de la persona
// con un texto fijo que ella edita allá; Rumbo no guarda ni comparte nada. Sin consultas a la base.
function supportLinks(): Record<SupportOptionKey, string> | null {
  const number = normalizeWhatsAppNumber(process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP);
  if (number === null) return null; // sin número: el botón se oculta; nunca un número inventado
  const links = {} as Record<SupportOptionKey, string>;
  for (const option of SUPPORT_OPTIONS) links[option.key] = buildSupportLink(number, option.key) ?? "";
  return links;
}

export default function ApoyoPage() {
  return (
    <div className="flex flex-col gap-4 motion-safe:animate-screen-enter">
      {/* [PENDIENTE REVISIÓN PROFESIONAL] */}
      <PageHeader section="apoyo" title="Pide apoyo" subtitle="Traslado, medicamento, estudios o alguien con quien hablar." />

      <SupportPicker links={supportLinks()} />

      <Notice kind="info">Este mensaje se envía desde tu WhatsApp. Rumbo no guarda ni comparte lo que escribas.</Notice>
      {/* [PENDIENTE REVISIÓN PROFESIONAL] */}
      <p className="px-1 text-secondary text-ink-muted">Rumbo no garantiza el apoyo; lo decide la organización.</p>
    </div>
  );
}
