"use client";

import Link from "next/link";
import { CalendarIcon } from "@/components/icons";
import { DeleteConfirm } from "@/components/ui/delete-confirm";
import { textLink } from "@/components/ui/styles";
import { deleteAppointmentAction } from "./actions";
import { PastNotesEditor, type UpdateAppointmentNotes } from "./past-notes-editor";
import type { AppointmentView } from "./types";

type AppointmentItemProps = { appointment: AppointmentView; past?: boolean; updateNotes: UpdateAppointmentNotes };

export function AppointmentItem({ appointment, past = false, updateNotes }: AppointmentItemProps) {
  // Las anteriores se muestran más discretas: sin sombra y en ink-muted.
  const tone = past ? "text-ink-muted" : "text-ink";

  return (
    <li className={`rounded-card bg-surface p-5 ${past ? "" : "shadow-card"}`}>
      <p className={`text-name wrap-break-word ${tone}`}>{appointment.title}</p>
      <p className={`mt-2 flex items-start gap-2 text-body ${tone}`}>
        <CalendarIcon className="mt-0.5 size-6 text-ink-muted" />
        <time dateTime={appointment.scheduledAt} className="block tabular-nums first-letter:uppercase">
          {appointment.dateLabel} · <span className="whitespace-nowrap">{appointment.timeLabel}</span>
        </time>
      </p>

      {past ? (
        <>
          {/* Quieto: la fecha pasó sola, no hubo un toque que reconocer. Calendario y no check: un check
              se leería como "asististe" o "completado", y Rumbo no sabe si la cita se hizo. */}
          {/* [PENDIENTE REVISIÓN PROFESIONAL] */}
          <p className="mt-2 flex items-center gap-2 text-secondary text-ink-muted">
            <CalendarIcon className="size-5" />
            Ya fue tu cita
          </p>
          <PastNotesEditor
            appointmentId={appointment.id}
            title={appointment.title}
            notes={appointment.notes}
            updateNotes={updateNotes}
          />
        </>
      ) : (
        <>
          {appointment.notes ? (
            <p className="mt-2 whitespace-pre-line wrap-break-word text-secondary text-ink-muted">{appointment.notes}</p>
          ) : null}
          {/* [PENDIENTE REVISIÓN PROFESIONAL] */}
          <Link href={`/citas/resumen?cita=${appointment.id}`} className={`${textLink} mt-1`}>
            Preparar resumen
          </Link>
        </>
      )}

      <DeleteConfirm
        question="¿Eliminar esta cita?"
        itemName={appointment.title}
        failedMessage="No pudimos eliminar la cita. Inténtalo de nuevo."
        onDelete={() => deleteAppointmentAction(appointment.id)}
      />
    </li>
  );
}
