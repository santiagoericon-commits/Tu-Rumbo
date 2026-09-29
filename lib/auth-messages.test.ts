import { describe, expect, it } from "vitest";
import { getAuthErrorMessage, getAuthSuccessMessage, toAuthErrorCode } from "@/lib/auth-messages";

describe("diccionario cerrado de mensajes", () => {
  it("traduce un código de error conocido", () => {
    expect(getAuthErrorMessage("credenciales")).toBe("El correo o la contraseña no coinciden.");
  });

  it("traduce un código de éxito conocido", () => {
    expect(getAuthSuccessMessage("revisa-correo")).toBe(
      "Te enviamos un correo para confirmar tu cuenta.",
    );
  });

  it("no usa un código de error como éxito", () => {
    expect(getAuthSuccessMessage("credenciales")).toBeNull();
  });

  it("no muestra texto inyectado", () => {
    expect(getAuthErrorMessage("Tu cuenta fue bloqueada.")).toBeNull();
  });

  it.each(["constructor", "__proto__", "toString", "hasOwnProperty"])(
    "no resuelve la clave del prototipo %s",
    (key) => {
      expect(getAuthErrorMessage(key)).toBeNull();
      expect(getAuthSuccessMessage(key)).toBeNull();
    },
  );

  it("ignora parámetros repetidos (array)", () => {
    expect(getAuthErrorMessage(["credenciales", "generico"])).toBeNull();
  });

  it("ignora undefined", () => {
    expect(getAuthErrorMessage(undefined)).toBeNull();
  });
});

describe("toAuthErrorCode", () => {
  it.each([
    ["invalid_credentials", 400, "credenciales"],
    ["email_not_confirmed", 400, "correo-sin-confirmar"],
    ["weak_password", 422, "datos-invalidos"],
    ["email_address_invalid", 400, "datos-invalidos"],
    ["over_email_send_rate_limit", 429, "demasiados-intentos"],
    [undefined, 429, "demasiados-intentos"],
    ["user_already_exists", 422, "registro-no-completado"],
    ["signup_disabled", 422, "generico"],
    [undefined, 0, "generico"],
    ["constructor", 400, "generico"],
  ] as const)("%s con status %s → %s", (code, status, expected) => {
    expect(toAuthErrorCode(code, status)).toBe(expected);
  });
});
