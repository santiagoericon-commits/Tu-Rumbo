# CLAUDE.md · Rumbo

Fuente de verdad para cada sesión de Claude Code en este repo. Si algo no está aquí o en `git log`, no cuenta.

## Qué es Rumbo

PWA en español de México que acompaña a personas en remisión de cáncer para que no abandonen tratamientos largos (ej. hormonoterapia oral de 5+ años). MVP: dosis del día (`/hoy`), medicamentos (`/medicamentos`), citas de control (`/citas`), registro diario de síntomas (`/sintomas`). v2 (fuera de alcance): push y alertas a médico/familiar.

**Rumbo no da indicaciones clínicas, no interpreta síntomas, no sugiere dosis y no sustituye la atención médica.** Ningún texto, color o flujo puede insinuar lo contrario.

Fase actual: prototipo para presentación del **miércoles 30 sept 2026**. Solo datos ficticios (cuentas demo). Nada de datos reales de pacientes hasta tener aviso de privacidad y consentimiento (LFPDPPP).

## Stack y comandos

- Next.js 16 (App Router) · React 19 · TypeScript estricto · Tailwind v4 · Supabase (`@supabase/ssr`)
- PC con Windows (PowerShell o Git Bash). Node 22 fijado con `.node-version` (fnm). Dev en `http://localhost:3000`.

```bash
npm run dev
npm run lint && npm run build   # verificación estándar (build = chequeo de tipos)
npm test                        # Vitest 4.1.11 (fijo; Vitest 5 pide Node 22), tests en lib/**/*.test.ts
```

`npm test` ya corre en UTC en cualquier sistema (`process.env.TZ` en `vitest.config.mts`; `lib/tz-guard.test.ts` falla si no). Dev server en UTC: PowerShell `$env:TZ="UTC"; npm run dev` · Git Bash `TZ=UTC npm run dev`.

Docs de Next de la versión instalada: `node_modules/next/dist/docs`. Consultarlas antes de usar una API de Next.

No usar `npx tsc --noEmit` solo: en un clon limpio falla por `LayoutProps`, un tipo que genera Next (`next build` o `next typegen`).

