import { describe, expect, it } from "vitest";
import { isUuid } from "@/lib/ids";

const ID = "3f1c2b7e-9a4d-4c6e-8b1a-2d3e4f5a6b7c";

describe("isUuid", () => {
  it("acepta un UUID en minúsculas o mayúsculas", () => {
    expect(isUuid(ID)).toBe(true);
    expect(isUuid(ID.toUpperCase())).toBe(true);
  });

  it.each([
    ["no UUID", "abc"],
    ["con espacios", ` ${ID} `],
    ["con inyección", `${ID}' or 1=1`],
    ["vacío", ""],
    ["undefined", undefined],
    ["número", 1],
  ])("rechaza %s", (_label, value) => {
    expect(isUuid(value)).toBe(false);
  });
});
