import "server-only";

import { partitionAppointments } from "@/lib/appointment-list";
import { formatLongDate, formatTime } from "@/lib/date-range";
import { formatLocalDate } from "@/lib/local-time";
import { formatCalendarDate, formatScheduleTimes } from "@/lib/schedule-format";
import type { createClient } from "@/lib/supabase/server";
import {
  coveredStart,
  formatPeriodLabel,
  groupUnmarkedDoses,
  summaryWindow,
  windowStartInstant,
  type DoseRowLite,
  type SummaryWindow,
  type UnmarkedGroup,
} from "@/lib/visit-summary";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// Tope de PostgREST. Si se alcanza, la hoja lo dice en vez de truncar en silencio.
export const UNMARKED_DOSES_LIMIT = 1000;

type AppointmentRow = { id: string; title: string; notes: string | null; scheduled_at: string };
type MedicationRow = { id: string; name: string; dosage: string | null; schedule_times: string[] };
type FirstDoseRow = { scheduled_at: string };
type LogRow = { id: string; log_date: string; severity: number; notes: string | null };

export type SummaryData = {
  appointment: { id: string; title: string; notes: string | null; dateLabel: string; timeLabel: string } | null;
  window: SummaryWindow;
  periodLabel: string;
  medications: { id: string; name: string; dosage: string | null; timesLabel: string }[];
  unmarked: UnmarkedGroup[];
  unmarkedCapped: boolean;
  logs: { id: string; logDate: string; dateLabel: string; level: number; notes: string | null }[];
};

export type LoadSummaryResult =
  | { ok: true; data: SummaryData }
  | { ok: false; reason: "error" | "cita-no-valida" };

// Solo el código del error: nunca nombres, notas, fechas ni ids.
function logFailure(step: string, code: string | undefined) {
  console.error(`[resumen] ${step} falló:`, code ?? "sin-codigo");
}

// Arma los datos de "Para mi cita" (P10) con 5 SELECT de solo lectura. Si cualquiera falla no hay hoja:
// una hoja incompleta diría "no hay dosis sin marcar" sin ser cierto.
export async function loadSummary(
  supabase: SupabaseServerClient,
  userId: string,
  tz: string,
  now: Date,
  citaId: string | null,
): Promise<LoadSummaryResult> {
  const { data: appointmentRows, error: appointmentsError } = await supabase
    .from("appointments")
    .select("id, title, notes, scheduled_at")
    .eq("user_id", userId)
    .order("scheduled_at", { ascending: true })
    .overrideTypes<AppointmentRow[], { merge: false }>();
  if (appointmentsError) {
    logFailure("citas", appointmentsError.code);
    return { ok: false, reason: "error" };
  }

  const { upcoming, past } = partitionAppointments(
    (appointmentRows ?? []).map((row) => ({ ...row, scheduledAt: row.scheduled_at })),
    now,
  );
  // Solo una cita próxima y propia. Un id ajeno, pasado o inexistente no se distingue entre sí.
  const chosen = citaId ? (upcoming.find((row) => row.id === citaId) ?? null) : (upcoming[0] ?? null);
  if (citaId && !chosen) return { ok: false, reason: "cita-no-valida" };

  const today = formatLocalDate(now, tz);
  const previous = past[0] ? new Date(past[0].scheduledAt) : null;
  const window = summaryWindow(today, previous, tz);
  const startInstant = windowStartInstant(window, tz).toISOString();

  const [medicationsResult, dosesResult, firstDoseResult, logsResult] = await Promise.all([
    supabase
      .from("medications")
      .select("id, name, dosage, schedule_times")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .overrideTypes<MedicationRow[], { merge: false }>(),
    supabase
      .from("doses")
      .select("medication_id, scheduled_at, status")
      .eq("user_id", userId)
      .neq("status", "taken")
      .gte("scheduled_at", startInstant)
      .lt("scheduled_at", now.toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(UNMARKED_DOSES_LIMIT)
      .overrideTypes<{ medication_id: string; scheduled_at: string; status: DoseRowLite["status"] }[], { merge: false }>(),
    supabase
      .from("doses")
      .select("scheduled_at")
      .eq("user_id", userId)
      .gte("scheduled_at", startInstant)
      .order("scheduled_at", { ascending: true })
      .limit(1)
      .overrideTypes<FirstDoseRow[], { merge: false }>(),
    supabase
      .from("symptom_logs")
      .select("id, log_date, severity, notes")
      .eq("user_id", userId)
      .gte("log_date", window.startDate)
      .lte("log_date", window.endDate)
      .order("log_date", { ascending: true })
      .overrideTypes<LogRow[], { merge: false }>(),
  ]);

  const failed = [
    ["medicamentos", medicationsResult.error],
    ["dosis", dosesResult.error],
    ["primera dosis", firstDoseResult.error],
    ["síntomas", logsResult.error],
  ] as const;
  for (const [step, error] of failed) {
    if (error) {
      logFailure(step, error.code);
      return { ok: false, reason: "error" };
    }
  }

  const medicationRows = medicationsResult.data ?? [];
  const doseRows = dosesResult.data ?? [];
  const logRows = logsResult.data ?? [];
  const firstDose = firstDoseResult.data?.[0] ? new Date(firstDoseResult.data[0].scheduled_at) : null;

  // El periodo mostrado es el que realmente cubre: desde el primer día con datos, no desde la fecha
  // de inicio del medicamento. Sin datos se muestra la ventana.
  const start = coveredStart(window, firstDose, logRows[0]?.log_date ?? null, tz) ?? window.startDate;

  return {
    ok: true,
    data: {
      appointment: chosen
        ? {
            id: chosen.id,
            title: chosen.title,
            notes: chosen.notes,
            dateLabel: formatLongDate(new Date(chosen.scheduledAt), tz, now),
            timeLabel: formatTime(new Date(chosen.scheduledAt), tz),
          }
        : null,
      window,
      periodLabel: formatPeriodLabel(start, window.endDate),
      medications: medicationRows.map((row) => ({
        id: row.id,
        name: row.name,
        dosage: row.dosage,
        timesLabel: formatScheduleTimes(row.schedule_times),
      })),
      unmarked: groupUnmarkedDoses(
        doseRows.map((row) => ({ medicationId: row.medication_id, scheduledAt: row.scheduled_at, status: row.status })),
        medicationRows.map((row) => ({ id: row.id, name: row.name, dosage: row.dosage })),
        tz,
        now,
      ),
      unmarkedCapped: doseRows.length >= UNMARKED_DOSES_LIMIT,
      logs: logRows.map((row) => ({
        id: row.id,
        logDate: row.log_date,
        dateLabel: formatCalendarDate(row.log_date),
        level: row.severity,
        notes: row.notes,
      })),
    },
  };
}
