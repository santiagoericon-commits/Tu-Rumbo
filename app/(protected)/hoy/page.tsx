import Link from "next/link";
import { redirect } from "next/navigation";
import { formatDayHeading, formatTime, getDayRange } from "@/lib/date-range";
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
    <div>
      <h2 className="text-xl font-semibold text-ink">{formatDayHeading(now, tz)}</h2>

      {error ? (
        <p role="alert" className="mt-4 text-base text-ink">
          No pudimos cargar tus dosis de hoy. Inténtalo de nuevo.
        </p>
      ) : doses.length === 0 ? (
        <div className="mt-4">
          <p className="text-base text-ink-muted">No tienes dosis programadas para hoy.</p>
          <Link
            href="/medicamentos"
            className="mt-2 inline-flex min-h-11 items-center text-base text-accent underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Agregar un medicamento
          </Link>
        </div>
      ) : (
        <DoseList doses={doses} />
      )}

      {/* [PENDIENTE REVISIÓN PROFESIONAL] */}
      <p className="mt-6 text-base text-ink-muted">
        Si tienes dudas sobre una dosis, consulta a tu médico o farmacéutico.
      </p>
    </div>
  );
}
