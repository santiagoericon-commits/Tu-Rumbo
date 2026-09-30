import { describe, expect, it } from "vitest";
import { addDaysIso, formatLocalDate, localDateTimeToInstant } from "@/lib/local-time";

const MZT = "America/Mazatlan";
const CDMX = "America/Mexico_City";
const TIJ = "America/Tijuana";

const at = (iso: string) => new Date(iso);
const isoOf = (date: string, time: string, tz: string) =>
  localDateTimeToInstant(date, time, tz).toISOString();

describe("formatLocalDate", () => {
  it("Mazatlán: devuelve la fecha local en formato ISO", () => {
    expect(formatLocalDate(at("2026-09-29T20:00:00Z"), MZT)).toBe("2026-09-29");
  });

  it("cuando en UTC ya es el día siguiente, sigue siendo el día local", () => {
    expect(formatLocalDate(at("2026-09-30T05:30:00Z"), MZT)).toBe("2026-09-29");
  });

  it("en Ciudad de México ese mismo instante ya es el día siguiente", () => {
    expect(formatLocalDate(at("2026-09-30T06:30:00Z"), CDMX)).toBe("2026-09-30");
  });

  it("con una zona inválida cae a America/Mazatlan", () => {
    const now = at("2026-09-30T05:30:00Z");
    expect(formatLocalDate(now, "Foo/Bar")).toBe(formatLocalDate(now, MZT));
  });
});

describe("addDaysIso", () => {
  it("suma días de calendario", () => {
    expect(addDaysIso("2026-09-29", 365)).toBe("2027-09-29");
  });

  it("cruza fin de mes y de año", () => {
    expect(addDaysIso("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDaysIso("2026-09-25", 13)).toBe("2026-10-08");
  });

  it("con cero devuelve la misma fecha", () => {
    expect(addDaysIso("2026-09-29", 0)).toBe("2026-09-29");
  });
});

describe("localDateTimeToInstant", () => {
  it("Mazatlán: 8:00 locales son las 15:00Z", () => {
    expect(isoOf("2026-09-29", "08:00", MZT)).toBe("2026-09-29T15:00:00.000Z");
  });

  it("Ciudad de México: la misma hora de pared es otro instante", () => {
    expect(isoOf("2026-09-29", "08:00", CDMX)).toBe("2026-09-29T14:00:00.000Z");
  });

  it("23:30 locales caen en el día UTC siguiente", () => {
    expect(isoOf("2026-09-29", "23:30", MZT)).toBe("2026-09-30T06:30:00.000Z");
  });

  it("00:15 locales caen en el mismo día UTC", () => {
    expect(isoOf("2026-09-29", "00:15", MZT)).toBe("2026-09-29T07:15:00.000Z");
  });

  it("Tijuana, 8 de marzo de 2026 a las 02:30 (hora inexistente): se recorre a las 03:30 PDT", () => {
    expect(isoOf("2026-03-08", "02:30", TIJ)).toBe("2026-03-08T10:30:00.000Z");
  });

  it("Tijuana, 8 de marzo de 2026 a las 08:00: ya en horario de verano", () => {
    expect(isoOf("2026-03-08", "08:00", TIJ)).toBe("2026-03-08T15:00:00.000Z");
  });

  it("Tijuana, 1 de noviembre de 2026 a la 01:30 (hora repetida): la primera ocurrencia", () => {
    expect(isoOf("2026-11-01", "01:30", TIJ)).toBe("2026-11-01T08:30:00.000Z");
  });

  it("Tijuana, 1 de noviembre de 2026 a las 08:00: ya en horario estándar", () => {
    expect(isoOf("2026-11-01", "08:00", TIJ)).toBe("2026-11-01T16:00:00.000Z");
  });

  it("con una zona inválida cae a America/Mazatlan", () => {
    expect(isoOf("2026-09-29", "08:00", "Foo/Bar")).toBe(isoOf("2026-09-29", "08:00", MZT));
  });
});
