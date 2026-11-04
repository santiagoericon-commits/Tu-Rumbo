import "server-only";

import { getDayRange } from "@/lib/date-range";
import { SCHEDULE_WINDOW_DAYS } from "@/lib/dose-schedule";
import { planDoseTopUp } from "@/lib/dose-topup";
import { addDaysIso, formatLocalDate, localDateTimeToInstant } from "@/lib/local-time";
import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

type MedicationRow = { id: string; schedule_times: string[]; start_date: string; created_at: string };
type DoseRow = { medication_id: string; scheduled_at: string };

// Solo el código del error: nunca nombres, ids ni horarios.
function logFailure(step: string, code: string | undefined) {
  console.error(`[hoy] relleno ${step} falló:`, code ?? "sin-codigo");
}

// SCHED-01: completa las dosis de hoy y los 13 días siguientes al abrir /hoy.
// Excepción declarada a "escribir con Server Actions": es un relleno idempotente al renderizar
// (índice único + solo días sin dosis). Si algo falla, /hoy se muestra igual con lo que hay.
// Lo normal son 2 SELECT y ningún insert; inserta un solo lote cuando falta algún día.
export async function topUpDoses(
  supabase: SupabaseServerClient,
  userId: string,
  tz: string,
  now: Date,
): Promise<void> {
  try {
    const { data: medications, error: medicationsError } = await supabase
      .from("medications")
      .select("id, schedule_times, start_date, created_at")
      .eq("user_id", userId)
      .overrideTypes<MedicationRow[], { merge: false }>();
    if (medicationsError) return logFailure("medicamentos", medicationsError.code);
    if (!medications || medications.length === 0) return;

    const windowStart = getDayRange(tz, now).start;
    const lastDay = addDaysIso(formatLocalDate(now, tz), SCHEDULE_WINDOW_DAYS);
    // Medianoche local del día 15: inicio del día que contiene su mediodía.
    const windowEnd = getDayRange(tz, localDateTimeToInstant(lastDay, "12:00", tz)).start;

    const { data: doses, error: dosesError } = await supabase
      .from("doses")
      .select("medication_id, scheduled_at")
      .eq("user_id", userId)
      .gte("scheduled_at", windowStart.toISOString())
      .lt("scheduled_at", windowEnd.toISOString())
      .overrideTypes<DoseRow[], { merge: false }>();
    if (dosesError) return logFailure("dosis", dosesError.code);

    const missing = planDoseTopUp({
      medications: medications.map((row) => ({
        id: row.id,
        times: row.schedule_times,
        startDate: row.start_date,
        createdAt: new Date(row.created_at),
      })),
      existing: (doses ?? []).map((row) => ({
        medicationId: row.medication_id,
        scheduledAt: new Date(row.scheduled_at),
      })),
      tz,
      now,
    });
    if (missing.length === 0) return;

    // status queda en su default 'pending': la app nunca asigna 'missed'.
    const { error: insertError } = await supabase.from("doses").upsert(
      missing.map((dose) => ({
        user_id: userId,
        medication_id: dose.medicationId,
        scheduled_at: dose.scheduledAt.toISOString(),
      })),
      { onConflict: "medication_id,scheduled_at", ignoreDuplicates: true },
    );
    if (insertError) logFailure("inserción", insertError.code);
  } catch {
    logFailure("inesperado", undefined);
  }
}
