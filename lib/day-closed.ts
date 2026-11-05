// "Día cerrado" (docs/marca.md §3): todas las dosis de hoy marcadas como tomadas.
// Sin dosis no hay día que cerrar. "missed" y "pending" cuentan como abiertas: la app
// nunca asigna "missed" y, si existe, se muestra como pendiente. Solo cambia con tests.
export type DayDoseStatus = "pending" | "taken" | "missed";

export function isDayClosed(statuses: ReadonlyArray<DayDoseStatus>): boolean {
  return statuses.length > 0 && statuses.every((status) => status === "taken");
}
