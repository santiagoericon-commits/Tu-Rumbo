import Link from "next/link";
import { loginAction } from "@/app/auth-actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
      {params.error ? (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{params.error}</p>
      ) : null}
      {params.success ? (
        <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">
          {params.success}
        </p>
      ) : null}
      <form className="space-y-3 rounded-md border bg-white p-4" action={loginAction}>
        <label className="flex flex-col gap-1 text-sm">
          Correo electrónico
          <input
            className="rounded-md border px-3 py-2"
            type="email"
            name="email"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Contraseña
          <input
            className="rounded-md border px-3 py-2"
            type="password"
            name="password"
            minLength={6}
            required
          />
        </label>
        <button
          className="w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          type="submit"
        >
          Entrar
        </button>
      </form>
      <p className="text-sm text-zinc-600">
        ¿No tienes cuenta?{" "}
        <Link className="text-green-700 underline" href="/registro">
          Crear cuenta
        </Link>
      </p>
    </div>
  );
}
