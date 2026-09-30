# Sistema de diseño de Rumbo

Semilla de la futura skill `rumbo-diseno`. Describe lo que está construido en P6 (30 sept 2026). Si el código y este documento no coinciden, manda el código y se corrige aquí.

Rumbo acompaña a personas en remisión de cáncer durante tratamientos largos. Muchas son adultas mayores, usan el teléfono con una mano y abren la app una o dos veces al día. El diseño tiene que ser sereno, legible y difícil de usar mal.

## 1. Principios

1. **Una tarea principal por pantalla.** Hoy: marcar dosis. Síntomas: registrar el día. Medicamentos y Citas: consultar y agregar.
2. **Controles de 48 px o más, y separados.** El primario mide 52 px; entre controles hay al menos 8 px.
3. **Cuerpo de 18 px en Inter; serif (Source Serif 4) solo en títulos.** El único texto menor a 16 px es la etiqueta de pestaña (14 px).
4. **Íconos siempre con etiqueta visible.** Nunca un ícono solo.
5. **Tono cálido, simple y sin juicio.** Español de México, de "tú".
6. **Metas de valores, nunca números.** Sin rachas, porcentajes, puntos ni gráficas.
7. **Tolerancia a errores.** Deshacer visible, confirmación antes de eliminar y foco que regresa a donde estaba.

## 2. Tokens (`app/globals.css`, `@theme`)

Ratios con la fórmula de luminancia de WCAG 2.x, verificados el **30 sept 2026** con `node -e`. Coinciden (±0.01) con la research del pase visual.

| Token | Hex | Uso | Contraste |
|---|---|---|---|
| `canvas` | #F6F4EE | Fondo de la app | base |
| `surface` | #FFFFFF | Tarjetas, barra inferior, campos | base |
| `surface-muted` | #E7EDE6 | Tinte de Hoy, avisos, esqueletos, confirmación | base |
| `ink` | #1F2A24 | Texto principal | 13.49 canvas · 14.84 surface · 12.48 surface-muted |
| `ink-muted` | #4A5750 | Texto secundario | 6.89 canvas · 7.58 surface · 6.37 surface-muted |
| `line` | #D9DED8 | Solo separadores decorativos | 1.36 surface (no sirve para controles) |
| `line-strong` | #7C8A82 | Borde de campos, opciones y secundarios | 3.61 surface · 3.28 canvas · 3.04 surface-muted |
| `accent` | #2F5D50 | Pine: única acción, foco, pestaña activa | blanco encima 7.49 · sobre canvas 6.81 |
| `accent-strong` | #244A3F | Primario presionado o en hover | blanco encima 9.88 |
| `accent-ink` | #FFFFFF | Texto sobre accent | — |
| `sage` | #7A9A86 | Decorativo; nunca texto ni ícono informativo | 2.81 canvas |
| `sage-soft` | #A8BFAF | Solo dentro de la marca | — |
| `coral-ink` / `coral-tint` | #A34A36 / #F8E4DD | Identidad de Medicamentos | 5.85 surface · 4.77 sobre su tinte |
| `sky-ink` / `sky-tint` | #2F6690 / #E1ECF4 | Identidad de Citas | 6.13 surface · 5.11 sobre su tinte |
| `plum-ink` / `plum-tint` | #6B4A72 / #EEE6F0 | Identidad de Síntomas y los 5 valores de la escala | 7.37 surface · 6.04 sobre su tinte |

Otros pares comprobados: `ink` sobre los tres tintes ≥ 12.11; `ink-muted` sobre los tres tintes ≥ 6.18; `plum-ink` sobre canvas 6.70.

**Reglas de color**
- Pine es el único color de acción. Los acentos de sección solo pintan el ícono de sección, el tinte del encabezado, el ícono del estado vacío y, en Síntomas, la escala y el chip del historial. Nunca botones, errores, eliminar ni estados.
- Coral solo como identidad de Medicamentos. Nunca en Síntomas.
- `line-strong` no va sobre `plum-tint` (2.96:1): la opción elegida de la escala lleva borde `plum-ink`.
- Descartado: coral claro #E07A5F (2.68:1 sobre canvas; no pasa ni para íconos).
- Nada de `zinc-*`, `green-*`, `red-*` ni hex en `className` o `style=`. **Excepción inevitable:** `theme_color` y `background_color` del manifest, `themeColor` del viewport, `app/icon.svg` y `scripts/generate-icons.mjs` repiten los hex porque no pueden leer variables CSS.
- Modo claro forzado (`color-scheme: light`, UI-01). El modo oscuro se hará completo con tokens, nunca a medias.

