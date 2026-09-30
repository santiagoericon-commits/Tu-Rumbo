import { card, cardTitle } from "@/components/ui/styles";
import { levelText } from "./level-labels";
import type { SymptomLogView } from "./types";

// Lista cronológica, de lo más reciente a lo más antiguo. Sin gráficas, promedios,
// tendencias ni colores por valor: el chip es idéntico para cualquier valor.
export function SymptomHistory({ logs }: { logs: SymptomLogView[] }) {
  return (
    <section aria-labelledby="historial-sintomas" className={card}>
      <h2 id="historial-sintomas" className={cardTitle}>
        Tus últimos 14 días
      </h2>

      {logs.length === 0 ? (
        <p className="mt-2 text-body text-ink-muted">Aún no tienes registros en los últimos 14 días.</p>
      ) : (
        <ul className="mt-3 divide-y divide-line">
          {logs.map((log) => (
            <li key={log.id} className="flex flex-col items-start gap-2 py-4 last:pb-0">
              <p className="text-body text-ink first-letter:uppercase">
                <time dateTime={log.logDate}>{log.dateLabel}</time>
              </p>
              {/* [PENDIENTE REVISIÓN PROFESIONAL] */}
              <p className="rounded-full bg-plum-tint px-3 py-1 text-secondary text-plum-ink">{levelText(log.level)}</p>
              {log.notes ? (
                <p className="whitespace-pre-line wrap-break-word text-secondary text-ink-muted">{log.notes}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
