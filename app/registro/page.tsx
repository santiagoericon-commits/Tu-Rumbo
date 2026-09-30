import Link from "next/link";
import { AuthFrame } from "@/components/app-shell/auth-frame";
import { textLink } from "@/components/ui/styles";

// Durante el prototipo el registro está cerrado en Supabase Auth (AUTH-01); signupAction sigue exportada sin uso.
export default function SignupPage() {
  return (
    <AuthFrame heading="Crear cuenta">
      <p className="text-body text-ink">Durante el prototipo, las cuentas se crean por invitación.</p>
      <Link className={`${textLink} self-start`} href="/login">
        Volver a iniciar sesión
      </Link>
    </AuthFrame>
  );
}
