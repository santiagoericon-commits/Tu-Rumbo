import { describe, expect, it } from "vitest";
import {
  coveredStart,
  formatPeriodLabel,
  formatTimeList,
  groupUnmarkedDoses,
  summaryWindow,
  windowStartInstant,
  type DoseRowLite,
  type MedicationLite,
} from "@/lib/visit-summary";

const MZT = "America/Mazatlan";
const TIJUANA = "America/Tijuana";
const NOW = new Date("2026-11-05T17:00:00Z"); // 10:00 a.m. del jueves 5 de noviembre en Mazatlán

// Intl puede separar la hora de "a.m." con espacio normal, no separable o fino no separable.
const norm = (s: string) => s.replace(/[  ]/g, " ");

describe("summaryWindow", () => {
  it("sin cita anterior cubre los últimos 30 días, hoy incluido", () => {
    expect(summaryWindow("2026-11-05", null, MZT)).toEqual({ startDate: "2026-10-07", endDate: "2026-11-05" });
  });

  it("con cita anterior más reciente que 30 días empieza el día de esa cita", () => {
    // 10:00 a.m. local del 27 de octubre
    const previous = new Date("2026-10-27T17:00:00Z");
    expect(summaryWindow("2026-11-05", previous, MZT).startDate).toBe("2026-10-27");
  });

  it("con cita anterior de hace 60 días gana el tope de 30 días", () => {
    const previous = new Date("2026-09-06T17:00:00Z");
    expect(summaryWindow("2026-11-05", previous, MZT).startDate).toBe("2026-10-07");
  });

  it("usa el día local de la cita y no el día UTC (23:30 locales del 1 de noviembre)", () => {
    const previous = new Date("2026-11-02T06:30:00Z");
    expect(summaryWindow("2026-11-05", previous, MZT).startDate).toBe("2026-11-01");
  });

  it("con cita anterior hoy temprano, el periodo es solo hoy", () => {
    const previous = new Date("2026-11-05T14:00:00Z");
    const window = summaryWindow("2026-11-05", previous, MZT);
    expect(window.startDate).toBe("2026-11-05");
    expect(window.endDate).toBe("2026-11-05");
  });
});

describe("windowStartInstant", () => {
  it("es la medianoche local del primer día (Tijuana, día del cambio de horario)", () => {
    const instant = windowStartInstant({ startDate: "2026-11-01", endDate: "2026-11-05" }, TIJUANA);
    expect(instant.toISOString()).toBe("2026-11-01T07:00:00.000Z");
  });
});

describe("coveredStart", () => {
  const window = { startDate: "2026-10-07", endDate: "2026-11-05" };

  it("toma la fecha más temprana entre la primera dosis y el primer registro", () => {
    const firstDose = new Date("2026-10-20T15:00:00Z");
    expect(coveredStart(window, firstDose, "2026-10-22", MZT)).toBe("2026-10-20");
    expect(coveredStart(window, new Date("2026-10-25T15:00:00Z"), "2026-10-22", MZT)).toBe("2026-10-22");
  });

  it("sin datos devuelve null", () => {
    expect(coveredStart(window, null, null, MZT)).toBeNull();
  });

  it("solo con registro o solo con dosis", () => {
    expect(coveredStart(window, null, "2026-10-30", MZT)).toBe("2026-10-30");
    expect(coveredStart(window, new Date("2026-10-30T15:00:00Z"), null, MZT)).toBe("2026-10-30");
  });

  it("un dato anterior a la ventana se recorta al inicio de la ventana", () => {
    expect(coveredStart(window, null, "2026-09-01", MZT)).toBe("2026-10-07");
  });
});

