import { PageHeader } from "@/components/ui/page-header";
import { RumboMark } from "@/components/rumbo-mark";
import type { SummaryData } from "./load-summary";
import { PrintButton } from "./print-button";
import { QuestionsForm } from "./questions-form";
import { MedicationsSection, SymptomLogSection, UnmarkedDosesSection } from "./summary-sections";

// La hoja completa "Para mi cita": en pantalla es una pila de tarjetas; en papel, un documento en
// blanco y negro (docs/marca.md §5). Solo presentación: los datos llegan armados.
export function SummarySheet({ data, tz }: { data: SummaryData; tz: string }) {
  const { appointment, periodLabel, medications, unmarked, unmarkedCapped, logs } = data;
  const appointmentLine = appointment
    ? `${appointment.title} · ${appointment.dateLabel} · ${appointment.timeLabel}`
    : null;

  return (
    <div className="flex flex-col gap-4 motion-safe:animate-screen-enter print:gap-3">
      <div className="print:hidden">
        <PageHeader section="citas" title="Para mi cita" subtitle={appointmentLine ?? undefined} />
      </div>

      {/* Solo en papel: marca pequeña a la izquierda y periodo a la derecha. */}
      <div className="hidden print:block">
        <div className="flex items-center justify-between gap-4 border-b border-line pb-2">
          <span className="flex items-center gap-2 font-serif text-subtitle text-ink">
            <RumboMark className="size-5" />
            Rumbo
          </span>
          <span className="text-body text-ink tabular-nums">{periodLabel}</span>
        </div>
        <p className="mt-3 font-serif text-title text-ink">Para mi cita</p>
        {appointmentLine ? <p className="text-body text-ink first-letter:uppercase">{appointmentLine}</p> : null}
      </div>

      <section aria-label="Periodo que cubre" className="flex flex-col gap-1 px-1 print:px-0">
        <p className="text-secondary text-ink-muted print:hidden">Periodo que cubre este resumen</p>
        <p className="text-name text-ink tabular-nums print:hidden">{periodLabel}</p>
        {/* [PENDIENTE REVISIÓN PROFESIONAL] cobertura: un hueco no es una dosis no tomada */}
        <p className="text-secondary text-ink-muted">Incluye los días en que Rumbo tenía dosis programadas.</p>
      </section>

      <PrintButton />

      <MedicationsSection medications={medications} />
      <UnmarkedDosesSection groups={unmarked} capped={unmarkedCapped} tz={tz} />
      <SymptomLogSection logs={logs} />
      <QuestionsForm
        key={appointment?.id ?? "sin-cita"}
        appointment={appointment ? { id: appointment.id, notes: appointment.notes } : null}
      />

      {/* [PENDIENTE REVISIÓN PROFESIONAL] */}
      <p className="px-1 text-secondary text-ink-muted print:mt-3 print:border-t print:border-line print:px-0 print:pt-2 print:text-ink">
        Registro personal hecho en Rumbo. No es un documento médico.
      </p>
    </div>
  );
}
