import { describe, expect, it } from "vitest";
import { normalizeMultiline } from "@/lib/form-text";

describe("normalizeMultiline", () => {
  it("convierte los saltos CRLF que envía el navegador en uno solo", () => {
    expect(normalizeMultiline("uno\r\ndos\r\ntres")).toBe("uno\ndos\ntres");
  });

  it("convierte CR sueltos", () => {
    expect(normalizeMultiline("uno\rdos")).toBe("uno\ndos");
  });

  it("recorta espacios y saltos al inicio y al final, no en medio", () => {
    expect(normalizeMultiline("  \r\n hola\r\n\r\nadiós \r\n ")).toBe("hola\n\nadiós");
  });

  it("un texto de 500 caracteres con saltos CRLF sigue midiendo 500", () => {
    const line = "a".repeat(99);
    const typed = Array(5).fill(line).join("\n"); // 5 × 99 + 4 saltos = 499
    const submitted = `${typed.replaceAll("\n", "\r\n")}b`;
    expect(normalizeMultiline(submitted)).toHaveLength(500);
  });
});
