"use server";

import { revalidatePath } from "next/cache";
import { formatLocalDate } from "@/lib/local-time";
import type { SymptomErrorCode } from "@/lib/symptom-messages";
import { parseSymptomForm } from "@/lib/symptom-validation";
import { createClient } from "@/lib/supabase/server";
import { getUserTimeZone } from "@/lib/timezone.server";

export type SaveSymptomState =
  | { status: "idle" }
  | { status: "saved" }
  | { status: "error"; code: SymptomErrorCode };

export async function saveSymptomLogAction(
  _previous: SaveSymptomState,
  formData: FormData,
): Promise<SaveSymptomState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", code: "generico" };

  const input = parseSymptomForm(formData);
  if (!input) return { status: "error", code: "datos-invalidos" };

  // "Hoy" se calcula en el servidor, en la zona del usuario; nunca viene del formulario.
  const logDate = formatLocalDate(new Date(), await getUserTimeZone());

  // Un registro por día: si ya existe el de hoy, se actualiza (unique user_id + log_date).
  const { data, error } = await supabase
    .from("symptom_logs")
    .upsert(
      { user_id: user.id, log_date: logDate, severity: input.level, notes: input.notes },
      { onConflict: "user_id,log_date" },
    )
    .select("id");

  if (error || !data || data.length === 0) {
    // Solo el código: nunca notas, valores ni fechas.
    console.error("[sintomas] guardado falló:", error?.code ?? "sin-filas");
    return { status: "error", code: "generico" };
  }

  revalidatePath("/sintomas");
  return { status: "saved" };
}
