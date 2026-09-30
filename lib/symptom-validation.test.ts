import { describe, expect, it } from "vitest";
import { parseSymptomForm } from "@/lib/symptom-validation";

type Entries = Record<string, string | Blob>;

function form(entries: Entries): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) data.append(key, value);
  return data;
}

describe("parseSymptomForm", () => {
  it.each(["1", "2", "3", "4", "5"])("acepta el valor %s", (level) => {
    expect(parseSymptomForm(form({ level, notes: "" }))).toEqual({
      level: Number(level),
      notes: null,
    });
  });

  it.each([
    ["cero", "0"],
    ["seis", "6"],
    ["decimal", "2.5"],
    ["con espacio", "3 "],
    ["con cero inicial", "03"],
    ["texto", "mucho"],
    ["vacío", ""],
  ])("rechaza el valor %s", (_label, level) => {
    expect(parseSymptomForm(form({ level, notes: "" }))).toBeNull();
  });

  it("las notas son opcionales: sin campo quedan en null", () => {
    expect(parseSymptomForm(form({ level: "3" }))).toEqual({ level: 3, notes: null });
  });

  it("recorta las notas y deja null si solo hay espacios", () => {
    expect(parseSymptomForm(form({ level: "2", notes: "  hola  " }))?.notes).toBe("hola");
    expect(parseSymptomForm(form({ level: "2", notes: " \r\n " }))?.notes).toBeNull();
  });

  it("notas: acepta 500 caracteres y rechaza 501", () => {
    expect(parseSymptomForm(form({ level: "1", notes: "a".repeat(500) }))).not.toBeNull();
    expect(parseSymptomForm(form({ level: "1", notes: "a".repeat(501) }))).toBeNull();
  });

  it("notas: cada salto de línea CRLF cuenta como un carácter", () => {
    const notes = `${"a".repeat(249)}\r\n${"b".repeat(250)}`; // 501 enviados, 500 escritos
    expect(parseSymptomForm(form({ level: "4", notes }))?.notes).toBe(
      `${"a".repeat(249)}\n${"b".repeat(250)}`,
    );
  });

  it("FormData manipulada: falta el valor", () => {
    expect(parseSymptomForm(form({ notes: "hola" }))).toBeNull();
  });

  it("FormData manipulada: un archivo en lugar de texto", () => {
    const file = new Blob(["x"], { type: "text/plain" });
    expect(parseSymptomForm(form({ level: file }))).toBeNull();
    expect(parseSymptomForm(form({ level: "3", notes: file }))).toBeNull();
  });
});
