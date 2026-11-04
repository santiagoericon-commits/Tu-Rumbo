import { describe, expect, it } from "vitest";
import {
  buildSupportLink,
  buildSupportMessage,
  isSupportOption,
  normalizeWhatsAppNumber,
  SUPPORT_OPTIONS,
} from "@/lib/support-link";

describe("normalizeWhatsAppNumber", () => {
  it("10 dígitos (número de México sin país): antepone 52", () => {
    expect(normalizeWhatsAppNumber("6670000000")).toBe("526670000000");
  });

  it("con prefijo de país (11 a 15 dígitos): se queda igual", () => {
    expect(normalizeWhatsAppNumber("526670000000")).toBe("526670000000");
    expect(normalizeWhatsAppNumber("12025550123")).toBe("12025550123");
    expect(normalizeWhatsAppNumber("123456789012345")).toBe("123456789012345");
  });

  it("vacío, corto, largo o con signos: null (el botón se oculta)", () => {
    for (const raw of [undefined, "", "   ", "123456789", "1234567890123456", "+526670000000", "667 000 0000", "667-000-0000"]) {
      expect(normalizeWhatsAppNumber(raw)).toBeNull();
    }
  });

  it("recorta espacios alrededor", () => {
    expect(normalizeWhatsAppNumber(" 6670000000 ")).toBe("526670000000");
  });
});

describe("buildSupportMessage", () => {
  it("frase fija por opción, sin datos de salud", () => {
    expect(buildSupportMessage("traslado")).toBe(
      "Hola, uso Rumbo y quisiera información sobre apoyo para traslado a mis citas.",
    );
    expect(buildSupportMessage("medicamento")).toBe(
      "Hola, uso Rumbo y quisiera información sobre apoyo para mi medicamento.",
    );
    expect(buildSupportMessage("estudios")).toBe("Hola, uso Rumbo y quisiera información sobre apoyo para estudios.");
    expect(buildSupportMessage("hablar")).toBe(
      "Hola, uso Rumbo y quisiera información sobre apoyo para hablar con alguien.",
    );
  });

  it("hay exactamente 4 opciones", () => {
    expect(SUPPORT_OPTIONS.map((option) => option.key)).toEqual(["traslado", "medicamento", "estudios", "hablar"]);
  });

  it("isSupportOption solo acepta las 4 claves", () => {
    expect(isSupportOption("medicamento")).toBe(true);
    expect(isSupportOption("constructor")).toBe(false);
    expect(isSupportOption("otro")).toBe(false);
  });
});

describe("buildSupportLink", () => {
  it("wa.me con el texto codificado", () => {
    const link = buildSupportLink("526670000000", "traslado");
    expect(link).toBe(
      "https://wa.me/526670000000?text=Hola%2C%20uso%20Rumbo%20y%20quisiera%20informaci%C3%B3n%20sobre%20apoyo%20para%20traslado%20a%20mis%20citas.",
    );
  });

  it("el texto decodificado es exactamente el mensaje y no hay más parámetros", () => {
    const url = new URL(buildSupportLink("526670000000", "medicamento") ?? "");
    expect(url.origin).toBe("https://wa.me");
    expect(url.pathname).toBe("/526670000000");
    expect([...url.searchParams.keys()]).toEqual(["text"]);
    expect(url.searchParams.get("text")).toBe(buildSupportMessage("medicamento"));
  });

  it("sin número válido no hay enlace", () => {
    expect(buildSupportLink(null, "traslado")).toBeNull();
  });
});
