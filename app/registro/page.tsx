import Link from "next/link";
import { signupAction } from "@/app/auth-actions";
import { AuthFrame } from "@/components/app-shell/auth-frame";
import { SubmitButton } from "@/components/submit-button";
import { Notice } from "@/components/ui/notice";
import { buttonPrimary, field, fieldLabel, textLink } from "@/components/ui/styles";
import { getAuthErrorMessage } from "@/lib/auth-messages";

type SignupPageProps = {
  searchParams: Promise<{
    error?: string | string[];
  }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const errorMessage = getAuthErrorMessage(params.error);

  return (
    <AuthFrame
      heading="Crear cuenta"
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link className={textLink} href="/login">
            Iniciar sesión
          </Link>
        </>
      }
    >
      {errorMessage ? <Notice kind="error">{errorMessage}</Notice> : null}
      <form className="flex flex-col gap-5" action={signupAction}>
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
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>
        <SubmitButton pendingLabel="Creando cuenta…" className={`${buttonPrimary} w-full`}>
          Registrarme
        </SubmitButton>
      </form>
    </AuthFrame>
  );
}
