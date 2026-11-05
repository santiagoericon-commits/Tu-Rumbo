import { describe, expect, it } from "vitest";
import { formatDoseSummary } from "@/lib/dose-summary";

describe("formatDoseSummary", () => {
  it("una dosis: singular", () => {
    expect(formatDoseSummary(1)).toBe("Tienes 1 dosis programada para hoy.");
  });

  it("varias dosis: plural", () => {
    expect(formatDoseSummary(3)).toBe("Tienes 3 dosis programadas para hoy.");
  });
});
