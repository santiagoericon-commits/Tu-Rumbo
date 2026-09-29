import { describe, expect, it } from "vitest";
import { parseCredentials } from "@/lib/auth-validation";

const form = (email?: string, password?: string) => {
  const data = new FormData();
  if (email !== undefined) data.set("email", email);
  if (password !== undefined) data.set("password", password);
  return data;
};

describe("parseCredentials", () => {
  it("recorta el correo y lo acepta con mayúsculas", () => {
    expect(parseCredentials(form("  Ana@Correo.MX ", "123456"))).toEqual({
      email: "Ana@Correo.MX",
      password: "123456",
    });
  });

  it("rechaza una contraseña de menos de 6 caracteres", () => {
    expect(parseCredentials(form("ana@correo.mx", "123"))).toBeNull();
  });

  it("rechaza un correo sin arroba", () => {
    expect(parseCredentials(form("ana-correo.mx", "123456"))).toBeNull();
  });

  it("rechaza un correo sin dominio con punto", () => {
    expect(parseCredentials(form("ana@correo", "123456"))).toBeNull();
  });

  it("rechaza un correo ausente", () => {
    expect(parseCredentials(form(undefined, "123456"))).toBeNull();
  });

  it("rechaza un archivo en lugar de texto", () => {
    const data = new FormData();
    data.set("email", new Blob(["x"]), "x.txt");
    data.set("password", "123456");
    expect(parseCredentials(data)).toBeNull();
  });

  it("rechaza un correo de más de 254 caracteres", () => {
    expect(parseCredentials(form(`${"a".repeat(250)}@x.mx`, "123456"))).toBeNull();
  });
});
