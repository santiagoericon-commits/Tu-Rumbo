// Íconos de interfaz. Paths de Lucide (https://lucide.dev), licencia ISC:
// Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT).
// All other copyright (c) for Lucide are held by Lucide Contributors 2022.
// Permission to use, copy, modify, and/or distribute this software for any purpose with or without
// fee is hereby granted, provided that the above copyright notice and this permission notice appear
// in all copies.
//
// Todo ícono va junto a texto visible: son decorativos (aria-hidden). `active` engrosa el trazo y
// rellena suavemente la figura principal (pestaña activa); nunca es la única señal de estado.
import type { ReactNode } from "react";

export type IconProps = { className?: string; active?: boolean };
export type IconComponent = (props: IconProps) => ReactNode;

function Svg({ className = "size-6", active = false, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.25 : 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      {children}
    </svg>
  );
}

// Relleno suave de la figura principal cuando el ícono está activo.
function fill(active?: boolean) {
  return active ? { fill: "currentColor", fillOpacity: 0.14 } : {};
}

export function SunIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="4" {...fill(props.active)} />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </Svg>
  );
}

export function PillIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" {...fill(props.active)} />
      <path d="m8.5 8.5 7 7" />
    </Svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect width="18" height="18" x="3" y="4" rx="2" {...fill(props.active)} />
      <path d="M8 2v4M16 2v4M3 10h18" />
    </Svg>
  );
}

export function NotebookPenIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4" {...fill(props.active)} />
      <path d="M2 6h4M2 10h4M2 14h4M2 18h4" />
      <path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" />
    </Svg>
  );
}

export function CircleCheckIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="10" {...fill(props.active)} />
      <path d="m9 12 2 2 4-4" />
    </Svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="10" {...fill(props.active)} />
      <path d="M12 6v6l4 2" />
    </Svg>
  );
}

export function CircleIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="10" {...fill(props.active)} />
    </Svg>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="10" {...fill(props.active)} />
      <path d="M12 16v-4M12 8h.01" />
    </Svg>
  );
}

export function ShieldCheckIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
        {...fill(props.active)}
      />
      <path d="m9 12 2 2 4-4" />
    </Svg>
  );
}

// Apoyo (P9): mano que ayuda. Sin corazones (docs/diseno.md §7).
export function HandHelpingIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M11 12h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 14" />
      <path d="m7 18 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9" />
      <path d="m2 13 6 6" />
    </Svg>
  );
}

export function BusIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 6v6M15 6v6M2 12h19.6M9 18h5" />
      <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="16" cy="18" r="2" />
    </Svg>
  );
}

export function ClipboardListIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4M12 16h4M8 11h.01M8 16h.01" />
    </Svg>
  );
}

export function MessageCircleIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </Svg>
  );
}

export function LogOutIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </Svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 12h14M12 5v14" />
    </Svg>
  );
}