Variables: solo `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `NEXT_PUBLIC_SUPPORT_WHATSAPP` (P9; 52 + 10 dígitos, sin signos; vacía oculta el botón de /apoyo). Se incrustan en build; si cambian en Vercel, hay que redeployar.

## Mapa del código

| Ruta | Qué es |
|---|---|
| `proxy.ts` | Refresco de sesión (`@supabase/ssr`, Next 16) y redirección de rutas protegidas. **Protegido** |
| `lib/supabase/server.ts`, `lib/supabase/client.ts` | Clientes de Supabase servidor/navegador. **Protegidos** |
| `app/auth-actions.ts` | Login, registro, logout (Server Actions). **Protegido** |
| `app/(protected)/layout.tsx` | Segunda capa de auth + shell: enlace "Saltar al contenido", `TopBar`, `<main id="contenido">`, `TabBar` |
| `app/(protected)/{hoy,medicamentos,citas,sintomas}/page.tsx` | Pantallas del MVP |
| `app/layout.tsx` | Root layout: footer "Rumbo no sustituye la atención médica." (**no quitar**), telón de opening y el script de `<head>` que evita el destello al recargar |
| `app/manifest.ts`, `public/sw.js`, `app/service-worker-register.tsx` | PWA |
| `app/icon.svg`, `app/apple-icon.png`, `public/icons/*.png`, `scripts/generate-icons.mjs` | Marca (aguja de brújula): favicon SVG y PNG de PWA generados una vez con el `sharp` de `next` (`node scripts/generate-icons.mjs`) |
| `supabase/migrations/` | Esquema. **Nunca editar una migración aplicada**; crear una nueva |
| `lib/auth-messages.ts`, `lib/auth-validation.ts` | Diccionario cerrado de mensajes de auth y validación de credenciales |
| `lib/timezone.ts` | Zona del usuario: `DEFAULT_TZ` (America/Mazatlan), `TIME_ZONE_PATTERN`, `isValidTimeZone`, `resolveTimeZone`. Puro (lo usa también el cliente) |
| `lib/timezone.server.ts` | `getUserTimeZone()`: lee la cookie `tz` en el servidor y la resuelve |
| `lib/local-time.ts` | Primitivas de hora local: `localParts`, `offsetMs`, `formatLocalDate` ("YYYY-MM-DD"), `addDaysIso`, `localDateTimeToInstant` (hora repetida → primera ocurrencia; hora inexistente → se recorre hacia adelante). Solo `Intl`. Solo cambia con tests |
| `lib/date-range.ts` | `getDayRange(tz, now)`, `formatTime`, `formatDayHeading`, `formatLongDate` ("martes, 6 de octubre"; con año si no es el año local en curso). Solo `Intl`. Lógica de tiempo: solo cambia con tests |
| `lib/dose-schedule.ts` | `generateDoseInstants`: dosis de 14 días desde la fecha de inicio, en la zona del usuario, nunca en el pasado. Solo cambia con tests |
| `lib/dose-topup.ts` | `planDoseTopUp` (SCHED-01): dosis faltantes de hoy y los 13 días siguientes. Desde el inicio del día local (nunca ayer ni antes del `created_at` del medicamento), solo en días locales sin ninguna dosis de ese medicamento (no duplica si cambia la zona), sin medicamentos de inicio futuro. Reutiliza `generateDoseInstants`. Solo cambia con tests |
| `app/(protected)/hoy/top-up.ts` | `topUpDoses` (`server-only`): al abrir /hoy, 2 SELECT + un upsert `ignoreDuplicates` por lote solo si falta algo. Si falla, /hoy se ve igual y se registra solo el código |
| `lib/medication-validation.ts`, `lib/medication-messages.ts` | Validación en servidor del formulario de medicamento (nombre 1–80, dosis ≤ 60, 1–4 horarios HH:MM, inicio hoy..+365) y diccionario cerrado de sus errores |
| `lib/schedule-format.ts` | Texto de horarios ("8:00 a.m. y 8:00 p.m."), de fecha de calendario (`formatCalendarDate`: "martes, 29 de septiembre") y de fecha de inicio ("Desde el martes, 29 de septiembre") |
| `lib/opening.ts` | Bandera `rumbo_opening_seen` (solo `"1"` en `sessionStorage`, nada personal) y el script de `<head>` que marca `html[data-opening="done"]` |
| `lib/ids.ts` | `isUuid` |
| `lib/form-text.ts` | `normalizeMultiline`: el textarea envía `
` pero `maxLength` cuenta uno; se normaliza antes de medir |
| `lib/symptom-validation.ts`, `lib/symptom-messages.ts` | Validación del registro diario (valor `"1"`–`"5"`, notas ≤ 500) y diccionario cerrado de errores + aviso de guardado |
| `lib/appointment-validation.ts`, `lib/appointment-messages.ts` | Validación de la cita (título 1–80, fecha hoy..+730, hora HH:MM, notas ≤ 300) y diccionario cerrado de errores |
| `lib/appointment-list.ts` | `partitionAppointments`: próximas (≥ ahora, ascendente) y anteriores (la más reciente primero) |
| `lib/visit-summary.ts` | "Para mi cita" (P10), puro: `summaryWindow` (fin = hoy local; inicio = el más tardío entre hoy − 29 y el día local de la última cita pasada), `windowStartInstant`, `coveredStart` (primer día con datos reales), `groupUnmarkedDoses` (dosis no `taken` ya vencidas, por medicamento y día local; `missed` = `pending`), `formatPeriodLabel` y `formatTimeList`. Solo agrupa lo registrado: sin conteos ni porcentajes. Solo cambia con tests |
| `lib/dose-status.ts`, `lib/dose-summary.ts` | Validación de la acción de dosis (UUID + taken/pending, nunca missed) y texto del resumen de `/hoy` |
| `app/(protected)/medicamentos/{actions,medication-form,medication-item}.tsx` | Alta (inserta medicamento + dosis; si fallan las dosis borra el medicamento) y eliminación con confirmación |
| `app/(protected)/sintomas/` | Registro diario: upsert por `(user_id, log_date)` con `log_date` calculado en servidor; escala con palabras en `level-labels.ts` (Nada a Mucho, "n de 5", plum sin colores por valor); historial de 14 días con chip; `safety-note.tsx` (línea estática del 911, también en `error.tsx`) |
| `app/(protected)/citas/` | Alta con fecha y hora locales (`localDateTimeToInstant`), próximas/anteriores y eliminación con confirmación |
| `app/(protected)/citas/resumen/` | "Para mi cita" (P10): hoja imprimible en `/citas/resumen?cita=<uuid>` (solo ese parámetro, validado con `isUuid`; ajena, pasada o inexistente redirige). `load-summary.ts` (`server-only`, 5 SELECT; si falla cualquiera no hay hoja), `summary-sheet.tsx`, secciones (medicamentos, dosis que no marqué, cómo me sentí) y `questions-form.tsx` (las notas de la cita, con `updateAppointmentNotesAction`). Periodo = el que realmente cubre, con la línea fija "Incluye los días en que Rumbo tenía dosis programadas.". `window.print()` + `@media print` en `globals.css` (blanco y negro, carta, 11/13/18 pt); nada se guarda como PDF |
| `app/(protected)/apoyo/` | "Pide apoyo" (P9, ADR D-WA): 4 opciones (radios de 72 px), vista previa en burbuja y un solo botón "Abrir WhatsApp" con enlace `wa.me` armado en servidor; sin número configurado, texto neutro. Sin consultas a la base. Entrada desde `top-bar` ("Apoyo") y tarjetas de /hoy |
| `lib/support-link.ts` | `SUPPORT_OPTIONS` (diccionario cerrado), `normalizeWhatsAppNumber` (10 dígitos → antepone 52; 11 a 15 igual; con signos → null), `buildSupportMessage` y `buildSupportLink` (`encodeURIComponent`). Solo cambia con tests |
| `lib/supply.ts`, `lib/supply.server.ts` | Surtido (P9): `summarizeSupply` (restantes = `supply_count` − dosis `taken` con `scheduled_at >= supply_set_at`; fecha estimada con `generateDoseInstants` desde ahora; apoyo a 7 días o menos), `formatSupplyLine` ("Te quedan unas 9 tomas · hasta el dom 15 nov", fecha con espacios no separables) y `loadSupplySummaries` (`server-only`, 2 SELECT; si falla no se muestra). Solo cambia con tests |
| `app/(protected)/medicamentos/{supply-editor,supply-count-field}.tsx`, `app/(protected)/hoy/support-cards.tsx` | Línea de surtido + editor en la tarjeta (`updateSupplyAction`), campo "¿Cuántas tomas te quedan?" del alta, tarjeta de surtido de /hoy (solo con 7 días o menos) y entrada fija a Apoyo |
| `components/time-zone-sync.tsx` | Escribe la cookie `tz` desde el navegador y hace un solo `router.refresh()` si cambió |
| `components/submit-button.tsx` | Botón de envío compartido con `useFormStatus`; la variante llega por `className` |
| `components/ui/` | `styles.ts` (buttonPrimary, buttonSecondary, buttonQuiet, textLink, field, fieldLabel, card, cardTitle), `page-header`, `notice` (error=alert, success=status, info sin role), `empty-state`, `delete-confirm`, `error-panel`, `skeletons` |
| `components/app-shell/` | `sections.ts` (fuente única de las 4 secciones: ruta, pestaña, ícono, tinte), `top-bar`, `tab-bar` (`data-app-tabbar`, `aria-current` con la ruta real, pestaña optimista con `onNavigate` que se reinicia al cambiar la ruta, barra deslizante), `auth-frame` (login y registro), `opening-intro` (telón de bienvenida, una vez por sesión; spec en `docs/diseno.md` §8 y §13) |
| `components/icons.tsx`, `components/rumbo-mark.tsx` | Íconos de interfaz (paths de Lucide, ISC; el escudo solo en el opening) y la marca con tokens (`motion`: `"settle"` en /login, `"opening"` en el telón) |
| `components/illustrations/`, `components/ui/dose-status-glyph.tsx`, `components/ui/notebook-glyph.tsx` | Reconocimiento sereno (P10.5, `docs/marca.md` §3 y §6): 5 ilustraciones "camino y brújula" (brújula, camino con señal, sobre con `motion="close"`, hoja con renglones, calendario con hoja; trazo 1.25 en viewBox 48, un relleno `sage-soft`, `aria-hidden`), check que se dibuja por transición de `stroke-dashoffset` y cuaderno que se cierra al guardar síntomas. Los keyframes (`settle-a/b`, `day-close`, `day-close-line`, `notebook-close`, `envelope-close`) viven en `@theme` de `app/globals.css` y siempre van con `motion-safe:` |
| `lib/day-closed.ts`, `lib/usage-milestone.ts` | `isDayClosed` (todas las dosis de hoy `taken`; `missed` y `pending` = abierto) y `usageMilestone` (7 o 30 días de calendario local desde `user.created_at` → `"semana"`/`"mes"`/null, sin restar milisegundos). Solo cambian con tests |
| `app/(protected)/hoy/{today-doses,day-closed-line,dose-item,pending-settled,first-medication-card,milestone-card}.tsx`, `app/(protected)/first-medication.ts`, `app/(protected)/use-return-focus.ts`, `app/(protected)/compact-empty.tsx` | `TodayDoses` (cliente) sube encabezado, resumen y lista para que "Listo por hoy." vea el estado optimista; solo anima si el cierre vino de un toque (`closedByTap`), nunca al recargar. `first-medication.ts` es una bandera en memoria del módulo (nada en storage): la alta del primer medicamento la marca y `/hoy` la lee una vez. `use-return-focus` devuelve el foco al botón al cerrar un editor |
| `docs/diseno.md`, `docs/fuentes.md`, `docs/marca.md` | Sistema de diseño (semilla de la skill `rumbo-diseno`), fuentes de copy con contenido de salud y capa de marca (Reconocimiento sereno, patrones de Apoyo, Surtido y Para mi cita; decisión D4) |

## Patrones obligatorios

- Leer con **Server Components**; escribir con **Server Actions**. Excepción declarada: `topUpDoses` rellena dosis al renderizar /hoy (idempotente; restricción única + solo días sin dosis).
- Server Actions confían en RLS para filtrar, pero toman `user_id` de `supabase.auth.getUser()`, nunca del formulario.
- Validar en el servidor. El formulario puede validar también, pero no es la defensa.
- Ruta protegida nueva: va bajo `app/(protected)/` **y** se agrega a `protectedRoutes` en `proxy.ts`.
- Botón de envío compartido con `useFormStatus`.
- Tras mutar, revalidar con la API vigente de Next 16. Verificar APIs contra la documentación de la versión instalada, no de memoria.
- Estados de carga, error y vacío en toda pantalla con datos.
- Sin `any`. Componentes < ~150 líneas; lógica pura en `lib/`.
- Tailwind con tokens en `@theme` de `app/globals.css`; nada de colores hardcodeados en `className` ni `style=`. Sistema completo en `docs/diseno.md`. Color: `canvas`, `surface`, `surface-muted`, `ink`, `ink-muted`, `line` (solo separadores), `line-strong` (bordes de controles), `accent`, `accent-strong`, `accent-ink`, `sage`/`sage-soft` (decorativos) y `coral`/`sky`/`plum` `-ink`/`-tint` (identidad de sección). Texto: `text-greeting`, `title`, `subtitle`, `time`, `name`, `body` (18 px, por defecto), `button`, `secondary`, `tab`. Radios `rounded-card`/`rounded-control`, sombra `shadow-card`. Pantallas nuevas usan solo estos tokens y las variantes de `components/ui/styles.ts`, sin `zinc-*`/`green-*`/`red-*`.

## Tiempo (crítico)

El servidor corre en UTC. "Hoy" y las horas de dosis se calculan en la zona del usuario: `Intl.DateTimeFormat().resolvedOptions().timeZone` del navegador (cookie o `profiles`), fallback `America/Mazatlan`. En DB todo es `timestamptz`. Tests obligatorios: dosis 23:30 y 00:15, día UTC distinto al local, varias dosis al día, zona distinta al fallback, Tijuana en cambio de horario.

La PC de desarrollo está en hora de Mazatlán y oculta bugs: `npm test` ya corre en UTC; la verificación visual de lógica de tiempo va con el dev server en UTC (PowerShell `$env:TZ="UTC"; npm run dev` · Git Bash `TZ=UTC npm run dev`), más una revisión en el preview de Vercel.

Horarios de medicamento: hora de pared local (`medications.schedule_times time[]`) + fecha local de inicio (`start_date date`); las dosis se generan como instantes UTC con `lib/dose-schedule.ts` (14 días en la alta) y se rellenan al abrir /hoy con `lib/dose-topup.ts` (ventana móvil de 14 días). Cambio de horario: hora repetida → primera ocurrencia; hora inexistente → se recorre hacia adelante (02:30 → 03:30).

Horas en 12 h como las da `Intl` es-MX ("8:05 a.m."). Una dosis pendiente de ayer no aparece en "hoy". La app nunca asigna `missed`; si existe, se muestra como pendiente.

## Esquema (reglas)

- Toda tabla nueva: RLS habilitado **y** revocar `ALL` a `anon` y `TRUNCATE, REFERENCES, TRIGGER` a `authenticated` (los privilegios por defecto de Supabase se los dan a cada tabla nueva).
- Relación entre tablas del mismo usuario: **FK compuesta `(id, user_id)`** (las FK no aplican RLS).
- Políticas solo `to authenticated`, con `(select auth.uid())`.
- Índices en las columnas que filtra RLS.
- Migración nueva `YYYYMMDDHHMMSS_descripcion.sql`. **Mostrar el SQL completo y esperar aprobación antes de escribirlo o correrlo.** Nunca `supabase db push` sin aprobación.
- Procedimiento (evita desalinear el historial): aplicar con `apply_migration` del MCP → `list_migrations` → crear el archivo local con la versión exacta que registró y el mismo SQL. Nunca nombrar el archivo antes de aplicar.

Tablas: `profiles` (fila por usuario con el trigger `on_auth_user_created` → `public.handle_new_user()`, security definer, `search_path = ''`, sin EXECUTE para anon/authenticated), `medications` (`schedule_times time[]` de 1 a 4, `start_date date`, `supply_count int` 0 a 1000 y `supply_set_at timestamptz`, ambos null o ambos llenos), `doses` (FK compuesta a `medications`, `medication_id` NOT NULL, único `(medication_id, scheduled_at)`, `status` pending/taken/missed), `appointments`, `symptom_logs` (`log_date` único por usuario, `severity` 1 a 5 de autorreporte).

## Privacidad y seguridad

- Datos de salud = datos personales sensibles.
- Nunca `service_role` en Server Actions, cliente ni `.env.example`. `.env*` sigue ignorado.
- Nunca mostrar `error.message` de Supabase. Mensajes por **código** con diccionario cerrado en servidor; código desconocido = mensaje genérico.
- Nada personal, de salud ni texto libre en URLs, query strings o logs.
- `public/sw.js` no cachea datos de salud.
- Señala riesgos de seguridad o privacidad aunque no te lo pidan.
- En verificaciones con navegador, nunca leer document.cookie completo, localStorage ni sessionStorage: solo cookies por nombre (ej. tz). Los tokens de sesión nunca van al transcript.

## Contenido clínico

Los síntomas se registran, no se evalúan. Sin umbrales, sin colores de alarma por intensidad, sin gráficas ni tendencias (el historial es una lista cronológica), sin instrucciones sobre dosis olvidadas o dobles. El formulario de medicamento no sugiere, autocompleta ni valida dosis o frecuencias: el usuario captura lo que su médico le indicó. Mensajes de seguridad estáticos e incondicionales, nunca disparados por lo que el usuario registra. Copy que afirme un hecho de salud necesita fuente verificable en `docs/fuentes.md`; si no, lenguaje neutro. Marcar copy clínico con un comentario `[PENDIENTE REVISIÓN PROFESIONAL]` (`// ...` en TS, `{/* ... */}` en JSX; nunca visible).

| ❌ No usar | ✅ Usar |
|---|---|
| "Olvidaste tu dosis", "fallaste" | "Esta dosis sigue pendiente" |
| "Tómala ahora", "toma doble" | "Si tienes dudas sobre una dosis, consulta a tu médico o farmacéutico" |
| "Tus síntomas son normales/graves" | "Gracias por contarlo. Quedó en tu registro." (igual para cualquier valor; también sirve "Puedes mostrarlo a tu equipo médico en tu próxima cita") |
| "Adherencia", "cumplimiento" | "Tus dosis", "tu registro" |
| "Lucha", "batalla", "guerrero/a" | "tu tratamiento", "tu seguimiento" |
| "Cura", "libre de cáncer", "evita la recaída" | "te ayuda a llevar el registro de tu tratamiento" |
| "Diagnóstico", "evaluación" | "registro", "seguimiento" |
| "Alerta" (v1) | "recordatorio" |
| "Gravedad", "severidad", "Molestia: 3 de 5" | "¿Qué tanto te molestaron los síntomas hoy?": Nada, Un poco, Algo, Bastante, Mucho, cada una con "n de 5" (fuente y límites en `docs/fuentes.md`) |

Línea estática propuesta para `/sintomas` (pendiente de revisión profesional): "Si algo te preocupa, comunícate con tu equipo médico. En una emergencia, llama al 911."

Tono: español de México, sereno, cálido, sin culpa, sin dramatismo. Hablarle de "tú".

## UI

- 390px primero (modo dispositivo de DevTools; Chrome no deja la ventana tan angosta) y teléfono real. Objetivos táctiles ≥ 44px, texto base ≥ 16px, contraste AA, `label` en todo input.
- iOS: las notificaciones push de una PWA solo funcionan si la app está instalada en la pantalla de inicio; el onboarding debe explicarlo cuando exista push (v2). `app/apple-icon.png` existe desde P6 (se regenera con `scripts/generate-icons.mjs`).
- Modo oscuro: soportado completo con tokens o forzado a claro con `color-scheme: light`. Nunca a medias.
- Dirección visual (P6, detalle en `docs/diseno.md`): fondo crema (`canvas`) con tarjetas blancas, Source Serif 4 solo en títulos e Inter 18 px en el cuerpo (`next/font`), marca de aguja de brújula, shell con barra inferior de 4 pestañas.
- Movimiento: reglas en `docs/diseno.md` §13 (duraciones, curvas, reduced motion). Solo `motion-safe` para desplazamientos, sin rebote ni movimiento como premio. `var()` no funciona como `animation-timing-function` dentro de un keyframe: curva literal.
- Reglas de acento: pine (`accent`) es el único color de acción, foco y pestaña activa. Coral, sky y plum son solo identidad de sección (Medicamentos, Citas, Síntomas): ícono, tinte del encabezado y estado vacío, y en Síntomas la escala y el chip. Nunca en botones, errores, eliminar ni estados. Coral nunca para síntomas. Estados (pendiente/tomada, error/éxito) por ícono y texto, nunca por color.
- La barra inferior es fija: `data-app-tabbar` reserva su alto en el body y como `scroll-padding-bottom`. Una pantalla nueva no necesita hacer nada extra, pero debe verificarse que el footer quede visible al final del scroll.

## Forma de trabajo

1. `git status` y `git log --oneline -10` antes de empezar. Rama nueva por tarea.
2. Inspeccionar y resumir antes de editar.
3. Plan (y SQL completo si aplica) → esperar aprobación. Siempre, aunque Plan Mode esté apagado.
4. Implementar solo el bloque pedido.
5. `npm run lint && npm run build` (+ `npm test`) en verde.
6. UI: verificar con `/claude-in-chrome` a 390px, claro y oscuro, estados vacío/error.
7. Revisar copy nuevo contra la tabla de swaps.
8. Reportar pass/fail, archivos tocados, suposiciones, diferidos y preguntas en lista.
9. Un commit por tarea (salvo excepción declarada en el prompt). `git add -p` para cambios mezclados. **Nunca push sin confirmación de Rafa.**

Entorno: el principal es la PC con Windows. Claude Code corre en la terminal de Cursor, sin worktrees: rama nueva en el checkout con `main` limpio. Nunca auto mode: Plan Mode para inspeccionar y planear, modo normal para implementar. Nunca `git push` sin confirmación de Rafa.

Worktrees (solo en la app de escritorio de Claude): cada sesión corre en un worktree de la app (`.claude/worktrees/`, rama `claude/...` que se renombra al empezar a implementar). `.env.local` no viaja: se copia a mano en cada worktree nuevo. El merge y el push de un prompt van antes de abrir la sesión del siguiente.

Cambios en archivos protegidos, `app/(protected)/layout.tsx`, migraciones o lógica de tiempo: Plan Mode + `/security-review` antes del commit. En el layout protegido se conserva siempre `getUser()` + `redirect("/login")`.

## Estado (30 sept 2026)

- Hecho: scaffold, auth, `proxy.ts`, PWA base, 3 migraciones (RLS + FK compuesta + programación/grants), base segura (P1). Lint y build en verde.
- Deploy: Vercel `https://rumbo-livid.vercel.app` (proyecto `rumbo`, Node 22.x), conectado al repo de GitHub; los merges a `main` van a producción (por confirmar en el primer merge). Producción pública; previews y URLs de deployment piden login de Vercel (Standard Protection). Variables en Production y Preview: solo `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Supabase: migraciones `20260922171500`, `20260922230000`, `20260930041030`, `20261104182929` y `20261104191718` aplicadas. Historial reparado el 28 sept 2026 (las dos primeras estaban registradas con otras versiones; SQL idéntico). Desde P4, migraciones con el procedimiento de "Esquema (reglas)".
- `/hoy` (P3): dosis del día en la zona del usuario (cookie `tz`, fallback America/Mazatlan), ordenadas; marcar como tomada y deshacer con `useOptimistic` + `useFormStatus`; resumen neutro; estados vacío, carga y error.
- `/medicamentos` (P4): lista (nombre, dosis, horarios en 12 h, "Desde el…"), alta con 1 a 4 horarios y fecha de inicio (redirige a `/hoy`), eliminación con confirmación (cascade a sus dosis); estados vacío, carga y error. 150 tests de Vitest (zonas, 23:30/00:15, Tijuana 23 h/25 h y horas inexistente/repetida, ventana de 14 días, validación, formato 12 h, auth).
- `/sintomas` (P5): un registro por día en la zona del usuario (upsert; precargado si ya existe), "¿Qué tanto te molestó hoy?" 1 a 5 sin colores por valor, notas ≤ 500, historial cronológico de 14 días, línea estática del 911 siempre visible; estados vacío, carga y error (con error de consulta no se muestra el formulario para no sobrescribir el registro de hoy).
- `/citas` (P5): alta (título, fecha y hora locales, notas ≤ 300), próximas ascendentes con fecha larga y hora 12 h, "Anteriores" discreta, eliminación con confirmación; estados vacío, carga y error. 206 tests de Vitest.
- Los formularios guardan en el cliente lo enviado para recuperarlo si la acción falla (React 19 reinicia el formulario al terminar); el estado de `useActionState` solo lleva `status` y `code`, porque viaja al servidor en el siguiente envío.
- Aislamiento de citas y síntomas (P5, 30 sept 2026): como `authenticated` con la cuenta de pruebas contra filas ficticias de la demo, `13/13` (no ve, no modifica, no borra, no inserta a su nombre; el upsert sobre el registro de la demo da `insufficient_privilege`), con rollback.
- Prueba de dos cuentas contra el Supabase real (`supabase/verify-cross-user.sql`): `RESULTADO: 9/9 pruebas OK` el 30 sept 2026, tras la migración `20260930041030` (la prueba 9 ahora espera `permission denied` para `anon`). Repetir tras cada migración. Último: `9/9` el 4 nov 2026 tras `20261104182929`; la prueba 5 usa `now() + 1 hora` porque con el mismo instante la restricción única se revisa antes que la FK.
- Auth (demo): Confirm email desactivado, registro cerrado, 2 cuentas demo creadas desde el dashboard, solo datos ficticios.
- Pase visual (P6, 30 sept 2026, rama `feat/pase-visual`): tokens definitivos, Inter + Source Serif 4, marca e íconos PWA en PNG, shell con barra superior y barra inferior de 4 pestañas ("Medicinas" en la pestaña, D1), login y registro rediseñados, las 4 pantallas con PageHeader por sección, tarjetas, avisos neutros, estados vacío/carga/error y escala de síntomas con palabras (D2). Solo presentación: lógica, acciones y `lib/**` sin cambios (salvo un comentario); 206 tests en verde. Sistema en `docs/diseno.md`.
- Fluidez (P6.5, 30 sept 2026, rama `feat/fluidez`): la pestaña tocada se ve activa en el siguiente frame (`onNavigate`; sin precarga, 4 ms contra 1.2 s de la ruta real con Slow 4G) y una sola barra se desliza entre columnas (D3); el esqueleto de `loading.tsx` es invisible los primeros 150 ms; el contenido entra con `screen-enter` (240 ms, sin transform residual, no se repite con acciones ni con `router.refresh()`); avisos y filas nuevas de horario entran con `enterFromAbove`; foco al horario nuevo y al anterior al quitar; `ease-out-strong` en botones y DeleteConfirm; aguja sin quiebre en el 65%. Solo CSS e interfaz; 206 tests sin cambios.
- Demo freeze (P7, 30 sept 2026, rama `chore/demo-freeze`): `/registro` explica que las cuentas son por invitación (sin formulario; `signupAction` sigue exportada sin uso) y `AuthFrame` acepta `footer` opcional. Cuenta demo vaciada y sembrada por SQL de datos (no migración, no commiteado): Anastrozol 8:00 a.m. y Calcio y vitamina D 9:00 a.m. desde el 1 sept, dosis del 30 sept al 13 oct (hoy la de 8:00 tomada), 3 citas (2 próximas, 1 anterior) y 6 registros de síntomas (24 a 29 sept). QA en 390 px con build de producción en UTC.
- Dosis continuas y profiles (4 nov 2026, rama `fix/dosis-continuas`): relleno al abrir /hoy (SCHED-01) y trigger de `profiles` con backfill (DB-02), migración `20261104182929`. Verificado en la base real con rollback: 3 rellenos = 28 dosis (no 84), duplicado directo rechazado, usuario nuevo con fila en `profiles`. 219 tests de Vitest. Los días en que no se abre /hoy no se generan (no hay historial que llenar); al abrirlo se rellena desde hoy.
- Apoyo y surtido (P9, 4 nov 2026, rama `feat/apoyo-y-surtido`): /apoyo por WhatsApp (ADR D-WA), entrada "Apoyo" en la barra superior ("Cerrar sesión" pasa a "Salir" para caber a 360 px en una línea) y tarjeta fija en /hoy; surtido por medicamento (migración `20261104191718`) con línea y editor en /medicamentos y tarjeta en /hoy a 7 días o menos. QA con Playwright a 390/360 px, zoom 200% y reduced motion sobre una ruta temporal no commiteada. `verify-cross-user` 9/9 y prueba de surtido 5/5 con rollback. 259 tests de Vitest. Diferido a P10.5: ilustración del sobre ("Apoyo listo").
- Para mi cita (P10, 5 nov 2026, rama `feat/para-mi-cita`): /citas/resumen, hoja imprimible con medicamentos, dosis que no marqué, cómo me sentí y lo que quiero preguntar (notas de la cita). Sin migraciones. Entradas: tarjeta "Para mi cita" y "Preparar resumen" en cada cita próxima. 292 tests de Vitest. Verificado en 390, 360 y 195 px (zoom 200%) y en vista de impresión aproximada; falta probar "Imprimir o guardar PDF" en el iPhone con la PWA instalada y con el diálogo de impresión real.
- Reconocimiento sereno y pase premium (P10.5, 5 nov 2026, rama `feat/reconocimiento-sereno`): catálogo de `docs/marca.md` §3 aplicado (dosis marcada y Deshacer, "Listo por hoy.", síntomas guardados, apoyo listo, cita pasada "Ya fue tu cita" con ícono de calendario y notas editables, primer medicamento, hitos de uso de 7 y 30 días), 5 ilustraciones en los estados vacíos y pase premium (3 niveles de texto, `tabular-nums`, sin desborde a 195 px). Sin migraciones, dependencias ni almacenamiento nuevo. Decisión D4 en `docs/diseno.md` (marcar una dosis ya anima la forma del check). 314 tests de Vitest (22 nuevos: `day-closed`, `usage-milestone`). QA con una ruta temporal no commiteada, en el navegador integrado a 390, 360 y 195 px; **sin verificar**: reduced motion emulado, iPhone con la PWA instalada, marcado real contra Supabase, redirección real del primer medicamento, hitos con cuenta real y VoiceOver. Pendiente: revisión profesional del copy nuevo (marcado `[PENDIENTE REVISIÓN PROFESIONAL]`) y qué hacer con el conteo "Marcaste n de m dosis" frente a la regla 1 del Reconocimiento sereno.
- Opening (14 oct 2026, rama `feat/opening-animation`): telón "Brújula y resguardo", una vez por sesión del navegador. La frase "Tu espacio personal y seguro de seguimiento" queda aceptada para la demo; el aviso de privacidad (LFPDPPP) se escribe antes de usuarios reales.
- El freeze de la presentación del 30 sept 2026 terminó el 14 oct 2026. `main` vuelve a recibir actualizaciones de la app. El push sigue pidiendo confirmación de Rafa: un merge a `main` en el remoto despliega a producción.

