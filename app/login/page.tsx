import Link from "next/link";
import { loginAction } from "@/app/auth-actions";
import { AuthFrame } from "@/components/app-shell/auth-frame";
import { SubmitButton } from "@/components/submit-button";
import { Notice } from "@/components/ui/notice";
import { buttonPrimary, field, fieldLabel, textLink } from "@/components/ui/styles";
import { getAuthErrorMessage, getAuthSuccessMessage } from "@/lib/auth-messages";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string | string[];
    success?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const errorMessage = getAuthErrorMessage(params.error);
  const successMessage = getAuthSuccessMessage(params.success);

  return (
    <AuthFrame
      heading="Inicia sesión"
      settle
      footer={
        <>
          ¿No tienes cuenta?{" "}
          <Link className={textLink} href="/registro">
            Crear cuenta
          </Link>
        </>
      }
    >
      {errorMessage ? <Notice kind="error">{errorMessage}</Notice> : null}
      {successMessage ? <Notice kind="success">{successMessage}</Notice> : null}
      <form className="flex flex-col gap-5" action={loginAction}>
        <label className={fieldLabel}>
          Correo electrónico
          <input className={field} type="email" name="email" autoComplete="email" required />
        </label>
        <label className={fieldLabel}>
          Contraseña
          <input
            className={field}
            type="password"
            name="password"
            autoComplete="current-password"
            minLength={6}
            required
          />
        </label>
        <SubmitButton pendingLabel="Entrando…" className={`${buttonPrimary} w-full`}>
          Entrar
        </SubmitButton>
      </form>
    </AuthFrame>
  );
}
