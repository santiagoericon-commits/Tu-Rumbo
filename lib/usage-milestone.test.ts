import { describe, expect, it } from "vitest";
import { usageMilestone } from "@/lib/usage-milestone";

const MZT = "America/Mazatlan";
const CDMX = "America/Mexico_City";
const TIJ = "America/Tijuana";

const at = (iso: string) => new Date(iso);

describe("usageMilestone", () => {
  // Cuenta creada el 1 oct 2026 a las 10:00 en Mazatlán (UTC−7) = 17:00Z.
  const created = at("2026-10-01T17:00:00Z");

  it("a los 7 días de calendario: semana", () => {
    expect(usageMilestone(created, MZT, at("2026-10-08T18:00:00Z"))).toBe("semana");
  });

  it("a los 30 días de calendario: mes", () => {
    expect(usageMilestone(created, MZT, at("2026-10-31T18:00:00Z"))).toBe("mes");
  });

  it.each([
    ["mismo día (0)", "2026-10-01T20:00:00Z"],
    ["6 días", "2026-10-07T18:00:00Z"],
    ["8 días", "2026-10-09T18:00:00Z"],
    ["29 días", "2026-10-30T18:00:00Z"],
    ["31 días", "2026-11-01T18:00:00Z"],
    ["60 días", "2026-11-30T18:00:00Z"],
  ])("%s: null", (_label, nowIso) => {
    expect(usageMilestone(created, MZT, at(nowIso))).toBeNull();
  });

  it("now antes de created (reloj desfasado): null", () => {
    expect(usageMilestone(created, MZT, at("2026-09-24T18:00:00Z"))).toBeNull();
  });

  it("todo el día local 7 cuenta, de las 00:00 a las 23:59 locales", () => {
    // 8 oct 00:05 Mazatlán = 07:05Z; 8 oct 23:55 Mazatlán = 9 oct 06:55Z (otro día UTC).
    expect(usageMilestone(created, MZT, at("2026-10-08T07:05:00Z"))).toBe("semana");
    expect(usageMilestone(created, MZT, at("2026-10-08T15:00:00Z"))).toBe("semana");
    expect(usageMilestone(created, MZT, at("2026-10-09T06:55:00Z"))).toBe("semana");
    // Un minuto antes de la medianoche local del día 7 todavía es el día 6.
    expect(usageMilestone(created, MZT, at("2026-10-08T06:59:00Z"))).toBeNull();
  });

  it("creada a las 23:30 locales, ya en otro día UTC: cuenta desde el día local", () => {
    // 1 oct 23:30 Mazatlán = 2 oct 06:30Z. El día de la cuenta es el 1 oct, no el 2.
    const late = at("2026-10-02T06:30:00Z");
    expect(usageMilestone(late, MZT, at("2026-10-08T18:00:00Z"))).toBe("semana");
    expect(usageMilestone(late, MZT, at("2026-10-09T18:00:00Z"))).toBeNull();
  });

  it("creada a las 00:15 locales: ese mismo día local", () => {
    // 2 oct 00:15 Mazatlán = 2 oct 07:15Z.
    const early = at("2026-10-02T07:15:00Z");
    expect(usageMilestone(early, MZT, at("2026-10-09T07:20:00Z"))).toBe("semana");
    expect(usageMilestone(early, MZT, at("2026-10-08T18:00:00Z"))).toBeNull();
  });

  it("zona distinta al fallback: Ciudad de México", () => {
    // 1 oct 23:30 CDMX (UTC−6) = 2 oct 05:30Z: día local 1 oct.
    const created = at("2026-10-02T05:30:00Z");
    // 8 oct 00:10 CDMX = 8 oct 06:10Z → semana en CDMX…
    expect(usageMilestone(created, CDMX, at("2026-10-08T06:10:00Z"))).toBe("semana");
    // …pero el mismo par de instantes en Mazatlán (1 oct 22:30 → 7 oct 23:10) son 6 días.
    expect(usageMilestone(created, MZT, at("2026-10-08T06:10:00Z"))).toBeNull();
  });

  it("zona inválida cae a America/Mazatlan", () => {
    expect(usageMilestone(created, "Foo/Bar", at("2026-10-08T18:00:00Z"))).toBe("semana");
  });

  it("Tijuana: la semana cruza el fin del horario de verano (día de 25 h)", () => {
    // Fin del horario de verano: 1 nov 2026. 28 oct 23:30 PDT (UTC−7) = 29 oct 06:30Z.
    const created = at("2026-10-29T06:30:00Z");
    // 4 nov 00:10 PST (UTC−8) = 4 nov 08:10Z: 7 días de calendario aunque pasaron 7 días y 1 h.
    expect(usageMilestone(created, TIJ, at("2026-11-04T08:10:00Z"))).toBe("semana");
    // 3 nov 23:50 PST = 4 nov 07:50Z: todavía el día 6.
    expect(usageMilestone(created, TIJ, at("2026-11-04T07:50:00Z"))).toBeNull();
  });

  it("Tijuana: el mes cruza el inicio del horario de verano (día de 23 h)", () => {
    // Inicio: 8 mar 2026. 20 feb 2026 00:15 PST = 20 feb 08:15Z.
    const created = at("2026-02-20T08:15:00Z");
    // 22 mar 00:05 PDT (UTC−7) = 22 mar 07:05Z: 30 días de calendario.
    expect(usageMilestone(created, TIJ, at("2026-03-22T07:05:00Z"))).toBe("mes");
    // 21 mar 23:55 PDT = 22 mar 06:55Z: día 29.
    expect(usageMilestone(created, TIJ, at("2026-03-22T06:55:00Z"))).toBeNull();
  });
});
