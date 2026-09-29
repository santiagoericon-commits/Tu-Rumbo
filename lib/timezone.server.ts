import { cookies } from "next/headers";
import { resolveTimeZone } from "@/lib/timezone";

export const TZ_COOKIE = "tz";

export async function getUserTimeZone(): Promise<string> {
  const cookieStore = await cookies();
  return resolveTimeZone(cookieStore.get(TZ_COOKIE)?.value);
}
