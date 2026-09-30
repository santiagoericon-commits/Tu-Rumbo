import { redirect } from "next/navigation";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { card, cardTitle } from "@/components/ui/styles";
import { partitionAppointments } from "@/lib/appointment-list";
import { MAX_APPOINTMENT_OFFSET_DAYS } from "@/lib/appointment-validation";
import { formatLongDate, formatTime } from "@/lib/date-range";
import { addDaysIso, formatLocalDate } from "@/lib/local-time";
import { createClient } from "@/lib/supabase/server";
import { getUserTimeZone } from "@/lib/timezone.server";
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
            title="No tienes citas próximas."
            text="Cuando tengas un estudio de control, anótalo aquí para tenerlo a la mano."
            action={{ href: "#agregar-cita", label: "Agregar cita" }}
          />
        ) : (
          <ul className="flex flex-col gap-4">
            {upcoming.map((appointment) => (
              <AppointmentItem key={appointment.id} appointment={appointment} />
            ))}
          </ul>
        )}
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
              <AppointmentItem key={appointment.id} appointment={appointment} past />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
