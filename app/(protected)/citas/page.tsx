import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardListIcon } from "@/components/icons";
import { CalendarSheetIllustration } from "@/components/illustrations";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { card, cardTitle, textLink } from "@/components/ui/styles";
import { partitionAppointments } from "@/lib/appointment-list";
import { MAX_APPOINTMENT_OFFSET_DAYS } from "@/lib/appointment-validation";
import { formatLongDate, formatTime } from "@/lib/date-range";
import { addDaysIso, formatLocalDate } from "@/lib/local-time";
import { createClient } from "@/lib/supabase/server";
import { getUserTimeZone } from "@/lib/timezone.server";
import { updateAppointmentNotesAction } from "./actions";
import { AppointmentForm } from "./appointment-form";
import { AppointmentItem } from "./appointment-item";
import type { AppointmentView } from "./types";

type AppointmentRow = {
  id: string;
  title: string;
  notes: string | null;
  scheduled_at: string;
};

export default async function CitasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const tz = await getUserTimeZone();
  const now = new Date();
  const todayLocal = formatLocalDate(now, tz);
  const maxDate = addDaysIso(todayLocal, MAX_APPOINTMENT_OFFSET_DAYS);

  const { data, error } = await supabase
    .from("appointments")
    .select("id, title, notes, scheduled_at")
    .eq("user_id", user.id)
    .order("scheduled_at", { ascending: true })
    .overrideTypes<AppointmentRow[], { merge: false }>();

  if (error) console.error("[citas] consulta falló:", error.code);

  const appointments: AppointmentView[] = (data ?? []).map((row) => {
    const instant = new Date(row.scheduled_at);
    return {
      id: row.id,
      title: row.title,
      notes: row.notes,
      scheduledAt: row.scheduled_at,
      dateLabel: formatLongDate(instant, tz, now),
      timeLabel: formatTime(instant, tz),
    };
  });
  const { upcoming, past } = partitionAppointments(appointments, now);

  return (
    <div className="flex flex-col gap-4 motion-safe:animate-screen-enter">
      <PageHeader section="citas" title="Citas" />

      <section aria-labelledby="citas-proximas" className="flex flex-col gap-4">
        <h2 id="citas-proximas" className="px-1 font-serif text-subtitle text-ink">
          Próximas
        </h2>
        {error ? (
          <Notice kind="error">No pudimos cargar tus citas. Inténtalo de nuevo.</Notice>
        ) : upcoming.length === 0 ? (
          // [PENDIENTE REVISIÓN PROFESIONAL]
          <EmptyState
            section="citas"
            illustration={<CalendarSheetIllustration />}
            title="No tienes citas próximas."
            text="Cuando tengas un estudio de control, anótalo aquí para tenerlo a la mano."
            action={{ href: "#agregar-cita", label: "Agregar cita" }}
          />
        ) : (
          <ul className="flex flex-col gap-4">
            {upcoming.map((appointment) => (
              <AppointmentItem key={appointment.id} appointment={appointment} updateNotes={updateAppointmentNotesAction} />
            ))}
          </ul>
        )}
      </section>

      {/* Entrada a la hoja imprimible (P10). Identidad propia de Rumbo, sin color nuevo. */}
      <section aria-labelledby="para-mi-cita" className={`${card} flex flex-wrap items-start gap-4`}>
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-muted text-accent">
          <ClipboardListIcon className="size-6" />
        </span>
        <div className="min-w-0 flex-1 basis-40">
          <h2 id="para-mi-cita" className="text-name text-ink">
            Para mi cita
          </h2>
          {/* [PENDIENTE REVISIÓN PROFESIONAL] */}
          <p className="text-secondary text-ink-muted">Un resumen de tu registro para llevar a tu consulta.</p>
          <Link href="/citas/resumen" className={textLink}>
            Preparar resumen
          </Link>
        </div>
      </section>

      <section id="agregar-cita" aria-labelledby="agregar-cita-titulo" className={`${card} mt-4`}>
        <h2 id="agregar-cita-titulo" className={cardTitle}>
          Agregar cita
        </h2>
        <AppointmentForm todayLocal={todayLocal} maxDate={maxDate} />
      </section>

      {past.length > 0 ? (
        <section aria-labelledby="citas-anteriores" className="mt-4 flex flex-col gap-4">
          <h2 id="citas-anteriores" className="px-1 font-serif text-subtitle text-ink-muted">
            Anteriores
          </h2>
          <ul className="flex flex-col gap-4">
            {past.map((appointment) => (
              <AppointmentItem key={appointment.id} appointment={appointment} past updateNotes={updateAppointmentNotesAction} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
