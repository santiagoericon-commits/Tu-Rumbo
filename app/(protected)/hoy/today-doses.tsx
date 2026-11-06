"use client";

import { useOptimistic, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { isDayClosed } from "@/lib/day-closed";
import { DayClosedLine } from "./day-closed-line";
import { DoseList } from "./dose-list";
import { FirstMedicationCard } from "./first-medication-card";
import type { DoseUpdate, DoseView, TodayHeader, UpdateDoseStatus } from "./types";

// El estado optimista solo vive mientras la acción está en curso. Al terminar,
// React vuelve a `doses` del servidor: si la acción falló, nada queda marcado.
function applyUpdate(state: DoseView[], update: DoseUpdate): DoseView[] {
  return state.map((dose) => (dose.id === update.id ? { ...dose, status: update.status } : dose));
}

const statusesOf = (doses: DoseView[]) => doses.map((dose) => dose.status);

type TodayDosesProps = { header: TodayHeader; doses: DoseView[]; updateStatus: UpdateDoseStatus };

// Encabezado + resumen + lista en un solo componente cliente, para que el encabezado vea el estado
// optimista de las dosis y muestre "Listo por hoy." al marcar la última.
export function TodayDoses({ header, doses, updateStatus }: TodayDosesProps) {
  const [optimisticDoses, applyOptimistic] = useOptimistic(doses, applyUpdate);
  const closed = isDayClosed(statusesOf(optimisticDoses));

  // El cierre solo se anima si lo provocó un "Ya la tomé" (urgente, en onSubmit de la dosis). Un
  // "Deshacer" lo apaga: si esa acción falla y el estado vuelve a cerrado, la línea reaparece quieta.
  // Al recargar con todo marcado empieza en false: quieta. Solo memoria, nunca storage; router.refresh()
  // conserva el componente y no repite la animación.
  const [closedByTap, setClosedByTap] = useState(false);

  return (
    <>
      <PageHeader section={header.section} title={header.title} size={header.size} subtitle={header.subtitle}>
        {/* Región viva siempre montada: la línea se anuncia al aparecer y se va sin salida animada. */}
        <div role="status">{closed ? <DayClosedLine animate={closedByTap} /> : null}</div>
      </PageHeader>
      <FirstMedicationCard />
      <DoseList
        doses={optimisticDoses}
        applyOptimistic={applyOptimistic}
        updateStatus={updateStatus}
        onTap={(next) => setClosedByTap(next === "taken")}
      />
    </>
  );
}
