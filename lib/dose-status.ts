import { isUuid } from "@/lib/ids";

// Estados que el usuario puede asignar. La app nunca asigna "missed".
export const DOSE_STATUSES = ["taken", "pending"] as const;
export type SettableDoseStatus = (typeof DOSE_STATUSES)[number];

export function parseDoseUpdate(
  id: unknown,
  status: unknown,
): { id: string; status: SettableDoseStatus } | null {
  if (!isUuid(id)) return null;
  const allowed: readonly unknown[] = DOSE_STATUSES;
  if (!allowed.includes(status)) return null;
  return { id, status: status as SettableDoseStatus };
}
