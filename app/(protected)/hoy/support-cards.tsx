import Link from "next/link";
import { HandHelpingIcon, PillIcon } from "@/components/icons";
import { card, cardTitle, textLink } from "@/components/ui/styles";

export type LowSupplyItem = { id: string; name: string; line: string };

// Solo si algún medicamento llega a 7 días o menos (P9). Neutro: sin rojo, sin alerta, sin "urgente".
export function LowSupplyCard({ items }: { items: LowSupplyItem[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="surtido-hoy" className={card}>
      {/* [PENDIENTE REVISIÓN PROFESIONAL] */}
      <h2 id="surtido-hoy" className={cardTitle}>
        Tu medicamento
      </h2>
      <ul className="mt-3 flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-2">
            <PillIcon className="mt-0.5 size-5 text-ink-muted" />
            <p className="min-w-0 text-secondary text-ink">
              <span className="text-ink wrap-break-word">{item.name}</span>
              <span className="block text-ink-muted tabular-nums">{item.line}</span>
            </p>
          </li>
        ))}
      </ul>
      {/* [PENDIENTE REVISIÓN PROFESIONAL] */}
      <p className="mt-1 text-secondary text-ink-muted">Se calcula con las dosis que marcas como tomadas.</p>
      <Link href="/apoyo" className={textLink}>
        ¿Necesitas apoyo con tu medicamento?
      </Link>
    </section>
  );
}

// Entrada fija y discreta a Apoyo al final de Hoy.
export function SupportEntryCard() {
  return (
    <section aria-labelledby="apoyo-hoy" className={`${card} flex items-start gap-4`}>
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-muted text-accent">
        <HandHelpingIcon className="size-6" />
      </span>
      <div className="min-w-0">
        <h2 id="apoyo-hoy" className="text-name text-ink">
          ¿Necesitas apoyo?
        </h2>
        {/* [PENDIENTE REVISIÓN PROFESIONAL] */}
        <p className="text-secondary text-ink-muted">Traslado, medicamento, estudios o alguien con quien hablar.</p>
        <Link href="/apoyo" className={textLink}>
          Pide apoyo
        </Link>
      </div>
    </section>
  );
}
