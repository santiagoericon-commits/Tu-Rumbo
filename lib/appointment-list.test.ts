import { describe, expect, it } from "vitest";
import { partitionAppointments } from "@/lib/appointment-list";

const NOW = new Date("2026-09-30T05:30:00Z"); // martes 29, 10:30 p.m. en Mazatlán

const item = (id: string, scheduledAt: string) => ({ id, scheduledAt });

describe("partitionAppointments", () => {
  it("separa próximas y anteriores respecto al instante actual", () => {
    const { upcoming, past } = partitionAppointments(
      [item("a", "2026-09-29T15:00:00Z"), item("b", "2026-10-01T06:30:00Z")],
      NOW,
    );
    expect(upcoming.map((a) => a.id)).toEqual(["b"]);
    expect(past.map((a) => a.id)).toEqual(["a"]);
  });

  it("una cita en el instante exacto actual todavía es próxima", () => {
    const { upcoming, past } = partitionAppointments([item("a", NOW.toISOString())], NOW);
    expect(upcoming).toHaveLength(1);
    expect(past).toHaveLength(0);
  });

  it("próximas en orden ascendente y anteriores de la más reciente a la más antigua", () => {
    const { upcoming, past } = partitionAppointments(
      [
        item("futura-lejana", "2027-01-15T17:00:00Z"),
        item("pasada-antigua", "2026-09-01T17:00:00Z"),
        item("futura-cercana", "2026-10-01T17:00:00Z"),
        item("pasada-reciente", "2026-09-29T17:00:00Z"),
      ],
      NOW,
    );
    expect(upcoming.map((a) => a.id)).toEqual(["futura-cercana", "futura-lejana"]);
    expect(past.map((a) => a.id)).toEqual(["pasada-reciente", "pasada-antigua"]);
  });

  it("sin citas devuelve dos listas vacías", () => {
    expect(partitionAppointments([], NOW)).toEqual({ upcoming: [], past: [] });
  });

  it("conserva los demás campos de cada cita", () => {
    const { upcoming } = partitionAppointments(
      [{ id: "a", scheduledAt: "2026-10-01T17:00:00Z", title: "Estudio de control" }],
      NOW,
    );
    expect(upcoming[0]).toEqual({ id: "a", scheduledAt: "2026-10-01T17:00:00Z", title: "Estudio de control" });
  });
});
