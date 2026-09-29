import { describe, expect, it } from "vitest";
import { DEFAULT_TZ, isValidTimeZone, resolveTimeZone } from "@/lib/timezone";

describe("isValidTimeZone", () => {
  it.each(["America/Mazatlan", "America/Mexico_City", "America/Tijuana", "UTC", "Asia/Calcutta"])(
    "acepta %s",
    (tz) => {
      expect(isValidTimeZone(tz)).toBe(true);
    },
  );

  it.each([
    ["vacía", ""],
    ["inexistente", "Foo/Bar"],
    ["con caracteres no IANA", "<script>"],
    ["con punto y coma", "America/Mazatlan;"],
    ["demasiado larga", "A".repeat(200)],
  ])("rechaza zona %s", (_label, tz) => {
    expect(isValidTimeZone(tz)).toBe(false);
  });

  it("rechaza valores que no son string", () => {
    expect(isValidTimeZone(undefined)).toBe(false);
    expect(isValidTimeZone(null)).toBe(false);
    expect(isValidTimeZone(42)).toBe(false);
  });
});

describe("resolveTimeZone", () => {
  it("usa America/Mazatlan como fallback", () => {
    expect(DEFAULT_TZ).toBe("America/Mazatlan");
  });

  it.each([undefined, null, "", "Foo/Bar", "%E0%A4%A"])("cae al fallback con %s", (raw) => {
    expect(resolveTimeZone(raw)).toBe("America/Mazatlan");
  });

  it("devuelve una zona válida tal cual", () => {
    expect(resolveTimeZone("America/Mexico_City")).toBe("America/Mexico_City");
  });

  it("decodifica un valor codificado por robustez", () => {
    expect(resolveTimeZone("America%2FMexico_City")).toBe("America/Mexico_City");
  });
});
