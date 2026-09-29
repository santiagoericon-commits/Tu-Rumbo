"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { TIME_ZONE_PATTERN } from "@/lib/timezone";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

// Guarda la zona horaria del navegador en la cookie `tz` para que el servidor
// calcule "hoy" en hora local. Refresca una sola vez cuando la zona cambia.
export function TimeZoneSync({ current }: { current: string }) {
  const router = useRouter();
  const synced = useRef(false);

  useEffect(() => {
    if (synced.current) return;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz || !TIME_ZONE_PATTERN.test(tz) || tz === current) return;

    synced.current = true;
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `tz=${tz}; Path=/; Max-Age=${ONE_YEAR_SECONDS}; SameSite=Lax${secure}`;
    router.refresh();
  }, [current, router]);

  return null;
}
