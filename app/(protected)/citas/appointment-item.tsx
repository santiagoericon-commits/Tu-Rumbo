"use client";

import { CalendarIcon } from "@/components/icons";
import { DeleteConfirm } from "@/components/ui/delete-confirm";
import { deleteAppointmentAction } from "./actions";
import type { AppointmentView } from "./types";

type AppointmentItemProps = { appointment: AppointmentView; past?: boolean };

export function AppointmentItem({ appointment, past = false }: AppointmentItemProps) {
  // Las anteriores se muestran más discretas: sin sombra y en ink-muted.
  const tone = past ? "text-ink-muted" : "text-ink";

  return (
    <li className={`rounded-card bg-surface p-5 ${past ? "" : "shadow-card"}`}>
      <p className={`text-name wrap-break-word ${tone}`}>{appointment.title}</p>
      <p className={`mt-2 flex items-start gap-2 text-body ${tone}`}>
        <CalendarIcon className="mt-0.5 size-6 text-ink-muted" />
        <time dateTime={appointment.scheduledAt} className="block first-letter:uppercase">
          {appointment.dateLabel} · <span className="whitespace-nowrap">{appointment.timeLabel}</span>
        </time>
      </p>
      {appointment.notes ? (
        <p className="mt-2 whitespace-pre-line wrap-break-word text-secondary text-ink-muted">{appointment.notes}</p>
      ) : null}

      <DeleteConfirm
        question="¿Eliminar esta cita?"
        itemName={appointment.title}
        failedMessage="No pudimos eliminar la cita. Inténtalo de nuevo."
        onDelete={() => deleteAppointmentAction(appointment.id)}
      />
    </li>
  );
}