### ADR D-WA · Apoyo por WhatsApp (4 nov 2026)
- **Contexto:** el diferenciador para LSH es conectar a la paciente con los apoyos de la organización aliada (traslado, medicamento, estudios, apoyo emocional). Rumbo es un proyecto escolar independiente, no de la organización.
- **Decisión:** la solicitud sale desde el WhatsApp de la persona (`https://wa.me/<número>?text=...`) con una frase fija por opción ("Hola, uso Rumbo y quisiera información sobre apoyo para …"). Ella la ve en Rumbo y la edita en WhatsApp antes de enviar. Número en `NEXT_PUBLIC_SUPPORT_WHATSAPP`; sin él, el botón se oculta y nunca se usa un número inventado. Los textos dicen "la organización", sin su nombre ni logo.
- **Descartado:** formulario propio que guarde solicitudes (nueva tabla con datos sensibles, aviso de privacidad y consentimiento) y compartir datos con la organización.
- **Consecuencias:** Rumbo no guarda ni comparte la solicitud; el texto del enlace pasa por los servidores de WhatsApp, por eso nunca lleva nombre de medicamento, diagnóstico, notas ni texto libre. Cambiar el número requiere redeployar. No se puede saber si la solicitud se envió ni darle seguimiento.

Hallazgos abiertos:
- **AUTH-01**: Confirm email desactivado y registro cerrado durante la demo (cuentas creadas desde el dashboard). Antes de usuarios reales: reabrir el registro solo con Confirm email activo, crear la ruta de confirmación (exchangeCodeForSession o verifyOtp) y configurar SMTP propio; con Confirm email desactivado se puede saber si un correo tiene cuenta.
- **AUTH-02**: protección de contraseñas filtradas (HaveIBeenPwned) desactivada; requiere plan Pro de Supabase.

Cerrados: **SEC-01** (mensajes por código y validación en servidor) y **UI-01** (modo claro forzado; modo oscuro completo post-presentación) en fix/base-segura; **DB-01** (`doses.medication_id` NOT NULL) y **DB-03** (sin grants para `anon`; `authenticated` solo SELECT/INSERT/UPDATE/DELETE) en la migración `20260930041030` de feat/medicamentos; **PWA-01** (`app/apple-icon.png` y PNG 192/512/maskable en el manifest) en feat/pase-visual; **SCHED-01** (relleno de dosis al abrir /hoy, `lib/dose-topup.ts`) y **DB-02** (trigger de `profiles` + backfill) en la migración `20261104182929` de fix/dosis-continuas.
