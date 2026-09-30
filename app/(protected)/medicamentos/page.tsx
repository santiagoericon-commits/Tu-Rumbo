import { redirect } from "next/navigation";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { card, cardTitle } from "@/components/ui/styles";
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
    <div className="flex flex-col gap-4 motion-safe:animate-screen-enter">
      <PageHeader section="medicamentos" title="Medicamentos" />

      {error ? (
        <Notice kind="error">No pudimos cargar tus medicamentos. Inténtalo de nuevo.</Notice>
      ) : medications.length === 0 ? (
        // [PENDIENTE REVISIÓN PROFESIONAL]
        <EmptyState
          section="medicamentos"
          title="Todavía no hay medicamentos."
          text="Agrega el primero con los datos de tu receta."
          action={{ href: "#agregar-medicamento", label: "Agregar medicamento" }}
        />
      ) : (
        <ul className="flex flex-col gap-4">
          {medications.map((medication) => (
            <MedicationItem key={medication.id} medication={medication} />
          ))}
        </ul>
      )}

      <section id="agregar-medicamento" aria-labelledby="agregar-medicamento-titulo" className={`${card} mt-4`}>
        <h2 id="agregar-medicamento-titulo" className={cardTitle}>
          Agregar medicamento
        </h2>
        <MedicationForm todayLocal={todayLocal} maxStartDate={maxStartDate} />
      </section>
    </div>
  );
}
