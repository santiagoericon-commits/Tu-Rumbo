// Cuántas dosis hay programadas hoy. No cuenta marcadas ni mide avance (docs/marca.md §3, regla 1).
export function formatDoseSummary(total: number): string {
  return total === 1 ? "Tienes 1 dosis programada para hoy." : `Tienes ${total} dosis programadas para hoy.`;
}
