"use server";

import { revalidatePath } from "next/cache";
import type { AppointmentErrorCode } from "@/lib/appointment-messages";
import { parseAppointmentForm } from "@/lib/appointment-validation";
import { isUuid } from "@/lib/ids";
import { formatLocalDate, localDateTimeToInstant } from "@/lib/local-time";
import { createClient } from "@/lib/supabase/server";
import { getUserTimeZone } from "@/lib/timezone.server";

export type CreateAppointmentState =
  | { status: "idle" }
  | { status: "saved" }
  | { status: "error"; code: AppointmentErrorCode };

const INVALID: CreateAppointmentState = { status: "error", code: "datos-invalidos" };
const FAILED: CreateAppointmentState = { status: "error", code: "generico" };

// Logs solo con el código del error: nunca títulos, notas, fechas ni ids.
function logFailure(step: string, code: string | undefined) {
  console.error(`[citas] ${step} falló:`, code ?? "sin-codigo");
}

export async function createAppointmentAction(
  _previous: CreateAppointmentState,
  formData: FormData,
): Promise<CreateAppointmentState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return FAILED;

  const tz = await getUserTimeZone();
  const input = parseAppointmentForm(formData, formatLocalDate(new Date(), tz));
  if (!input) return INVALID;

  // Fecha y hora de pared en la zona del usuario -> instante UTC (timestamptz).
  const scheduledAt = localDateTimeToInstant(input.date, input.time, tz);

  const { error } = await supabase.from("appointments").insert({
    user_id: user.id,
    title: input.title,
    notes: input.notes,
    scheduled_at: scheduledAt.toISOString(),
  });

  if (error) {
    logFailure("alta", error.code);
    return FAILED;
  }

  revalidatePath("/citas");
  return { status: "saved" };
}

export type DeleteAppointmentResult = { ok: true } | { ok: false; code: "generico" };

export async function deleteAppointmentAction(appointmentId: unknown): Promise<DeleteAppointmentResult> {
  if (!isUuid(appointmentId)) return { ok: false, code: "generico" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, code: "generico" };

  // RLS filtra las filas ajenas; un DELETE sin filas no da error, por eso se piden las afectadas.
  const { data, error } = await supabase
    .from("appointments")
    .delete()
    .eq("id", appointmentId)
    .eq("user_id", user.id)
    .select("id");

  if (error || !data || data.length === 0) {
    logFailure("eliminación", error?.code ?? "sin-filas");
    return { ok: false, code: "generico" };
  }

  revalidatePath("/citas");
  return { ok: true };
}