describe("groupUnmarkedDoses", () => {
  const meds: MedicationLite[] = [
    { id: "m1", name: "Anastrozol", dosage: "1 mg" },
    { id: "m2", name: "Calcio", dosage: null },
  ];
  const dose = (medicationId: string, scheduledAt: string, status: DoseRowLite["status"] = "pending"): DoseRowLite => ({
    medicationId,
    scheduledAt,
    status,
  });

  it("excluye las tomadas e incluye pending y missed", () => {
    const result = groupUnmarkedDoses(
      [
        dose("m1", "2026-11-01T15:00:00Z", "taken"),
        dose("m1", "2026-11-02T15:00:00Z", "pending"),
        dose("m1", "2026-11-03T15:00:00Z", "missed"),
      ],
      meds,
      MZT,
      NOW,
    );
    expect(result).toHaveLength(1);
    expect(result[0].days.map((d) => d.date)).toEqual(["2026-11-02", "2026-11-03"]);
  });

  it("23:30 y 00:15 locales (mismo día UTC) caen en días locales distintos", () => {
    const result = groupUnmarkedDoses(
      [dose("m1", "2026-11-04T06:30:00Z"), dose("m1", "2026-11-04T07:15:00Z")],
      meds,
      MZT,
      NOW,
    );
    expect(result[0].days.map((d) => d.date)).toEqual(["2026-11-03", "2026-11-04"]);
  });

  it("varias dosis del mismo día local van juntas y en orden ascendente", () => {
    const result = groupUnmarkedDoses(
      [dose("m1", "2026-11-03T03:00:00Z"), dose("m1", "2026-11-02T15:00:00Z")],
      meds,
      MZT,
      NOW,
    );
    expect(result[0].days).toEqual([
      { date: "2026-11-02", instants: ["2026-11-02T15:00:00Z", "2026-11-03T03:00:00Z"] },
    ]);
  });

  it("no incluye dosis que aún no llegan (hoy 8:00 p.m. vista a las 10:00 a.m.)", () => {
    const result = groupUnmarkedDoses(
      [dose("m1", "2026-11-06T03:00:00Z"), dose("m1", NOW.toISOString())],
      meds,
      MZT,
      NOW,
    );
    expect(result).toEqual([]);
  });

  it("respeta el orden de los medicamentos y omite los sin dosis o desconocidos", () => {
    const result = groupUnmarkedDoses(
      [dose("m2", "2026-11-02T15:00:00Z"), dose("m1", "2026-11-02T15:00:00Z"), dose("desconocido", "2026-11-02T15:00:00Z")],
      meds,
      MZT,
      NOW,
    );
    expect(result.map((g) => g.id)).toEqual(["m1", "m2"]);
    expect(groupUnmarkedDoses([dose("m2", "2026-11-02T15:00:00Z")], meds, MZT, NOW).map((g) => g.id)).toEqual(["m2"]);
  });

  it("sin dosis devuelve una lista vacía", () => {
    expect(groupUnmarkedDoses([], meds, MZT, NOW)).toEqual([]);
  });

  it("la hora repetida de Tijuana (1:30 a.m. dos veces) queda en el mismo día local", () => {
    const result = groupUnmarkedDoses(
      [dose("m1", "2026-11-01T08:30:00Z"), dose("m1", "2026-11-01T09:30:00Z")],
      meds,
      TIJUANA,
      NOW,
    );
    expect(result[0].days.map((d) => d.date)).toEqual(["2026-11-01"]);
  });

  it("no recorta muchas filas: devuelve todas las dosis recibidas", () => {
    const doses: DoseRowLite[] = [];
    for (let i = 0; i < 1000; i += 1) {
      // 1000 instantes distintos, de 15 en 15 minutos desde el 12 de octubre
      doses.push(dose("m1", new Date(Date.UTC(2026, 9, 12, 0, i * 15)).toISOString()));
    }
    const result = groupUnmarkedDoses(doses, meds, MZT, NOW);
    const total = result[0].days.reduce((sum, d) => sum + d.instants.length, 0);
    expect(total).toBe(1000);
  });
});

describe("formatPeriodLabel", () => {
  it("rango dentro del mismo año", () => {
    expect(formatPeriodLabel("2026-10-20", "2026-11-05")).toBe("Del 20 de octubre al 5 de noviembre de 2026");
  });

  it("mismo día", () => {
    expect(formatPeriodLabel("2026-11-05", "2026-11-05")).toBe("5 de noviembre de 2026");
  });

  it("cruce de año lleva el año en los dos extremos", () => {
    expect(formatPeriodLabel("2026-12-15", "2027-01-05")).toBe(
      "Del 15 de diciembre de 2026 al 5 de enero de 2027",
    );
  });
});

describe("formatTimeList", () => {
  it("dos horas unidas con «y»", () => {
    expect(norm(formatTimeList(["2026-11-05T15:00:00Z", "2026-11-06T03:00:00Z"], MZT))).toBe(
      "8:00 a.m. y 8:00 p.m.",
    );
  });

  it("una sola hora", () => {
    expect(norm(formatTimeList(["2026-11-05T15:00:00Z"], MZT))).toBe("8:00 a.m.");
  });
});
