import { describe, expect, it } from "vitest";
import { planDoseTopUp, type TopUpMedication } from "@/lib/dose-topup";

const MZT = "America/Mazatlan"; // UTC-7 todo el año
const CDMX = "America/Mexico_City"; // UTC-6 todo el año
const TIJ = "America/Tijuana"; // PDT -7 / PST -8

const at = (iso: string) => new Date(iso);
// 4 nov 2026, 10:00 en Mazatlán. Inicio del día local: 07:00Z.
const NOW = at("2026-11-04T17:00:00Z");
const DAY_START_MZT = at("2026-11-04T07:00:00Z");

const med = (overrides: Partial<TopUpMedication> = {}): TopUpMedication => ({
  id: "med-1",
  times: ["08:00"],
  startDate: "2026-09-25",
  createdAt: at("2026-09-25T00:00:00Z"),
  ...overrides,
});

const isoOf = (rows: { scheduledAt: Date }[]) => rows.map((row) => row.scheduledAt.toISOString());

describe("planDoseTopUp", () => {
  it("start_date hace 40 días: 14 días desde hoy, incluida la dosis de hoy que ya pasó", () => {
    const rows = planDoseTopUp({ medications: [med()], existing: [], tz: MZT, now: NOW });
    expect(rows).toHaveLength(14);
    expect(isoOf(rows)[0]).toBe("2026-11-04T15:00:00.000Z"); // 8:00 de hoy, aunque son las 10:00
    expect(isoOf(rows)[13]).toBe("2026-11-17T15:00:00.000Z");
    expect(rows.every((row) => row.medicationId === "med-1")).toBe(true);
  });

  it("start_date en el futuro: no rellena (la alta ya creó su ventana)", () => {
    const rows = planDoseTopUp({
      medications: [med({ startDate: "2026-11-10", createdAt: at("2026-11-03T00:00:00Z") })],
      existing: [],
      tz: MZT,
      now: NOW,
    });
    expect(rows).toEqual([]);
  });

  it("23:30 y 00:15: cada dosis cae en su día local y van en orden", () => {
    const rows = planDoseTopUp({
      medications: [med({ times: ["23:30", "00:15"] })],
      existing: [],
      tz: MZT,
      now: NOW,
    });
    const iso = isoOf(rows);
    expect(rows).toHaveLength(28);
    expect(iso[0]).toBe("2026-11-04T07:15:00.000Z"); // 00:15 del 4
    expect(iso[1]).toBe("2026-11-05T06:30:00.000Z"); // 23:30 del 4
    expect(iso[27]).toBe("2026-11-18T06:30:00.000Z"); // 23:30 del 17
    expect([...iso].sort()).toEqual(iso);
  });

  it("4 horarios al día: 56 dosis", () => {
    const rows = planDoseTopUp({
      medications: [med({ times: ["06:00", "12:00", "18:00", "22:00"] })],
      existing: [],
      tz: MZT,
      now: NOW,
    });
    expect(rows).toHaveLength(56);
  });

  it("nunca genera dosis de ayer", () => {
    const rows = planDoseTopUp({
      medications: [med({ times: ["00:00", "06:00", "12:00", "23:59"] })],
      existing: [],
      tz: MZT,
      now: NOW,
    });
    expect(rows.every((row) => row.scheduledAt.getTime() >= DAY_START_MZT.getTime())).toBe(true);
    expect(isoOf(rows)[0]).toBe("2026-11-04T07:00:00.000Z"); // 00:00 de hoy
  });

  it("Ciudad de México: la misma hora de pared es otro instante", () => {
    const rows = planDoseTopUp({ medications: [med()], existing: [], tz: CDMX, now: NOW });
    expect(rows).toHaveLength(14);
    expect(isoOf(rows)[0]).toBe("2026-11-04T14:00:00.000Z");
  });

  it("Tijuana: la ventana cruza el fin del horario de verano (1 nov, 01:30 repetida)", () => {
    const rows = planDoseTopUp({
      medications: [med({ times: ["01:30"] })],
      existing: [],
      tz: TIJ,
      now: at("2026-10-30T18:00:00Z"), // 11:00 PDT del 30 oct
    });
    expect(rows).toHaveLength(14);
    expect(isoOf(rows).slice(0, 4)).toEqual([
      "2026-10-30T08:30:00.000Z", // PDT
      "2026-10-31T08:30:00.000Z", // PDT
      "2026-11-01T08:30:00.000Z", // primera ocurrencia (PDT)
      "2026-11-02T09:30:00.000Z", // PST
    ]);
  });

  it("alta de hoy después de la hora de la toma: la dosis de hoy no se crea", () => {
    const rows = planDoseTopUp({
      medications: [med({ startDate: "2026-11-04", createdAt: at("2026-11-04T16:00:00Z") })], // 9:00
      existing: [],
      tz: MZT,
      now: NOW,
    });
    expect(rows).toHaveLength(13);
    expect(isoOf(rows)[0]).toBe("2026-11-05T15:00:00.000Z");
  });

  it("los días locales que ya tienen alguna dosis del medicamento se omiten", () => {
    const existing = ["04", "05", "06", "07", "08", "09", "10"].map((day) => ({
      medicationId: "med-1",
      scheduledAt: at(`2026-11-${day}T15:00:00Z`),
    }));
    const rows = planDoseTopUp({ medications: [med()], existing, tz: MZT, now: NOW });
    expect(rows).toHaveLength(7);
    expect(isoOf(rows)[0]).toBe("2026-11-11T15:00:00.000Z");
  });

  it("las dosis de otro medicamento no cuentan como día cubierto", () => {
    const existing = [{ medicationId: "med-2", scheduledAt: at("2026-11-04T15:00:00Z") }];
    const rows = planDoseTopUp({ medications: [med()], existing, tz: MZT, now: NOW });
    expect(rows).toHaveLength(14);
  });

  it("dosis guardadas en hora de Mazatlán y zona actual CDMX: no duplica con otra hora", () => {
    const savedInMzt = planDoseTopUp({ medications: [med()], existing: [], tz: MZT, now: NOW });
    expect(savedInMzt).toHaveLength(14);
    const rows = planDoseTopUp({ medications: [med()], existing: savedInMzt, tz: CDMX, now: NOW });
    expect(rows).toEqual([]);
  });

  it("varios medicamentos: cada fila lleva su medicamento", () => {
    const rows = planDoseTopUp({
      medications: [med(), med({ id: "med-2", times: ["20:00"] })],
      existing: [],
      tz: MZT,
      now: NOW,
    });
    expect(rows.filter((row) => row.medicationId === "med-1")).toHaveLength(14);
    expect(rows.filter((row) => row.medicationId === "med-2")).toHaveLength(14);
  });

  it("llamar dos veces da los mismos instantes; con lo ya insertado no hay nada que agregar", () => {
    const input = { medications: [med({ times: ["08:00", "20:00"] })], tz: MZT, now: NOW };
    const first = planDoseTopUp({ ...input, existing: [] });
    const second = planDoseTopUp({ ...input, existing: [] });
    expect(first).toHaveLength(28);
    expect(isoOf(second)).toEqual(isoOf(first));
    expect(planDoseTopUp({ ...input, existing: first })).toEqual([]);
  });
});