## 3. Tipografía

`next/font/google` (autohospedadas en build; el navegador no llama a Google): Inter (`--font-sans`) y Source Serif 4 (`--font-serif`), subset latin, `display: swap`.

| Utilidad | Tamaño / interlínea | Fuente y peso | Uso |
|---|---|---|---|
| `text-greeting` | 2rem / 2.375rem (32/38) | Serif 600 | Título de Hoy, "Rumbo" en login |
| `text-title` | 1.75rem / 2.125rem (28/34) | Serif 600 | Título de las demás pantallas |
| `text-subtitle` | 1.375rem / 1.75rem (22/28) | Serif 600 | Título de tarjeta, marca en la barra |
| `text-time` | 1.5rem / 1.75rem (24/28) | Inter 600, `tabular-nums` | Hora de la dosis |
| `text-name` | 1.25rem / 1.625rem (20/26) | Inter 600 | Nombre de medicamento o cita, pregunta de la escala |
| `text-body` | 1.125rem / 1.75rem (18/28) | Inter 400 | Cuerpo por defecto (también inputs) |
| `text-button` | 1.125rem / 1.5rem (18/24) | Inter 600 | Botones |
| `text-secondary` | 1rem / 1.5rem (16/24) | Inter 400 | Pistas, notas, estado de dosis, footer |
| `text-tab` | 0.875rem / 1.125rem (14/18) | Inter 600 | Solo la etiqueta de pestaña |

Los tamaños van en rem para respetar el tamaño de letra del sistema. El peso viene en el token; `font-normal` lo sobrescribe. Los títulos usan `text-wrap: balance` y los párrafos `pretty`.

## 4. Radios, sombras y espacio

- `rounded-card` 16px (tarjetas, encabezados, avisos) · `rounded-control` 12px (botones, campos, opciones) · `rounded-full` (chips, círculo del ícono de sección).
- `shadow-card` 0 1px 2px rgb(31 42 36 / 0.06) · `shadow-sheet` 0 2px 8px rgb(31 42 36 / 0.08). La separación real la dan la tarjeta blanca sobre crema y el espacio, no la sombra.
- Contenedor `max-w-lg` centrado, gutter de 16 px, tarjetas con padding de 20 px (24 en login), 16 px entre tarjetas.

## 5. Componentes (anatomía y estados)

| Componente | Archivo | Anatomía | Estados |
|---|---|---|---|
| Botón primario | `components/ui/styles.ts` → `buttonPrimary` | bg `accent`, texto `accent-ink` `text-button`, min 52 px, `rounded-control`; ancho completo en formularios | hover y presionado `accent-strong` + `scale(0.98)` (solo motion-safe, 150 ms); pendiente: texto "Guardando…" y `cursor-wait` |
| Botón secundario | `buttonSecondary` | borde 2 px `line-strong`, bg `surface`, texto `ink`, min 48 px | hover y presionado `surface-muted` |
| Botón discreto | `buttonQuiet` | texto `secondary` `ink-muted` subrayado, min 48 px | hover y presionado `surface-muted` |
| Enlace | `textLink` | `accent` subrayado 2 px, min 48 px | — |
| Campo | `field` + `fieldLabel` | label visible arriba, min 52 px, borde 2 px `line-strong`, `text-body` (evita el zoom de iOS) | foco global; el autocompletado del navegador se tapa con `surface` |
| Foco | `globals.css` | outline 3 px `accent`, offset 2 px, en todo `:focus-visible` | — |
| PageHeader | `components/ui/page-header.tsx` | banda `rounded-card` con el tinte de la sección, círculo blanco de 48 px con el ícono en el ink de la sección, h1 serif en `ink`, subtítulo `ink-muted` | con zoom alto el título baja debajo del ícono |
| Notice | `components/ui/notice.tsx` | fondo `surface-muted`, texto `ink`, ícono info o check | `error` → `role="alert"`; `success` → `role="status"`; `info` sin role; `announce={false}` dentro de una región viva existente |
| EmptyState | `components/ui/empty-state.tsx` | ícono de sección a 64 px en su color, título `text-name`, una frase y un solo botón | — |
| DeleteConfirm | `components/ui/delete-confirm.tsx` | "Eliminar" discreto → caja `surface-muted` con la pregunta, "Sí, eliminar" (primario) y "No, conservar" (secundario), apilados | entra con `@starting-style` (180–200 ms); el foco va a "No, conservar" y regresa a "Eliminar" al cancelar o si falla |
| ErrorPanel | `components/ui/error-panel.tsx` | PageHeader + Notice error + "Intentar de nuevo" (`retry`) | nunca muestra `error.message` |
| Esqueletos | `components/ui/skeletons.tsx` | banda y tarjetas con la forma real, `surface-muted`, `motion-safe:animate-pulse` | contenedor `aria-busy` + texto sr-only |
| SubmitButton | `components/submit-button.tsx` | `useFormStatus`; la variante llega por `className` | pendiente: `pendingLabel` |
| Tarjeta de dosis | `app/(protected)/hoy/dose-item.tsx` | hora `text-time` + estado (reloj "Pendiente" / check "Tomada", mismo color) · nombre · dosis · botón de ancho completo | pendiente → "Ya la tomé" (primario); tomada → "Deshacer" (secundario). La tarjeta no cambia de fondo ni de borde |
| Escala de síntomas | `app/(protected)/sintomas/symptom-level-field.tsx` | 5 filas de ≥ 56 px, toda la fila tocable: círculo, palabra `text-name`, "n de 5" a la derecha, todo `plum-ink` | sin elegir: `surface` + borde `line-strong`; elegida: `plum-tint` + borde `plum-ink`, check y palabra en negritas. Flechas nativas de radio. Nombre accesible "Algo, 3 de 5" |
| Chip del historial | `symptom-history.tsx` | `rounded-full`, `plum-tint`, `plum-ink`, "Algo · 3 de 5" | idéntico para cualquier valor |

