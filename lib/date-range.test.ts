import { describe, expect, it } from "vitest";
import { formatDayHeading, formatTime, getDayRange } from "@/lib/date-range";

const MZT = "America/Mazatlan";
const CDMX = "America/Mexico_City";
const TIJ = "America/Tijuana";
const HOUR = 60 * 60 * 1000;

const at = (iso: string) => new Date(iso);
const inRange = (instant: Date, range: { start: Date; end: Date }) =>
  instant >= range.start && instant < range.end;

// Intl puede separar la hora de "a.m." con espacio normal, no separable o fino
// no separable según la versión de ICU (Node 20 local, Node 22 en Vercel).
const SEPARATORS = /[   ]/g;
const norm = (s: string) => s.replace(SEPARATORS, " ");

describe("getDayRange", () => {
  it("Mazatlán: el día local va de 07:00Z a 07:00Z del día siguiente", () => {
    const range = getDayRange(MZT, at("2026-09-29T20:00:00Z"));
    expect(range.start.toISOString()).toBe("2026-09-29T07:00:00.000Z");
    expect(range.end.toISOString()).toBe("2026-09-30T07:00:00.000Z");
  });

  it("Ciudad de México: el día local va de 06:00Z a 06:00Z", () => {
    const range = getDayRange(CDMX, at("2026-09-29T20:00:00Z"));
    expect(range.start.toISOString()).toBe("2026-09-29T06:00:00.000Z");
    expect(range.end.toISOString()).toBe("2026-09-30T06:00:00.000Z");
  });

  it("una dosis a las 23:30 locales queda en su día y no en el siguiente", () => {
    const dose = at("2026-09-30T06:30:00Z"); // 23:30 del 29 en Mazatlán
    expect(inRange(dose, getDayRange(MZT, at("2026-09-29T20:00:00Z")))).toBe(true);
    expect(inRange(dose, getDayRange(MZT, at("2026-09-30T20:00:00Z")))).toBe(false);
  });

  it("una dosis a las 00:15 locales queda en el día nuevo y no en el anterior", () => {
    const dose = at("2026-09-30T07:15:00Z"); // 00:15 del 30 en Mazatlán
    expect(inRange(dose, getDayRange(MZT, at("2026-09-30T20:00:00Z")))).toBe(true);
    expect(inRange(dose, getDayRange(MZT, at("2026-09-29T20:00:00Z")))).toBe(false);
  });

  it("cuando en UTC ya es el día siguiente pero en Mazatlán no, usa el día local", () => {
    const range = getDayRange(MZT, at("2026-09-30T03:00:00Z")); // 20:00 del 29 en Mazatlán
    expect(range.start.toISOString()).toBe("2026-09-29T07:00:00.000Z");
    expect(range.end.toISOString()).toBe("2026-09-30T07:00:00.000Z");
  });

  it("Tijuana, 8 de marzo de 2026 (inicio de horario de verano): día de 23 horas", () => {
    const range = getDayRange(TIJ, at("2026-03-08T20:00:00Z"));
    expect(range.start.toISOString()).toBe("2026-03-08T08:00:00.000Z");
    expect(range.end.toISOString()).toBe("2026-03-09T07:00:00.000Z");
    expect(range.end.getTime() - range.start.getTime()).toBe(23 * HOUR);
  });

  it("Tijuana, 1 de noviembre de 2026 (fin de horario de verano): día de 25 horas", () => {
    const range = getDayRange(TIJ, at("2026-11-01T20:00:00Z"));
    expect(range.start.toISOString()).toBe("2026-11-01T07:00:00.000Z");
    expect(range.end.toISOString()).toBe("2026-11-02T08:00:00.000Z");
    expect(range.end.getTime() - range.start.getTime()).toBe(25 * HOUR);
  });

  it.each([MZT, CDMX])("%s ya no cambia de horario: esos días duran 24 horas", (tz) => {
    for (const iso of ["2026-03-08T20:00:00Z", "2026-11-01T20:00:00Z"]) {
      const range = getDayRange(tz, at(iso));
      expect(range.end.getTime() - range.start.getTime()).toBe(24 * HOUR);
    }
  });

  it("cruza fin de mes y de año", () => {
    const range = getDayRange(MZT, at("2026-12-31T20:00:00Z"));
    expect(range.start.toISOString()).toBe("2026-12-31T07:00:00.000Z");
    expect(range.end.toISOString()).toBe("2027-01-01T07:00:00.000Z");
  });

  it("con una zona inválida cae a America/Mazatlan", () => {
    const now = at("2026-09-29T20:00:00Z");
    expect(getDayRange("Foo/Bar", now)).toEqual(getDayRange(MZT, now));
    expect(getDayRange("", now)).toEqual(getDayRange(MZT, now));
  });
});

describe("formatTime", () => {
  it.each([
    ["2026-09-29T15:05:00Z", MZT, "8:05 a.m."],
    ["2026-09-30T06:30:00Z", MZT, "11:30 p.m."],
    ["2026-09-30T07:15:00Z", MZT, "12:15 a.m."],
    ["2026-09-29T15:05:00Z", CDMX, "9:05 a.m."],
  ])("%s en %s se muestra como %s", (iso, tz, expected) => {
    expect(norm(formatTime(at(iso), tz))).toBe(expected);
  });

  it("separa la hora de a.m./p.m. con uno de los espacios que produce Intl", () => {
    const text = formatTime(at("2026-09-29T15:05:00Z"), MZT);
    expect(text.at(-5)).toMatch(SEPARATORS);
  });
});

describe("formatDayHeading", () => {
  it("empieza con mayúscula y usa la fecha local", () => {
    expect(formatDayHeading(at("2026-09-29T20:00:00Z"), MZT)).toBe(
      "Hoy, martes, 29 de septiembre",
    );
  });

  it("sigue siendo martes en Mazatlán cuando en UTC ya es miércoles", () => {
    expect(formatDayHeading(at("2026-09-30T05:30:00Z"), MZT)).toBe(
      "Hoy, martes, 29 de septiembre",
    );
  });

  it("en Ciudad de México ese mismo instante ya es miércoles", () => {
    expect(formatDayHeading(at("2026-09-30T06:30:00Z"), CDMX)).toBe(
      "Hoy, miércoles, 30 de septiembre",
    );
  });
});
