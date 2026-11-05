import { redirect } from "next/navigation";
import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { isUuid } from "@/lib/ids";
import { createClient } from "@/lib/supabase/server";
import { getUserTimeZone } from "@/lib/timezone.server";
import { loadSummary } from "./load-summary";
import { SummarySheet } from "./summary-sheet";

// "Para mi cita" (P10): hoja con lo que la persona registró, para llevar a su consulta. Solo lectura
// (más sus preguntas, que son las notas de la cita). Nada se guarda como PDF; en la URL solo va ?cita=<uuid>.
export default async function ResumenPage(props: PageProps<"/citas/resumen">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const rawCita = (await props.searchParams).cita;
  const citaId = typeof rawCita === "string" && isUuid(rawCita) ? rawCita : null;
  // Un ?cita= que no es uuid se descarta; uno ajeno, pasado o inexistente también (ver loadSummary).
  if (typeof rawCita === "string" && !citaId) redirect("/citas/resumen");

  const tz = await getUserTimeZone();
  const result = await loadSummary(supabase, user.id, tz, new Date(), citaId);

  if (!result.ok && result.reason === "cita-no-valida") redirect("/citas/resumen");

  if (!result.ok) {
    return (
      <div className="flex flex-col gap-4 motion-safe:animate-screen-enter">
        <PageHeader section="citas" title="Para mi cita" />
        <Notice kind="error">No pudimos preparar tu resumen. Inténtalo de nuevo.</Notice>
      </div>
    );
  }

  return <SummarySheet data={result.data} tz={tz} />;
}