## 6. Patrón de pantalla

```
┌ TopBar (no fija): marca 32 px + "Rumbo" serif accent · "Cerrar sesión" discreto ┐
│ <main id="contenido" max-w-lg px-4>                                            │
│   PageHeader (tinte de la sección)                                             │
│   [resumen o aviso]                                                            │
│   tarjetas (gap 16)                                                            │
│   tarjeta de formulario (id de ancla en la <section>, título con otro id)      │
│   Notice info estático (si aplica)                                             │
│ footer "Rumbo no sustituye la atención médica."                                │
└ TabBar fija (Hoy · Medicinas · Citas · Síntomas) + safe area inferior          ┘
```

- **Barra inferior:** `<nav aria-label="Secciones" data-app-tabbar>`, 4 pestañas iguales de ≥ 48×48 (fila de 64 px, token `--spacing-tabbar`). Activa: `aria-current="page"`, trazo 2.25 con relleno suave, etiqueta `accent` y barra de 3 px arriba; inactivas `ink-muted`. Nunca solo color.
- **Footer y barra:** `body:has([data-app-tabbar])` reserva abajo 64 + 8 + safe area + 16 px, así que el footer queda completo arriba de la barra al final del scroll. `html:has(...)` usa el mismo valor como `scroll-padding-bottom` para que el foco nunca quede tapado (WCAG 2.4.11).
- **Sensación nativa:** `viewportFit: "cover"` + `env(safe-area-inset-*)` arriba y abajo; sin resaltado azul al tocar; `touch-action: manipulation`; `overscroll-behavior-y: none`; nunca `maximumScale` ni `userScalable` (WCAG 1.4.4).
- **Landmarks:** `<header>` (TopBar), `<main id="contenido" tabIndex={-1}>`, `<nav>` y `<footer>`, más el enlace "Saltar al contenido".
- **Zoom alto:** los fieldsets llevan `min-w-0`, la escala y la barra superior se reacomodan y las etiquetas de pestaña se truncan con "…" en vez de encimarse.

## 7. Íconos

`components/icons.tsx`: paths de Lucide (licencia ISC, aviso en el archivo), viewBox 24, trazo 1.75 con `currentColor`, puntas redondeadas, `aria-hidden`. Prop `active` (trazo 2.25 + relleno al 14%) solo para la pestaña activa y el check de la escala.

Set: Hoy (sol), Medicamentos (cápsula), Citas (calendario), Síntomas (cuaderno con lápiz), check en círculo, reloj, círculo vacío, info, cerrar sesión.

Prohibido: cruces médicas, corazones, termómetros, listones y cualquier ícono sin texto al lado.

## 8. Marca

Aguja de brújula: un "rombo" que marca el rumbo. Punta crema al norte, sage-soft al sur, eje pine, sobre pine.

