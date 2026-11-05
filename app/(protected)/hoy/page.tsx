import { redirect } from "next/navigation";
import { PathSignIllustration } from "@/components/illustrations";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { formatLongDate, formatTime, getDayRange } from "@/lib/date-range";
import { formatLocalDate } from "@/lib/local-time";
import { createClient } from "@/lib/supabase/server";
import { formatSupplyLine } from "@/lib/supply";
import { loadSupplySummaries } from "@/lib/supply.server";
import { getUserTimeZone } from "@/lib/timezone.server";
import { usageMilestone } from "@/lib/usage-milestone";
import { updateDoseStatusAction } from "./actions";
import { FirstMedicationCard } from "./first-medication-card";
import { MilestoneCard } from "./milestone-card";
import { LowSupplyCard, SupportEntryCard, type LowSupplyItem } from "./support-cards";
import { topUpDoses } from "./top-up";
import { TodayDoses } from "./today-doses";
import type { DoseView, TodayHeader } from "./types";

type DoseRow = {
  id: string;
  scheduled_at: string;
  status: DoseView["status"];
  medications: { name: string; dosage: string | null } | null;
};

export default async function HoyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const tz = await getUserTimeZone();
  const now = new Date();
  const { start, end } = getDayRange(tz, now);

  // Antes de leer: completa las dosis que falten (SCHED-01). Nunca lanza.
  await topUpDoses(supabase, user.id, tz, now);

  const [{ data, error }, supplies] = await Promise.all([
    supabase
      .from("doses")
      .select("id, scheduled_at, status, medications(name, dosage)")
      .eq("user_id", user.id)
      .gte("scheduled_at", start.toISOString())
      .lt("scheduled_at", end.toISOString())
      .order("scheduled_at", { ascending: true })
      .overrideTypes<DoseRow[], { merge: false }>(),
    // Si el surtido no carga, Hoy se ve igual sin la tarjeta (P9).
    loadSupplySummaries(supabase, user.id, tz, now),
  ]);

  if (error) console.error("[hoy] consulta falló:", error.code);

  const doses: DoseView[] = (data ?? []).map((row) => ({
    id: row.id,
    scheduledAt: row.scheduled_at,
    timeLabel: formatTime(new Date(row.scheduled_at), tz),
    name: row.medications?.name ?? "Medicamento",
    dosage: row.medications?.dosage ?? null,
    status: row.status,
  }));

  const today = formatLocalDate(now, tz);
  const lowSupply: LowSupplyItem[] = (supplies ?? [])
    .filter((item) => item.summary.needsSupport)
    .map((item) => ({ id: item.id, name: item.name, line: formatSupplyLine(item.summary, today) }));

  // Hito de uso (P10.5): solo con created_at de la sesión, sin consulta nueva ni conteos.
  const milestone = usageMilestone(new Date(user.created_at), tz, now);
  const header: TodayHeader = { section: "hoy", title: "Hoy", size: "greeting", subtitle: formatLongDate(now, tz, now) };

  return (
    <div className="flex flex-col gap-4 motion-safe:animate-screen-enter">
      {!error && doses.length > 0 ? (
        // Encabezado, resumen y lista en cliente: el encabezado muestra el día cerrado (P10.5).
        <TodayDoses header={header} doses={doses} updateStatus={updateDoseStatusAction} />
      ) : (
        <>
          <PageHeader {...header} />
          {/* Solo si la carga salió bien: junto a un error de carga no tiene sentido. */}
          {error ? null : <FirstMedicationCard />}
          {error ? (
            <Notice kind="error">No pudimos cargar tus dosis de hoy. Inténtalo de nuevo.</Notice>
          ) : (
            // [PENDIENTE REVISIÓN PROFESIONAL]
            <EmptyState
              section="hoy"
              illustration={<PathSignIllustration />}
              title="Hoy no tienes dosis programadas."
              text="Aquí verás tus dosis de cada día, según los horarios de tus medicamentos."
              action={{ href: "/medicamentos", label: "Ver mis medicamentos" }}
            />
          )}
        </>
      )}

      {milestone ? <MilestoneCard milestone={milestone} /> : null}
      <LowSupplyCard items={lowSupply} />
      <SupportEntryCard />

      {/* [PENDIENTE REVISIÓN PROFESIONAL] */}
      <Notice kind="info">Si tienes dudas sobre una dosis, consulta a tu médico o farmacéutico.</Notice>
    </div>
  );
}
