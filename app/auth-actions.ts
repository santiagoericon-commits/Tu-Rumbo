"use server";

import { redirect } from "next/navigation";
import type { AuthError } from "@supabase/supabase-js";
import { toAuthErrorCode } from "@/lib/auth-messages";
import { parseCredentials } from "@/lib/auth-validation";
import { createClient } from "@/lib/supabase/server";

// Solo el código de Supabase: nunca el correo ni el mensaje crudo.
function logAuthError(action: "login" | "registro", error: AuthError) {
  console.error(`[auth] ${action} falló:`, error.code ?? `status-${error.status ?? "desconocido"}`);
}

export async function loginAction(formData: FormData) {
  const credentials = parseCredentials(formData);
  if (!credentials) redirect("/login?error=datos-invalidos");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    logAuthError("login", error);
    redirect(`/login?error=${toAuthErrorCode(error.code, error.status)}`);
  }

  redirect("/hoy");
}

export async function signupAction(formData: FormData) {
  const credentials = parseCredentials(formData);
  if (!credentials) redirect("/registro?error=datos-invalidos");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp(credentials);

  if (error) {
    logAuthError("registro", error);
    redirect(`/registro?error=${toAuthErrorCode(error.code, error.status)}`);
  }

  // Sin "Confirm email" hay sesión inmediata; con él, hay que confirmar por correo.
  if (data.session) redirect("/hoy");
  redirect("/login?success=revisa-correo");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
