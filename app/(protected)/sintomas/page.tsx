import { redirect } from "next/navigation";
import { formatDayHeading } from "@/lib/date-range";
import { addDaysIso, formatLocalDate } from "@/lib/local-time";
import { formatCalendarDate } from "@/lib/schedule-format";
import { createClient } from "@/lib/supabase/server";
import { getUserTimeZone } from "@/lib/timezone.server";
import { SafetyNote } from "./safety-note";
import { SymptomForm } from "./symptom-form";
import { SymptomHistory } from "./symptom-history";
import type { SymptomLogView, SymptomValues } from "./types";

const HISTORY_DAYS = 14;

type SymptomLogRow = {
  id: string;
  log_date: string;
  severity: number;
  notes: string | null;
};

export default async function SintomasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const tz = await getUserTimeZone();
  const now = new Date();
  const today = formatLocalDate(now, tz);

  // Una sola consulta: el historial de 14 días (hoy incluido) trae también el registro de hoy.
  const { data, error } = await supabase
    .from("symptom_logs")
    .select("id, log_date, severity, notes")
    .eq("user_id", user.id)
    .gte("log_date", addDaysIso(today, -(HISTORY_DAYS - 1)))
    .lte("log_date", today)
    .order("log_date", { ascending: false })
    .overrideTypes<SymptomLogRow[], { merge: false }>();

  if (error) console.error("[sintomas] consulta falló:", error.code);

  const rows = data ?? [];
  const todayRow = rows.find((row) => row.log_date === today);
  const todayLog: SymptomValues | null = todayRow
    ? { level: todayRow.severity, notes: todayRow.notes }
    : null;
  const logs: SymptomLogView[] = rows.map((row) => ({
    id: row.id,
    logDate: row.log_date,
    dateLabel:
      row.log_date === today ? `Hoy, ${formatCalendarDate(row.log_date)}` : formatCalendarDate(row.log_date),
    level: row.severity,
    notes: row.notes,
  }));

  return (
    <div>
      <h2 className="text-xl font-semibold text-ink">Síntomas</h2>

      {error ? (
        // Sin formulario: vacío podría sobrescribir el registro de hoy que no se pudo cargar.
        <p role="alert" className="mt-4 text-base text-ink">
          No pudimos cargar tu registro. Inténtalo de nuevo.
        </p>
      ) : (
        <section aria-labelledby="registro-hoy" className="mt-4">
          <h3 id="registro-hoy" className="text-lg font-semibold text-ink">
            {formatDayHeading(now, tz)}
          </h3>
          <SymptomForm todayLog={todayLog} />
        </section>
      )}

      <SafetyNote />

      {error ? null : <SymptomHistory logs={logs} />}
    </div>
  );
}
