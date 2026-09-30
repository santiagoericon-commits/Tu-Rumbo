// Separa las citas en próximas (desde el instante actual, en orden ascendente) y
// anteriores (de la más reciente a la más antigua).
export function partitionAppointments<T extends { scheduledAt: string }>(
  items: T[],
  now: Date,
): { upcoming: T[]; past: T[] } {
  const nowMs = now.getTime();
  const byTime = [...items].sort((a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt));
  return {
    upcoming: byTime.filter((item) => Date.parse(item.scheduledAt) >= nowMs),
    past: byTime.filter((item) => Date.parse(item.scheduledAt) < nowMs).reverse(),
  };
}
