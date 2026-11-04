import { describe, expect, it } from "vitest";
import { formatShortDate, formatSupplyLine, summarizeSupply, SUPPORT_THRESHOLD_DAYS } from "@/lib/supply";

const MZT = "America/Mazatlan"; // UTC-7
const CDMX = "America/Mexico_City"; // UTC-6

const at = (iso: string) => new Date(iso);
// Espacio no separable: las fechas cortas nunca se parten entre líneas.
const nb = (text: string) => text.replaceAll(" ", "\u00a0");
// Miércoles 4 nov 2026, 10:00 en Mazatlán.
const NOW = at("2026-11-04T17:00:00Z");
const SET_AT = at("2026-11-01T15:00:00Z");

const base = {
  supplyCount: 10,
  supplySetAt: SET_AT,
  times: ["08:00"],
  taken: [] as Date[],
  tz: MZT,
  now: NOW,
};

describe("summarizeSupply", () => {
  it("sin dato de surtido devuelve null", () => {
    expect(summarizeSupply({ ...base, supplyCount: null, supplySetAt: null })).toBeNull();
  });

  it("solo restan las dosis tomadas desde supply_set_at", () => {
    const taken = [
      at("2026-10-31T15:00:00Z"), // antes de anotar el surtido: no resta
      at("2026-11-02T15:00:00Z"),
      at("2026-11-03T15:00:00Z"),
    ];
    expect(summarizeSupply({ ...base, taken })?.remaining).toBe(8);
  });

  it("las dosis no marcadas no restan", () => {
    // Del 1 al 4 hubo 4 dosis programadas; ninguna marcada.
    expect(summarizeSupply(base)?.remaining).toBe(10);
  });

  it("nunca baja de 0", () => {
    const taken = [at("2026-11-02T15:00:00Z"), at("2026-11-03T15:00:00Z")];
    const summary = summarizeSupply({ ...base, supplyCount: 1, taken });
    expect(summary?.remaining).toBe(0);
  });

  it("0 tomas: sin fecha y con apoyo", () => {
    expect(summarizeSupply({ ...base, supplyCount: 0 })).toEqual({
      remaining: 0,
      lastDay: null,
      daysLeft: 0,
      needsSupport: true,
    });
  });

  it("una toma al día, con la de hoy ya pasada: 10 tomas alcanzan hasta el día 14", () => {
    // 8:00 de hoy ya pasó (son las 10:00): cuenta desde mañana.
    const summary = summarizeSupply(base);
    expect(summary?.lastDay).toBe("2026-11-14");
    expect(summary?.daysLeft).toBe(10);
    expect(summary?.needsSupport).toBe(false);
  });

  it("la toma de hoy que todavía no llega cuenta hoy", () => {
    const summary = summarizeSupply({ ...base, times: ["20:00"], supplyCount: 1 });
    expect(summary?.lastDay).toBe("2026-11-04");
    expect(summary?.daysLeft).toBe(0);
  });

  it("varias tomas al día: 9 tomas con 08:00 y 20:00 alcanzan hasta el día 8", () => {
    // Hoy queda la de 20:00 (1), luego 2 por día: 5, 6, 7 y la de 8:00 del 8 = 9.
    const summary = summarizeSupply({ ...base, times: ["08:00", "20:00"], supplyCount: 9 });
    expect(summary?.lastDay).toBe("2026-11-08");
    expect(summary?.daysLeft).toBe(4);
    expect(summary?.needsSupport).toBe(true);
  });

  it(`umbral: ${SUPPORT_THRESHOLD_DAYS} días pide apoyo y 8 no`, () => {
    expect(summarizeSupply({ ...base, supplyCount: 7 })?.daysLeft).toBe(7);
    expect(summarizeSupply({ ...base, supplyCount: 7 })?.needsSupport).toBe(true);
    expect(summarizeSupply({ ...base, supplyCount: 8 })?.daysLeft).toBe(8);
    expect(summarizeSupply({ ...base, supplyCount: 8 })?.needsSupport).toBe(false);
  });

  it("23:30 y 00:15 cuentan en su día local", () => {
    // Hoy quedan 23:30; mañana 00:15 y 23:30; el día 6, 00:15.
    const summary = summarizeSupply({ ...base, times: ["23:30", "00:15"], supplyCount: 4 });
    expect(summary?.lastDay).toBe("2026-11-06");
  });

  it("zona distinta al fallback: en CDMX ya son las 11:00 y la de 8:00 también pasó", () => {
    const summary = summarizeSupply({ ...base, tz: CDMX, times: ["10:30"], supplyCount: 1 });
    expect(summary?.lastDay).toBe("2026-11-05"); // 10:30 de hoy en CDMX ya pasó
  });

  it("acepta horarios como los devuelve Postgres (HH:MM:SS)", () => {
    expect(summarizeSupply({ ...base, times: ["08:00:00"] })?.lastDay).toBe("2026-11-14");
  });
});

describe("formatShortDate", () => {
  it("día corto sin 'de' ni puntos", () => {
    expect(formatShortDate("2026-11-15", "2026-11-04")).toBe(nb("dom 15 nov"));
    expect(formatShortDate("2026-09-02", "2026-08-30")).toBe(nb("mié 2 sep"));
  });

  it("agrega el año si no es el año en curso", () => {
    expect(formatShortDate("2027-01-05", "2026-11-04")).toBe(nb("mar 5 ene 2027"));
  });
});

describe("formatSupplyLine", () => {
  const today = "2026-11-04";

  it("varias tomas", () => {
    expect(
      formatSupplyLine({ remaining: 9, lastDay: "2026-11-15", daysLeft: 11, needsSupport: false }, today),
    ).toBe(`Te quedan unas 9 tomas · hasta ${nb("el dom 15 nov")}`);
  });

  it("una toma y hoy o mañana", () => {
    expect(formatSupplyLine({ remaining: 1, lastDay: today, daysLeft: 0, needsSupport: true }, today)).toBe(
      "Te queda 1 toma · hasta hoy",
    );
    expect(
      formatSupplyLine({ remaining: 2, lastDay: "2026-11-05", daysLeft: 1, needsSupport: true }, today),
    ).toBe("Te quedan unas 2 tomas · hasta mañana");
  });

  it("sin tomas", () => {
    expect(formatSupplyLine({ remaining: 0, lastDay: null, daysLeft: 0, needsSupport: true }, today)).toBe(
      "Según tu registro, ya no te quedan tomas",
    );
  });
});
