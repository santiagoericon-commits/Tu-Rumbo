export function formatDoseSummary(taken: number, total: number): string {
  if (taken === 0) {
    return total === 1
      ? "Tienes 1 dosis programada para hoy."
      : `Tienes ${total} dosis programadas para hoy.`;
  }
  return `Marcaste ${taken} de ${total} dosis de hoy.`;
}
