import { describe, expect, it } from "vitest";
import { parseMedicationForm } from "@/lib/medication-validation";

const TODAY = "2026-09-29";

type Entries = Record<string, string | string[] | Blob>;

function form(entries: Entries): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    if (Array.isArray(value)) value.forEach((item) => data.append(key, item));
    else data.append(key, value);
  }
  return data;
}

const valid: Entries = { name: "Medicamento", dosage: "20 mg", times: ["08:00"], startDate: TODAY };

describe("parseMedicationForm", () => {
  it("acepta un formulario válido y normaliza los campos", () => {
    expect(parseMedicationForm(form(valid), TODAY)).toEqual({
      name: "Medicamento",
      dosage: "20 mg",
      times: ["08:00"],
      startDate: TODAY,
    });
  });

  it("recorta espacios y deja la dosis en null si viene vacía", () => {
    const parsed = parseMedicationForm(form({ ...valid, name: "  A  ", dosage: "   " }), TODAY);
    expect(parsed).toMatchObject({ name: "A", dosage: null });
  });

  it("la dosis es opcional", () => {
    const parsed = parseMedicationForm(form({ name: "A", times: ["08:00"], startDate: TODAY }), TODAY);
    expect(parsed).toMatchObject({ dosage: null });
  });

  it("nombre: acepta 80 caracteres y rechaza 81 o solo espacios", () => {
    expect(parseMedicationForm(form({ ...valid, name: "a".repeat(80) }), TODAY)).not.toBeNull();
    expect(parseMedicationForm(form({ ...valid, name: "a".repeat(81) }), TODAY)).toBeNull();
    expect(parseMedicationForm(form({ ...valid, name: "   " }), TODAY)).toBeNull();
  });

  it("dosis: acepta 60 caracteres y rechaza 61", () => {
    expect(parseMedicationForm(form({ ...valid, dosage: "a".repeat(60) }), TODAY)).not.toBeNull();
    expect(parseMedicationForm(form({ ...valid, dosage: "a".repeat(61) }), TODAY)).toBeNull();
  });

  it("horarios: ignora los vacíos, quita repetidos y ordena", () => {
    const parsed = parseMedicationForm(
      form({ ...valid, times: ["20:00", "", "08:00", "08:00"] }),
      TODAY,
    );
    expect(parsed?.times).toEqual(["08:00", "20:00"]);
  });

  it("horarios: acepta 4 distintos", () => {
    const parsed = parseMedicationForm(
      form({ ...valid, times: ["06:00", "12:00", "18:00", "23:30"] }),
      TODAY,
    );
    expect(parsed?.times).toHaveLength(4);
  });

  it.each([
    ["ninguno", []],
    ["solo vacíos", ["", ""]],
    ["cinco distintos", ["01:00", "02:00", "03:00", "04:00", "05:00"]],
    ["cinco entradas aunque se repitan", ["08:00", "08:00", "08:00", "08:00", "08:00"]],
    ["sin cero inicial", ["8:00"]],
    ["hora 24", ["24:00"]],
    ["minuto 60", ["08:60"]],
    ["con segundos", ["08:00:00"]],
    ["texto", ["mañana"]],
  ])("horarios: rechaza %s", (_label, times) => {
    expect(parseMedicationForm(form({ ...valid, times }), TODAY)).toBeNull();
  });

  it("fecha de inicio: acepta hoy y hoy + 365 días", () => {
    expect(parseMedicationForm(form({ ...valid, startDate: TODAY }), TODAY)).not.toBeNull();
    expect(parseMedicationForm(form({ ...valid, startDate: "2027-09-29" }), TODAY)).not.toBeNull();
  });

  it.each([
    ["ayer", "2026-09-28"],
    ["hoy + 366 días", "2027-09-30"],
    ["un día que no existe", "2026-02-30"],
    ["otro formato", "29/09/2026"],
    ["vacía", ""],
  ])("fecha de inicio: rechaza %s", (_label, startDate) => {
    expect(parseMedicationForm(form({ ...valid, startDate }), TODAY)).toBeNull();
  });

  it("FormData manipulada: falta un campo", () => {
    expect(parseMedicationForm(form({ name: "A", times: ["08:00"] }), TODAY)).toBeNull();
  });

  it("FormData manipulada: un archivo en lugar de texto", () => {
    const file = new Blob(["x"], { type: "text/plain" });
    expect(parseMedicationForm(form({ ...valid, name: file }), TODAY)).toBeNull();
    expect(parseMedicationForm(form({ ...valid, times: file }), TODAY)).toBeNull();
  });
});
