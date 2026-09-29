import { describe, expect, it } from "vitest";
import { formatDoseSummary } from "@/lib/dose-summary";

describe("formatDoseSummary", () => {
  it("sin marcadas y una dosis: singular", () => {
    expect(formatDoseSummary(0, 1)).toBe("Tienes 1 dosis programada para hoy.");
  });

  it("sin marcadas y varias dosis: plural", () => {
    expect(formatDoseSummary(0, 3)).toBe("Tienes 3 dosis programadas para hoy.");
  });

  it("1 de 1", () => {
    expect(formatDoseSummary(1, 1)).toBe("Marcaste 1 de 1 dosis de hoy.");
  });

  it("2 de 3", () => {
    expect(formatDoseSummary(2, 3)).toBe("Marcaste 2 de 3 dosis de hoy.");
  });

  it("3 de 3", () => {
    expect(formatDoseSummary(3, 3)).toBe("Marcaste 3 de 3 dosis de hoy.");
  });
});
