import type { Metadata } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "./service-worker-register";

export const metadata: Metadata = {
  title: "Rumbo",
  description: "Seguimiento de tratamiento para personas en remisión.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-MX" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900">
        <ServiceWorkerRegister />
        <main className="flex-1">{children}</main>
        <footer className="border-t bg-white px-4 py-3 text-center text-sm text-zinc-600">
          Rumbo no sustituye la atención médica.
        </footer>
      </body>
    </html>
  );
}
