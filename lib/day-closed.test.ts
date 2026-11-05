import { describe, expect, it } from "vitest";
import { isDayClosed } from "@/lib/day-closed";

describe("isDayClosed", () => {
  it("sin dosis hoy: el día no se cierra", () => {
    expect(isDayClosed([])).toBe(false);
  });

  it("una sola dosis tomada: cerrado", () => {
    expect(isDayClosed(["taken"])).toBe(true);
  });

  it("todas tomadas: cerrado", () => {
    expect(isDayClosed(["taken", "taken", "taken"])).toBe(true);
  });

  it("una pendiente: abierto", () => {
    expect(isDayClosed(["taken", "pending", "taken"])).toBe(false);
  });

  it("una missed cuenta como abierta (se muestra como pendiente)", () => {
    expect(isDayClosed(["taken", "missed"])).toBe(false);
  });

  it("todas pendientes: abierto", () => {
    expect(isDayClosed(["pending", "pending"])).toBe(false);
  });
});
