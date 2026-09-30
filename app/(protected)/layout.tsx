import { redirect } from "next/navigation";
import { TabBar } from "@/components/app-shell/tab-bar";
import { TopBar } from "@/components/app-shell/top-bar";
import { TimeZoneSync } from "@/components/time-zone-sync";
import { createClient } from "@/lib/supabase/server";
import { getUserTimeZone } from "@/lib/timezone.server";

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

  const timeZone = await getUserTimeZone();

  return (
    <>
      <TimeZoneSync current={timeZone} />
      <a
        href="#contenido"
        className="sr-only rounded-control bg-surface px-4 py-3 text-body text-accent focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
      >
        Saltar al contenido
      </a>
      <TopBar />
      <main id="contenido" className="mx-auto w-full max-w-lg flex-1 px-4 pb-6">
        {children}
      </main>
      <TabBar />
    </>
  );
}
