import "server-only";

import type { createClient } from "@/lib/supabase/server";
import { summarizeSupply, type SupplySummary } from "@/lib/supply";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

type MedicationSupplyRow = {
  id: string;
  name: string;
  schedule_times: string[];
  supply_count: number;
  supply_set_at: string;
};
type TakenRow = { medication_id: string; scheduled_at: string };

export type MedicationSupply = { id: string; name: string; summary: SupplySummary };

// Surtido de los medicamentos que tienen el dato. 2 SELECT: medicamentos con surtido y sus dosis
// tomadas desde el supply_set_at más antiguo. Si algo falla devuelve null y registra solo el código;
// la pantalla se muestra sin surtido.
export async function loadSupplySummaries(
  supabase: SupabaseServerClient,
  userId: string,
  tz: string,
  now: Date,
): Promise<MedicationSupply[] | null> {
  const { data: medications, error } = await supabase
    .from("medications")
    .select("id, name, schedule_times, supply_count, supply_set_at")
    .eq("user_id", userId)
    .not("supply_count", "is", null)
    .overrideTypes<MedicationSupplyRow[], { merge: false }>();
  if (error) {
    console.error("[surtido] medicamentos falló:", error.code);
    return null;
  }
  if (!medications || medications.length === 0) return [];

  const earliest = new Date(
    Math.min(...medications.map((row) => new Date(row.supply_set_at).getTime())),
  ).toISOString();
  const { data: taken, error: takenError } = await supabase
    .from("doses")
    .select("medication_id, scheduled_at")
    .eq("user_id", userId)
    .eq("status", "taken")
    .in(
      "medication_id",
      medications.map((row) => row.id),
    )
    .gte("scheduled_at", earliest)
    .overrideTypes<TakenRow[], { merge: false }>();
  if (takenError) {
    console.error("[surtido] dosis falló:", takenError.code);
    return null;
  }

  return medications.flatMap((row) => {
    const summary = summarizeSupply({
      supplyCount: row.supply_count,
      supplySetAt: new Date(row.supply_set_at),
      times: row.schedule_times,
      taken: (taken ?? [])
        .filter((dose) => dose.medication_id === row.id)
        .map((dose) => new Date(dose.scheduled_at)),
      tz,
      now,
    });
    return summary ? [{ id: row.id, name: row.name, summary }] : [];
  });
}
