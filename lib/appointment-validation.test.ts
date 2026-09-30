import { describe, expect, it } from "vitest";
import { parseAppointmentForm } from "@/lib/appointment-validation";
import { addDaysIso } from "@/lib/local-time";

const TODAY = "2026-09-29";

type Entries = Record<string, string | Blob>;

function form(entries: Entries): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) data.append(key, value);
  return data;
}

const valid: Entries = {
  title: "Estudio de control",
  date: "2026-10-06",
  time: "10:30",
  notes: "Llevar estudios anteriores",
};

const without = (key: string): Entries =>
  Object.fromEntries(Object.entries(valid).filter(([name]) => name !== key));

describe("parseAppointmentForm", () => {
  it("acepta un formulario válido", () => {
    expect(parseAppointmentForm(form(valid), TODAY)).toEqual({
      title: "Estudio de control",
      date: "2026-10-06",
      time: "10:30",
      notes: "Llevar estudios anteriores",
    });
  });

  it("recorta el título y deja las notas en null si vienen vacías o faltan", () => {
    expect(parseAppointmentForm(form({ ...valid, title: "  Cita  ", notes: "  " }), TODAY)).toMatchObject({
      title: "Cita",
      notes: null,
    });
    expect(parseAppointmentForm(form(without("notes")), TODAY)?.notes).toBeNull();
  });

  it("título: acepta 80 caracteres y rechaza 81, vacío o solo espacios", () => {
    expect(parseAppointmentForm(form({ ...valid, title: "a".repeat(80) }), TODAY)).not.toBeNull();
    expect(parseAppointmentForm(form({ ...valid, title: "a".repeat(81) }), TODAY)).toBeNull();
    expect(parseAppointmentForm(form({ ...valid, title: "" }), TODAY)).toBeNull();
    expect(parseAppointmentForm(form({ ...valid, title: "   " }), TODAY)).toBeNull();
  });

  it("notas: acepta 300 caracteres y rechaza 301", () => {
    expect(parseAppointmentForm(form({ ...valid, notes: "a".repeat(300) }), TODAY)).not.toBeNull();
    expect(parseAppointmentForm(form({ ...valid, notes: "a".repeat(301) }), TODAY)).toBeNull();
  });

  it("notas: cada salto de línea CRLF cuenta como un carácter", () => {
    const notes = `${"a".repeat(149)}\r\n${"b".repeat(150)}`; // 301 enviados, 300 escritos
    expect(parseAppointmentForm(form({ ...valid, notes }), TODAY)?.notes).toHaveLength(300);
  });

  it("fecha: acepta hoy y hoy + 730 días", () => {
    expect(parseAppointmentForm(form({ ...valid, date: TODAY }), TODAY)).not.toBeNull();
    expect(parseAppointmentForm(form({ ...valid, date: addDaysIso(TODAY, 730) }), TODAY)).not.toBeNull();
  });

  it.each([
    ["ayer", "2026-09-28"],
    ["hoy + 731 días", addDaysIso(TODAY, 731)],
    ["un día que no existe", "2026-02-30"],
    ["otro formato", "06/10/2026"],
    ["vacía", ""],
  ])("fecha: rechaza %s", (_label, date) => {
    expect(parseAppointmentForm(form({ ...valid, date }), TODAY)).toBeNull();
  });

  it.each(["00:00", "00:15", "23:30", "23:59"])("hora: acepta %s", (time) => {
    expect(parseAppointmentForm(form({ ...valid, time }), TODAY)?.time).toBe(time);
  });

  it.each([
    ["hora 24", "24:00"],
    ["sin cero inicial", "8:00"],
    ["minuto 60", "08:60"],
    ["con segundos", "08:00:00"],
    ["vacía", ""],
  ])("hora: rechaza %s", (_label, time) => {
    expect(parseAppointmentForm(form({ ...valid, time }), TODAY)).toBeNull();
  });

  it("FormData manipulada: falta un campo obligatorio", () => {
    expect(parseAppointmentForm(form(without("time")), TODAY)).toBeNull();
  });

  it("FormData manipulada: un archivo en lugar de texto", () => {
    const file = new Blob(["x"], { type: "text/plain" });
    expect(parseAppointmentForm(form({ ...valid, title: file }), TODAY)).toBeNull();
    expect(parseAppointmentForm(form({ ...valid, notes: file }), TODAY)).toBeNull();
  });
});
