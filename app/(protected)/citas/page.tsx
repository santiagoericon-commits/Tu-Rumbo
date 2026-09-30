import { redirect } from "next/navigation";
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
    <div>
      <h2 className="text-xl font-semibold text-ink">Citas</h2>

      <section aria-labelledby="citas-proximas" className="mt-4">
        <h3 id="citas-proximas" className="text-lg font-semibold text-ink">
          Próximas
        </h3>
        {error ? (
          <p role="alert" className="mt-2 text-base text-ink">
            No pudimos cargar tus citas. Inténtalo de nuevo.
          </p>
        ) : upcoming.length === 0 ? (
          <p className="mt-2 text-base text-ink-muted">No tienes citas próximas.</p>
        ) : (
          <ul className="mt-2 divide-y divide-line border-y border-line">
            {upcoming.map((appointment) => (
              <AppointmentItem key={appointment.id} appointment={appointment} />
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="agregar-cita" className="mt-8">
        <h3 id="agregar-cita" className="text-lg font-semibold text-ink">
          Agregar cita
        </h3>
        <AppointmentForm todayLocal={todayLocal} maxDate={maxDate} />
      </section>

      {past.length > 0 ? (
        <section aria-labelledby="citas-anteriores" className="mt-10">
          <h3 id="citas-anteriores" className="text-base font-semibold text-ink-muted">
            Anteriores
          </h3>
          <ul className="mt-2 divide-y divide-line border-y border-line">
            {past.map((appointment) => (
              <AppointmentItem key={appointment.id} appointment={appointment} past />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
