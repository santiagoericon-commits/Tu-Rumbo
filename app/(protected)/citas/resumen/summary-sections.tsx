import { levelText } from "@/app/(protected)/sintomas/level-labels";
import { formatCalendarDate } from "@/lib/schedule-format";
import { formatTimeList, type UnmarkedGroup } from "@/lib/visit-summary";
import type { SummaryData } from "./load-summary";
import { CompactEmpty } from "../../compact-empty";
import { SheetSection } from "./sheet-section";

const hint = "mt-2 text-secondary text-ink-muted";
const emptyText = "text-secondary text-ink-muted";

// Medicamentos tal como se capturaron: nombre, dosis y horarios. Sin sugerir ni validar nada.
export function MedicationsSection({ medications }: { medications: SummaryData["medications"] }) {
  return (
    <SheetSection id="resumen-medicamentos" title="Mis medicamentos">
      {medications.length === 0 ? (
        <CompactEmpty textClassName={emptyText}>No tienes medicamentos registrados.</CompactEmpty>
      ) : (
        <ul className="mt-3 flex flex-col gap-3 print:mt-1 print:gap-2">
          {medications.map((medication) => (
            <li key={medication.id} className="print:break-inside-avoid">
              <p className="text-name text-ink wrap-break-word">{medication.name}</p>
              {medication.dosage ? <p className="text-body text-ink wrap-break-word">{medication.dosage}</p> : null}
              <p className="text-secondary text-ink-muted tabular-nums">{medication.timesLabel}</p>
            </li>
          ))}
        </ul>
      )}
    </SheetSection>
  );
}

type UnmarkedProps = { groups: UnmarkedGroup[]; capped: boolean; tz: string };

// Solo lista fecha y hora de las dosis sin marcar: sin conteos, porcentajes ni lectura de cumplimiento.
// Solo cubre los días en que Rumbo tenía dosis programadas, y la hoja lo dice arriba.
export function UnmarkedDosesSection({ groups, capped, tz }: UnmarkedProps) {
  return (
    <SheetSection id="resumen-sin-marcar" title="Dosis que no marqué como tomadas">
      {/* [PENDIENTE REVISIÓN PROFESIONAL] */}
      <p className={hint}>Son las dosis que no marqué en Rumbo.</p>
      {groups.length === 0 ? (
        <CompactEmpty textClassName={emptyText}>En este periodo no hay dosis sin marcar.</CompactEmpty>
      ) : (
        <ul className="mt-3 flex flex-col gap-4 print:mt-1 print:gap-2">
          {groups.map((group) => (
            <li key={group.id} className="print:break-inside-avoid">
              <p className="text-name text-ink wrap-break-word">
                {group.name}
                {group.dosage ? <span className="font-normal"> · {group.dosage}</span> : null}
              </p>
              <ul className="mt-1 flex flex-col gap-1">
                {group.days.map((day) => (
                  <li key={day.date} className="text-secondary text-ink tabular-nums first-letter:uppercase">
                    <span>{formatCalendarDate(day.date)}</span>
                    <span className="text-ink-muted tabular-nums">: {formatTimeList(day.instants, tz)}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
      {capped ? <p className={hint}>Mostramos las primeras 1000.</p> : null}
    </SheetSection>
  );
}

// Lista cronológica, de la más antigua a la más reciente, como un diario. Sin gráficas, promedios ni
// colores por valor (CLAUDE.md, contenido clínico): el chip es idéntico para cualquier valor.
export function SymptomLogSection({ logs }: { logs: SummaryData["logs"] }) {
  return (
    <SheetSection id="resumen-sintomas" title="Cómo me sentí">
      {/* [PENDIENTE REVISIÓN PROFESIONAL] */}
      <p className={hint}>
        Respuesta a «¿Qué tanto te molestaron los síntomas?», de Nada (1 de 5) a Mucho (5 de 5).
      </p>
      {logs.length === 0 ? (
        <CompactEmpty textClassName={emptyText}>No hay registros de síntomas en este periodo.</CompactEmpty>
      ) : (
        <ul className="mt-3 divide-y divide-line print:mt-1">
          {logs.map((log) => (
            <li
              key={log.id}
              className="flex flex-col items-start gap-2 py-4 first:pt-0 last:pb-0 print:flex-row print:flex-wrap print:items-baseline print:gap-x-3 print:gap-y-0 print:py-2 print:break-inside-avoid"
            >
              <p className="text-body text-ink tabular-nums first-letter:uppercase">
                <time dateTime={log.logDate}>{log.dateLabel}</time>
              </p>
              <p className="rounded-full bg-plum-tint px-3 py-1 text-secondary text-plum-ink print:p-0 print:text-ink">
                {levelText(log.level)}
              </p>
              {log.notes ? (
                <p className="whitespace-pre-line wrap-break-word text-secondary text-ink-muted print:w-full">
                  {log.notes}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </SheetSection>
  );
}
