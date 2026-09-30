import type { SymptomLogView } from "./types";

// Lista cronológica, de lo más reciente a lo más antiguo. Sin gráficas, promedios,
// tendencias ni colores por valor: el registro se muestra tal cual se capturó.
export function SymptomHistory({ logs }: { logs: SymptomLogView[] }) {
  return (
    <section aria-labelledby="historial-sintomas" className="mt-8">
      <h3 id="historial-sintomas" className="text-lg font-semibold text-ink">
        Tus últimos 14 días
      </h3>

      {logs.length === 0 ? (
        <p className="mt-2 text-base text-ink-muted">Aún no tienes registros en los últimos 14 días.</p>
      ) : (
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {logs.map((log) => (
            <li key={log.id} className="py-4">
              <p className="text-base text-ink first-letter:uppercase">
                <time dateTime={log.logDate}>{log.dateLabel}</time>
              </p>
              <p className="text-base text-ink">Molestia: {log.level} de 5</p>
              {log.notes ? (
                <p className="mt-1 whitespace-pre-line wrap-break-word text-base text-ink-muted">{log.notes}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
