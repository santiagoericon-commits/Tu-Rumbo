import { describe, expect, it } from "vitest";
import { parseDoseUpdate } from "@/lib/dose-status";

const ID = "3f1c2b7e-9a4d-4c6e-8b1a-2d3e4f5a6b7c";

describe("parseDoseUpdate", () => {
  it.each(["taken", "pending"] as const)("acepta un UUID con estado %s", (status) => {
    expect(parseDoseUpdate(ID, status)).toEqual({ id: ID, status });
  });

  it.each([
    ["missed (la app nunca lo asigna)", "missed"],
    ["en mayúsculas", "TAKEN"],
    ["vacío", ""],
    ["undefined", undefined],
    ["número", 1],
  ])("rechaza el estado %s", (_label, status) => {
    expect(parseDoseUpdate(ID, status)).toBeNull();
  });

  it.each([
    ["no UUID", "abc"],
    ["con espacios", ` ${ID} `],
    ["con inyección", `${ID}' or 1=1`],
    ["vacío", ""],
    ["undefined", undefined],
  ])("rechaza un id %s", (_label, id) => {
    expect(parseDoseUpdate(id, "taken")).toBeNull();
  });
});
