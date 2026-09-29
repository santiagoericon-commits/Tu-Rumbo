// Estados que el usuario puede asignar. La app nunca asigna "missed".
export const DOSE_STATUSES = ["taken", "pending"] as const;
export type SettableDoseStatus = (typeof DOSE_STATUSES)[number];

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseDoseUpdate(
  id: unknown,
  status: unknown,
): { id: string; status: SettableDoseStatus } | null {
  if (typeof id !== "string" || !UUID_PATTERN.test(id)) return null;
  const allowed: readonly unknown[] = DOSE_STATUSES;
  if (!allowed.includes(status)) return null;
  return { id, status: status as SettableDoseStatus };
}
