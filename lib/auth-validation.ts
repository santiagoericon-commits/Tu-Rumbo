export const MIN_PASSWORD_LENGTH = 6;
const MAX_EMAIL_LENGTH = 254;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type Credentials = { email: string; password: string };

export function parseCredentials(formData: FormData): Credentials | null {
  const email = formData.get("email");
  const password = formData.get("password");
  if (typeof email !== "string" || typeof password !== "string") return null;

  const trimmedEmail = email.trim();
  if (trimmedEmail.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(trimmedEmail)) return null;
  if (password.length < MIN_PASSWORD_LENGTH) return null;

  return { email: trimmedEmail, password };
}
