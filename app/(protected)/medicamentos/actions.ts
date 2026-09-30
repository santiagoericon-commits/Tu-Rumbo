"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateDoseInstants } from "@/lib/dose-schedule";
import { isUuid } from "@/lib/ids";
import { formatLocalDate } from "@/lib/local-time";
import type { MedicationErrorCode } from "@/lib/medication-messages";
import { parseMedicationForm } from "@/lib/medication-validation";
import { createClient } from "@/lib/supabase/server";
import { getUserTimeZone } from "@/lib/timezone.server";

export type CreateMedicationState = { status: "idle" } | { status: "error"; code: MedicationErrorCode };

const INVALID: CreateMedicationState = { status: "error", code: "datos-invalidos" };
const FAILED: CreateMedicationState = { status: "error", code: "generico" };

// Logs solo con el código del error: nunca nombres, dosis, horarios ni ids.
function logFailure(step: string, code: string | undefined) {
  console.error(`[medicamentos] ${step} falló:`, code ?? "sin-codigo");
}

export async function createMedicationAction(
  _previous: CreateMedicationState,
  formData: FormData,
): Promise<CreateMedicationState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return FAILED;

  const tz = await getUserTimeZone();
  const now = new Date();
  const input = parseMedicationForm(formData, formatLocalDate(now, tz));
  if (!input) return INVALID;

  // Con una ventana de 14 días siempre hay dosis futuras; el chequeo es defensivo.
  const instants = generateDoseInstants({ ...input, tz, now });
  if (instants.length === 0) return FAILED;

  const { data: medication, error: medicationError } = await supabase
    .from("medications")
    .insert({
      user_id: user.id,
      name: input.name,
      dosage: input.dosage,
      schedule_times: input.times,
      start_date: input.startDate,
    })
    .select("id")
    .single()
    .overrideTypes<{ id: string }, { merge: false }>();

  if (medicationError || !medication) {
    logFailure("alta", medicationError?.code ?? "sin-fila");
    return FAILED;
  }

  const { error: dosesError } = await supabase.from("doses").insert(
    instants.map((instant) => ({
      user_id: user.id,
      medication_id: medication.id,
      scheduled_at: instant.toISOString(),
    })),
  );

  if (dosesError) {
    logFailure("dosis", dosesError.code);
    // Nunca dejar un medicamento sin dosis: se borra (cascade) y se informa genérico.
    const { error: cleanupError } = await supabase
      .from("medications")
      .delete()
      .eq("id", medication.id)
      .eq("user_id", user.id);
    if (cleanupError) logFailure("limpieza", cleanupError.code);
    return FAILED;
  }

  revalidatePath("/medicamentos");
  revalidatePath("/hoy");
  redirect("/hoy");
}

export type DeleteMedicationResult = { ok: true } | { ok: false; code: "generico" };

export async function deleteMedicationAction(medicationId: unknown): Promise<DeleteMedicationResult> {
  if (!isUuid(medicationId)) return { ok: false, code: "generico" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, code: "generico" };

  // RLS filtra las filas ajenas; un DELETE sin filas no da error, por eso se piden las afectadas.
  const { data, error } = await supabase
    .from("medications")
    .delete()
    .eq("id", medicationId)
    .eq("user_id", user.id)
    .select("id");

  if (error || !data || data.length === 0) {
    logFailure("eliminación", error?.code ?? "sin-filas");
    return { ok: false, code: "generico" };
  }

  revalidatePath("/medicamentos");
  revalidatePath("/hoy");
  return { ok: true };
}
