import { CalendarIcon, NotebookPenIcon, PillIcon, SunIcon, type IconComponent } from "@/components/icons";

// Fuente única de las 4 secciones: pestaña, encabezado y estado vacío.
// El acento de sección solo pinta el ícono, el tinte del encabezado y el estado vacío;
// nunca botones, errores ni estados. Clases completas para que Tailwind las detecte.
export type SectionKey = "hoy" | "medicamentos" | "citas" | "sintomas";

export type Section = {
  href: string;
  tabLabel: string;
  Icon: IconComponent;
  tintClass: string;
  inkClass: string;
};

export const SECTIONS: Record<SectionKey, Section> = {
  hoy: { href: "/hoy", tabLabel: "Hoy", Icon: SunIcon, tintClass: "bg-surface-muted", inkClass: "text-accent" },
  // D1: "Medicinas" en la pestaña (a 360 px "Medicamentos" no cabe); el título sigue siendo "Medicamentos".
  medicamentos: {
    href: "/medicamentos",
    tabLabel: "Medicinas",
    Icon: PillIcon,
    tintClass: "bg-coral-tint",
    inkClass: "text-coral-ink",
  },
  citas: { href: "/citas", tabLabel: "Citas", Icon: CalendarIcon, tintClass: "bg-sky-tint", inkClass: "text-sky-ink" },
  sintomas: {
    href: "/sintomas",
    tabLabel: "Síntomas",
    Icon: NotebookPenIcon,
    tintClass: "bg-plum-tint",
    inkClass: "text-plum-ink",
  },
};

export const SECTION_ORDER: SectionKey[] = ["hoy", "medicamentos", "citas", "sintomas"];
