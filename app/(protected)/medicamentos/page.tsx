import { redirect } from "next/navigation";
import { addDaysIso, formatLocalDate } from "@/lib/local-time";
import { MAX_START_OFFSET_DAYS } from "@/lib/medication-validation";
import { formatScheduleTimes, formatStartDate } from "@/lib/schedule-format";
import { createClient } from "@/lib/supabase/server";
import { getUserTimeZone } from "@/lib/timezone.server";
import { MedicationForm } from "./medication-form";
import { MedicationItem } from "./medication-item";
import type { MedicationView } from "./types";

type MedicationRow = {
  id: string;
  name: string;
  dosage: string | null;
  schedule_times: string[];
  start_date: string;
};

export default async function MedicamentosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const tz = await getUserTimeZone();
  const todayLocal = formatLocalDate(new Date(), tz);
  const maxStartDate = addDaysIso(todayLocal, MAX_START_OFFSET_DAYS);

  const { data, error } = await supabase
    .from("medications")
    .select("id, name, dosage, schedule_times, start_date")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .overrideTypes<MedicationRow[], { merge: false }>();

  if (error) console.error("[medicamentos] consulta falló:", error.code);

  const medications: MedicationView[] = (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    dosage: row.dosage,
    timesLabel: formatScheduleTimes(row.schedule_times),
    startLabel: formatStartDate(row.start_date),
  }));

  return (
    <div>
      <h2 className="text-xl font-semibold text-ink">Medicamentos</h2>

      {error ? (
        <p role="alert" className="mt-4 text-base text-ink">
          No pudimos cargar tus medicamentos. Inténtalo de nuevo.
        </p>
      ) : medications.length === 0 ? (
        <p className="mt-4 text-base text-ink-muted">Aún no has agregado medicamentos.</p>
      ) : (
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {medications.map((medication) => (
            <MedicationItem key={medication.id} medication={medication} />
          ))}
        </ul>
      )}

      <section aria-labelledby="agregar-medicamento" className="mt-8">
        <h3 id="agregar-medicamento" className="text-lg font-semibold text-ink">
          Agregar medicamento
        </h3>
        <MedicationForm todayLocal={todayLocal} maxStartDate={maxStartDate} />
      </section>
    </div>
  );
}
