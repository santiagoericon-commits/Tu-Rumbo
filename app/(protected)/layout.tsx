import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/auth-actions";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
      <header className="rounded-md border bg-white p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-semibold">Rumbo</h1>
          <form action={logoutAction}>
            <button className="rounded-md border px-3 py-1.5 text-sm" type="submit">
              Cerrar sesión
            </button>
          </form>
        </div>
        <nav className="flex flex-wrap gap-3 text-sm">
          <Link className="underline" href="/hoy">
            Hoy
          </Link>
          <Link className="underline" href="/medicamentos">
            Medicamentos
          </Link>
          <Link className="underline" href="/citas">
            Citas
          </Link>
          <Link className="underline" href="/sintomas">
            Síntomas
          </Link>
        </nav>
      </header>
      <section className="rounded-md border bg-white p-4">{children}</section>
    </div>
  );
}
