import { describe, expect, it } from "vitest";
import { generateDoseInstants, SCHEDULE_WINDOW_DAYS } from "@/lib/dose-schedule";

const MZT = "America/Mazatlan";
const CDMX = "America/Mexico_City";
const TIJ = "America/Tijuana";

const at = (iso: string) => new Date(iso);
const iso = (dates: Date[]) => dates.map((date) => date.toISOString());
const isSorted = (dates: Date[]) =>
  dates.every((date, i) => i === 0 || dates[i - 1].getTime() < date.getTime());

describe("generateDoseInstants", () => {
  it("la ventana es de 14 días", () => {
    expect(SCHEDULE_WINDOW_DAYS).toBe(14);
  });

  it("Mazatlán: un horario diario desde una fecha futura genera 14 dosis a las 15:00Z", () => {
    const doses = generateDoseInstants({
      times: ["08:00"],
      startDate: "2026-10-05",
      tz: MZT,
      now: at("2026-09-29T20:00:00Z"),
    });
    expect(doses).toHaveLength(14);
    expect(iso(doses)[0]).toBe("2026-10-05T15:00:00.000Z");
    expect(iso(doses)[13]).toBe("2026-10-18T15:00:00.000Z");
  });

  it("Ciudad de México: la misma hora de pared genera otro instante", () => {
    const doses = generateDoseInstants({
      times: ["08:00"],
      startDate: "2026-10-05",
      tz: CDMX,
      now: at("2026-09-29T20:00:00Z"),
    });
    expect(iso(doses)[0]).toBe("2026-10-05T14:00:00.000Z");
  });

  it("alta a las 4 p.m. con horario de 8:00 a.m.: la dosis de hoy no se crea", () => {
    const doses = generateDoseInstants({
      times: ["08:00"],
      startDate: "2026-09-29",
      tz: MZT,
      now: at("2026-09-29T22:00:00Z"), // 16:00 en Mazatlán
    });
    expect(doses).toHaveLength(13);
    expect(iso(doses)[0]).toBe("2026-09-30T15:00:00.000Z");
  });

  it("alta a la 1 p.m. con horario de 8:00 p.m.: la dosis de hoy sí se crea", () => {
    const doses = generateDoseInstants({
      times: ["20:00"],
      startDate: "2026-09-29",
      tz: MZT,
      now: at("2026-09-29T20:00:00Z"), // 13:00 en Mazatlán
    });
    expect(doses).toHaveLength(14);
    expect(iso(doses)[0]).toBe("2026-09-30T03:00:00.000Z");
  });

  it("una dosis programada exactamente a la hora actual se conserva", () => {
    const doses = generateDoseInstants({
      times: ["08:00"],
      startDate: "2026-09-29",
      tz: MZT,
      now: at("2026-09-29T15:00:00Z"),
    });
    expect(doses).toHaveLength(14);
    expect(iso(doses)[0]).toBe("2026-09-29T15:00:00.000Z");
  });

  it("23:30 y 00:15: cada dosis cae en su día local y el resultado va en orden", () => {
    const doses = generateDoseInstants({
      times: ["23:30", "00:15"],
      startDate: "2026-09-29",
      tz: MZT,
      now: at("2026-09-28T20:00:00Z"),
    });
    expect(doses).toHaveLength(28);
    expect(iso(doses)[0]).toBe("2026-09-29T07:15:00.000Z"); // 00:15 del 29
    expect(iso(doses)[1]).toBe("2026-09-30T06:30:00.000Z"); // 23:30 del 29
    expect(isSorted(doses)).toBe(true);
  });

  it("horarios repetidos se ignoran y se ordenan", () => {
    const doses = generateDoseInstants({
      times: ["20:00", "08:00", "08:00"],
      startDate: "2026-09-29",
      tz: MZT,
      now: at("2026-09-28T20:00:00Z"),
    });
    expect(doses).toHaveLength(28);
    expect(iso(doses)[0]).toBe("2026-09-29T15:00:00.000Z");
    expect(iso(doses)[1]).toBe("2026-09-30T03:00:00.000Z");
  });

  it("la ventana cruza fin de mes", () => {
    const doses = generateDoseInstants({
      times: ["08:00"],
      startDate: "2026-09-25",
      tz: MZT,
      now: at("2026-09-24T20:00:00Z"),
    });
    expect(doses).toHaveLength(14);
    expect(iso(doses)[13]).toBe("2026-10-08T15:00:00.000Z");
  });

  it("Tijuana, 8 de marzo de 2026 a las 02:30 (hora inexistente): se recorre a las 03:30", () => {
    const doses = generateDoseInstants({
      times: ["02:30"],
      startDate: "2026-03-08",
      tz: TIJ,
      now: at("2026-03-07T20:00:00Z"),
    });
    expect(doses).toHaveLength(14);
    expect(iso(doses)[0]).toBe("2026-03-08T10:30:00.000Z"); // 03:30 PDT
    expect(iso(doses)[1]).toBe("2026-03-09T09:30:00.000Z"); // 02:30 PDT
  });

  it("Tijuana, 1 de noviembre de 2026 a la 01:30 (hora repetida): una sola dosis ese día", () => {
    const doses = generateDoseInstants({
      times: ["01:30"],
      startDate: "2026-11-01",
      tz: TIJ,
      now: at("2026-10-31T20:00:00Z"),
    });
    expect(doses).toHaveLength(14);
    const dayStart = at("2026-11-01T07:00:00Z");
    const dayEnd = at("2026-11-02T08:00:00Z"); // día de 25 horas
    const thatDay = doses.filter((dose) => dose >= dayStart && dose < dayEnd);
    expect(iso(thatDay)).toEqual(["2026-11-01T08:30:00.000Z"]); // 01:30 PDT
    expect(iso(doses)[1]).toBe("2026-11-02T09:30:00.000Z"); // 01:30 PST
  });

  it("acepta una ventana distinta", () => {
    const doses = generateDoseInstants({
      times: ["08:00"],
      startDate: "2026-10-05",
      tz: MZT,
      now: at("2026-09-29T20:00:00Z"),
      days: 3,
    });
    expect(doses).toHaveLength(3);
  });

  it("con una zona inválida cae a America/Mazatlan", () => {
    const input = { times: ["08:00"], startDate: "2026-10-05", now: at("2026-09-29T20:00:00Z") };
    expect(iso(generateDoseInstants({ ...input, tz: "Foo/Bar" }))).toEqual(
      iso(generateDoseInstants({ ...input, tz: MZT })),
    );
  });
});
