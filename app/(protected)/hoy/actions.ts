"use server";

import { revalidatePath } from "next/cache";
import { parseDoseUpdate } from "@/lib/dose-status";
import { createClient } from "@/lib/supabase/server";

export type DoseActionResult = { ok: true } | { ok: false; code: "generico" };

const FAILED: DoseActionResult = { ok: false, code: "generico" };

export async function updateDoseStatusAction(
  doseId: unknown,
  status: unknown,
): Promise<DoseActionResult> {
  const update = parseDoseUpdate(doseId, status);
  if (!update) return FAILED;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return FAILED;

  // RLS filtra las filas ajenas; con RLS un UPDATE sin filas no da error,
  // así que se piden las filas afectadas para detectarlo.
  const { data, error } = await supabase
    .from("doses")
    .update({ status: update.status })
    .eq("id", update.id)
    .eq("user_id", user.id)
    .select("id");

  if (error || !data || data.length === 0) {
    // Solo el código: nunca ids, estados ni mensajes crudos.
    console.error("[hoy] actualización falló:", error?.code ?? "sin-filas");
    return FAILED;
  }

  revalidatePath("/hoy");
  return { ok: true };
}
