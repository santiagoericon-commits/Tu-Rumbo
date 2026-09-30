import { describe, expect, it } from "vitest";

// Si este test falla, los demás tests de tiempo no prueban lo que creen probar:
// vitest.config.ts debe fijar process.env.TZ = "UTC".
describe("zona horaria de los tests", () => {
  it("el proceso corre en UTC", () => {
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe("UTC");
    expect(new Date(2026, 0, 1).getTimezoneOffset()).toBe(0);
    expect(new Date(2026, 6, 1).getTimezoneOffset()).toBe(0);
  });
});
