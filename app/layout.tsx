import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "./service-worker-register";
import { OpeningIntro } from "@/components/app-shell/opening-intro";
import { openingSeenScript } from "@/lib/opening";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const sourceSerif = Source_Serif_4({ subsets: ["latin"], display: "swap", variable: "--font-source-serif" });

export const metadata: Metadata = {
  title: "Rumbo",
  description: "Seguimiento de tratamiento para personas en remisión.",
  // "default": con black-translucent el texto de la barra de estado quedaría blanco sobre crema.
  appleWebApp: { capable: true, title: "Rumbo", statusBarStyle: "default" },
};

// themeColor repite el token canvas (#F6F4EE): el viewport no puede leer variables CSS.
// Nunca maximumScale ni userScalable (WCAG 1.4.4). Sin viewportFit "cover", env(safe-area-inset-*) vale 0.
export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#F6F4EE",
  viewportFit: "cover",
};

// suppressHydrationWarning: el script de <head> agrega data-opening a <html> antes de hidratar.
// Va como <script> simple y no con next/script: beforeInteractive inline corre después del primer pintado.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-MX"
      className={`${inter.variable} ${sourceSerif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: openingSeenScript }} />
      </head>
      <body className="flex min-h-dvh flex-col bg-canvas font-sans text-ink">
        <ServiceWorkerRegister />
        <div className="flex flex-1 flex-col">{children}</div>
        <footer className="px-4 py-6 text-center text-secondary text-ink-muted">
          Rumbo no sustituye la atención médica.
        </footer>
        <OpeningIntro />
      </body>
    </html>
  );
}
