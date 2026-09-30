import { redirect } from "next/navigation";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { formatLongDate, formatTime, getDayRange } from "@/lib/date-range";
import { createClient } from "@/lib/supabase/server";
import { getUserTimeZone } from "@/lib/timezone.server";
import { DoseList } from "./dose-list";
import type { DoseView } from "./types";

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

  const { data, error } = await supabase
    .from("doses")
    .select("id, scheduled_at, status, medications(name, dosage)")
    .eq("user_id", user.id)
    .gte("scheduled_at", start.toISOString())
    .lt("scheduled_at", end.toISOString())
    .order("scheduled_at", { ascending: true })
    .overrideTypes<DoseRow[], { merge: false }>();

  if (error) console.error("[hoy] consulta falló:", error.code);

  const doses: DoseView[] = (data ?? []).map((row) => ({
    id: row.id,
    scheduledAt: row.scheduled_at,
    timeLabel: formatTime(new Date(row.scheduled_at), tz),
    name: row.medications?.name ?? "Medicamento",
    dosage: row.medications?.dosage ?? null,
    status: row.status,
  }));

  return (
    <div className="flex flex-col gap-4 motion-safe:animate-screen-enter">
      <PageHeader section="hoy" title="Hoy" size="greeting" subtitle={formatLongDate(now, tz, now)} />

      {error ? (
        <Notice kind="error">No pudimos cargar tus dosis de hoy. Inténtalo de nuevo.</Notice>
      ) : doses.length === 0 ? (
        // [PENDIENTE REVISIÓN PROFESIONAL]
        <EmptyState
          section="hoy"
          title="Hoy no tienes dosis programadas."
          text="Aquí verás tus dosis de cada día, según los horarios de tus medicamentos."
          action={{ href: "/medicamentos", label: "Ver mis medicamentos" }}
        />
      ) : (
        <DoseList doses={doses} />
      )}

      {/* [PENDIENTE REVISIÓN PROFESIONAL] */}
      <Notice kind="info">Si tienes dudas sobre una dosis, consulta a tu médico o farmacéutico.</Notice>
    </div>
  );
}