- `app/icon.svg`: fuente de 512×512 con `rx` 112 (favicon).
- `components/rumbo-mark.tsx`: el mismo dibujo con tokens (`fill-accent`, `fill-canvas`, `fill-sage-soft`). Con `settle` (solo en /login), la aguja se asienta una vez: −32° → 5° → 0° en 900 ms con ease-out fuerte, solo con `motion-safe`. Es el único momento de movimiento no pedido en toda la app.
- `scripts/generate-icons.mjs`: PNG sin alfa con fondo pine a sangre (iOS y Android aplican su máscara). `apple-icon.png` 180 y `icon-192/512` a escala 1.05; `icon-maskable-512` a 0.9 (la aguja llega a 153 px del centro, dentro de la zona segura de 204.8 px).

## 9. Microcopy

| Hacer | No hacer |
|---|---|
| "Ya la tomé" · "Pendiente" · "Tomada" · "Deshacer" | "Olvidaste tu dosis" · "¡Tómala ahora!" |
| "Registro guardado. Puedes mostrarlo a tu equipo médico en tu próxima cita." | "Tu nivel de dolor es alto" |
| "Si tienes dudas sobre una dosis, consulta a tu médico o farmacéutico." | "Sigue luchando" |
| "Hoy no tienes dosis programadas." | "¡30 días seguidos!" |
| "¿Eliminar este medicamento y sus dosis programadas?" · "No, conservar" | "¿Estás seguro?" · "Cancelar" (ambiguo en una confirmación) |

Todo copy nuevo que menciona dosis, medicamentos, síntomas o citas lleva `[PENDIENTE REVISIÓN PROFESIONAL]` en un comentario que no se ve. La tabla de swaps completa vive en CLAUDE.md.

## 10. Anti-patrones

- Métricas como meta: rachas, porcentajes, puntos, insignias, confeti o animación de premio al marcar una dosis.
- Semáforos, gráficas, promedios o cualquier interpretación de síntomas; colores por valor en la escala.
- Recordatorios con culpa, urgencia o lenguaje bélico.
- Rojo o verde para errores y éxitos (el tipo lo dicen el ícono y el texto).
- Distinguir estados solo por color (pendiente y tomada comparten color).
- Acentos de sección en botones, errores o acciones destructivas.
- `line` como borde de un control (1.36:1).
- Vibración y sonidos.

## 11. Decisiones

- **D1 · Pestaña "Medicinas".** "Medicamentos" en Inter 600 a 14 px mide 100.4 px y la columna mide 90 px a 360 y 97.5 px a 390: no cabe. "Medicinas" mide 69.7 px (≥ 8 px por lado incluso con barra de desplazamiento de escritorio). El título de la pantalla sigue siendo "Medicamentos".
- **D2 · Escala con palabras.** 1 Nada · 2 Un poco · 3 Algo · 4 Bastante · 5 Mucho, con "n de 5"; pregunta "¿Qué tanto te molestaron los síntomas hoy?". Sin caras, emoji ni colores por valor. Fuente y límites en `docs/fuentes.md`.
- **Título del encabezado en `ink`**, no en el acento: el acento es identidad, no texto.
- **Estados sin color:** pendiente y tomada se distinguen por ícono, texto y botón.
- **Sin vibración:** el feedback principal es el estado presionado (< 100 ms).
- **Fuera de alcance de P6:**

| Idea | Por qué no |
|---|---|
| "Hoy no la tomé" | Crea un estado nuevo; la app no asigna `missed` |
| "Recuérdamelo en 10 minutos", permiso de avisos | Push es v2 |
| "Tomada a las 9:12" | No existe `doses.taken_at`; requiere migración |
| Vibración en Android | Necesita un ajuste para apagarla |
| Saludo según la hora | Lógica nueva de zona horaria |
| Modo oscuro | Sigue forzado claro (UI-01) |

## 12. Fuentes

Principios 1–7: revisión sistemática JMIR mHealth 2023 (guías para adultos mayores); revisión de 132 artículos (PubMed 40804492); grupos focales con sobrevivientes de cáncer (JMIR mHealth 2017); necesidades de pacientes oncológicos (JMIR Cancer 2023); WCAG 2.2 (1.4.3, 1.4.4, 1.4.11, 2.4.11); Material 3 Navigation bar; Apple HIG Tab bars. Detalle, enlaces y estado de verificación en `docs/fuentes.md`.
