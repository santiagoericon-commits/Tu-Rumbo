// Diccionarios cerrados: la UI solo muestra textos de aquí, nunca valores de la URL.

export type AuthErrorCode =
  | "credenciales"
  | "correo-sin-confirmar"
  | "datos-invalidos"
  | "demasiados-intentos"
  | "registro-no-completado"
  | "generico";

export type AuthSuccessCode = "revisa-correo";

const ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  credenciales: "El correo o la contraseña no coinciden.",
  "correo-sin-confirmar": "Confirma tu correo para entrar. Revisa tu bandeja de entrada.",
  "datos-invalidos": "Revisa el correo y que la contraseña tenga al menos 6 caracteres.",
  "demasiados-intentos": "Hubo demasiados intentos. Espera unos minutos e inténtalo de nuevo.",
  "registro-no-completado":
    "No pudimos crear la cuenta con ese correo. Si ya tienes cuenta, inicia sesión.",
  generico: "No pudimos completar la solicitud. Inténtalo de nuevo.",
};

const SUCCESS_MESSAGES: Record<AuthSuccessCode, string> = {
  "revisa-correo": "Te enviamos un correo para confirmar tu cuenta.",
};

// Códigos de @supabase/auth-js 2.117.0 (src/lib/error-codes.ts). Lo que no esté aquí es "generico".
const SUPABASE_CODES: Record<string, AuthErrorCode> = {
  invalid_credentials: "credenciales",
  email_not_confirmed: "correo-sin-confirmar",
  validation_failed: "datos-invalidos",
  email_address_invalid: "datos-invalidos",
  weak_password: "datos-invalidos",
  over_request_rate_limit: "demasiados-intentos",
  over_email_send_rate_limit: "demasiados-intentos",
  // Nunca confirmar que un correo ya tiene cuenta: en Rumbo eso revela un dato de salud.
  user_already_exists: "registro-no-completado",
  email_exists: "registro-no-completado",
};

// Object.hasOwn evita que "constructor" o "__proto__" resuelvan a algo del prototipo.
function lookup(dictionary: Record<string, string>, code: unknown): string | null {
  if (typeof code !== "string" || !Object.hasOwn(dictionary, code)) return null;
  return dictionary[code];
}

export function getAuthErrorMessage(code: unknown): string | null {
  return lookup(ERROR_MESSAGES, code);
}

export function getAuthSuccessMessage(code: unknown): string | null {
  return lookup(SUCCESS_MESSAGES, code);
}

export function toAuthErrorCode(
  supabaseCode: string | undefined,
  status: number | undefined,
): AuthErrorCode {
  if (supabaseCode && Object.hasOwn(SUPABASE_CODES, supabaseCode)) {
    return SUPABASE_CODES[supabaseCode];
  }
  if (status === 429) return "demasiados-intentos";
  return "generico";
}
