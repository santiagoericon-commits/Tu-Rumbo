import { describe, expect, it } from "vitest";
import { formatCalendarDate, formatScheduleTimes, formatStartDate } from "@/lib/schedule-format";

// Intl puede separar la hora de "a.m." con espacio normal, no separable o fino
// no separable según la versión de ICU.
const SEPARATORS = /[   ]/g;
const norm = (s: string) => s.replace(SEPARATORS, " ");

describe("formatScheduleTimes", () => {
  it("un horario", () => {
    expect(norm(formatScheduleTimes(["08:00"]))).toBe("8:00 a.m.");
  });

  it("dos horarios unidos con «y»", () => {
    expect(norm(formatScheduleTimes(["08:00", "20:00"]))).toBe("8:00 a.m. y 8:00 p.m.");
  });

  it("tres horarios con coma y «y»", () => {
    expect(norm(formatScheduleTimes(["08:00", "14:00", "20:00"]))).toBe(
      "8:00 a.m., 2:00 p.m. y 8:00 p.m.",
    );
  });

  it("acepta la hora con segundos como la devuelve Postgres", () => {
    expect(norm(formatScheduleTimes(["08:00:00", "20:30:00"]))).toBe("8:00 a.m. y 8:30 p.m.");
  });

  it("medianoche y final del día en 12 horas", () => {
    expect(norm(formatScheduleTimes(["00:15", "23:30"]))).toBe("12:15 a.m. y 11:30 p.m.");
  });
});

describe("formatStartDate", () => {
  it("día de la semana, día y mes", () => {
    expect(formatStartDate("2026-09-29")).toBe("Desde el martes, 29 de septiembre");
  });

  it("no depende de la zona del servidor", () => {
    expect(formatStartDate("2027-01-01")).toBe("Desde el viernes, 1 de enero");
  });
});

describe("formatCalendarDate", () => {
  it("día de la semana, día y mes de una fecha de calendario", () => {
    expect(formatCalendarDate("2026-09-29")).toBe("martes, 29 de septiembre");
  });

  it("no depende de la zona del servidor ni se recorre al día anterior", () => {
    expect(formatCalendarDate("2026-10-01")).toBe("jueves, 1 de octubre");
  });
});
