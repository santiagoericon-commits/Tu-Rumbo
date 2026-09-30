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

Variables: solo `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Se incrustan en build; si cambian en Vercel, hay que redeployar.

## Mapa del código

| Ruta | Qué es |
|---|---|
| `proxy.ts` | Refresco de sesión (`@supabase/ssr`, Next 16) y redirección de rutas protegidas. **Protegido** |
| `lib/supabase/server.ts`, `lib/supabase/client.ts` | Clientes de Supabase servidor/navegador. **Protegidos** |
| `app/auth-actions.ts` | Login, registro, logout (Server Actions). **Protegido** |
| `app/(protected)/layout.tsx` | Segunda capa de auth + header/nav |
| `app/(protected)/{hoy,medicamentos,citas,sintomas}/page.tsx` | Pantallas del MVP |
| `app/layout.tsx` | Root layout con footer "Rumbo no sustituye la atención médica." (**no quitar**) |
| `app/manifest.ts`, `public/sw.js`, `app/service-worker-register.tsx` | PWA |
| `supabase/migrations/` | Esquema. **Nunca editar una migración aplicada**; crear una nueva |
| `lib/auth-messages.ts`, `lib/auth-validation.ts` | Diccionario cerrado de mensajes de auth y validación de credenciales |
| `lib/timezone.ts` | Zona del usuario: `DEFAULT_TZ` (America/Mazatlan), `TIME_ZONE_PATTERN`, `isValidTimeZone`, `resolveTimeZone`. Puro (lo usa también el cliente) |
| `lib/timezone.server.ts` | `getUserTimeZone()`: lee la cookie `tz` en el servidor y la resuelve |
| `lib/local-time.ts` | Primitivas de hora local: `localParts`, `offsetMs`, `formatLocalDate` ("YYYY-MM-DD"), `addDaysIso`, `localDateTimeToInstant` (hora repetida → primera ocurrencia; hora inexistente → se recorre hacia adelante). Solo `Intl`. Solo cambia con tests |
| `lib/date-range.ts` | `getDayRange(tz, now)`, `formatTime`, `formatDayHeading`, `formatLongDate` ("martes, 6 de octubre"; con año si no es el año local en curso). Solo `Intl`. Lógica de tiempo: solo cambia con tests |
| `lib/dose-schedule.ts` | `generateDoseInstants`: dosis de 14 días desde la fecha de inicio, en la zona del usuario, nunca en el pasado. Solo cambia con tests |
| `lib/medication-validation.ts`, `lib/medication-messages.ts` | Validación en servidor del formulario de medicamento (nombre 1–80, dosis ≤ 60, 1–4 horarios HH:MM, inicio hoy..+365) y diccionario cerrado de sus errores |
| `lib/schedule-format.ts` | Texto de horarios ("8:00 a.m. y 8:00 p.m."), de fecha de calendario (`formatCalendarDate`: "martes, 29 de septiembre") y de fecha de inicio ("Desde el martes, 29 de septiembre") |
| `lib/ids.ts` | `isUuid` |
| `lib/form-text.ts` | `normalizeMultiline`: el textarea envía `
` pero `maxLength` cuenta uno; se normaliza antes de medir |
| `lib/symptom-validation.ts`, `lib/symptom-messages.ts` | Validación del registro diario (valor `"1"`–`"5"`, notas ≤ 500) y diccionario cerrado de errores + aviso de guardado |
| `lib/appointment-validation.ts`, `lib/appointment-messages.ts` | Validación de la cita (título 1–80, fecha hoy..+730, hora HH:MM, notas ≤ 300) y diccionario cerrado de errores |
| `lib/appointment-list.ts` | `partitionAppointments`: próximas (≥ ahora, ascendente) y anteriores (la más reciente primero) |
| `lib/dose-status.ts`, `lib/dose-summary.ts` | Validación de la acción de dosis (UUID + taken/pending, nunca missed) y texto del resumen de `/hoy` |
| `app/(protected)/medicamentos/{actions,medication-form,medication-item}.tsx` | Alta (inserta medicamento + dosis; si fallan las dosis borra el medicamento) y eliminación con confirmación |
| `app/(protected)/sintomas/` | Registro diario: upsert por `(user_id, log_date)` con `log_date` calculado en servidor; 5 opciones del mismo color; historial de 14 días; `safety-note.tsx` (línea estática del 911, también en `error.tsx`) |
| `app/(protected)/citas/` | Alta con fecha y hora locales (`localDateTimeToInstant`), próximas/anteriores y eliminación con confirmación |
| `components/time-zone-sync.tsx` | Escribe la cookie `tz` desde el navegador y hace un solo `router.refresh()` si cambió |
| `components/submit-button.tsx` | Botón de envío compartido con `useFormStatus` |

## Patrones obligatorios

- Leer con **Server Components**; escribir con **Server Actions**.
- Server Actions confían en RLS para filtrar, pero toman `user_id` de `supabase.auth.getUser()`, nunca del formulario.
- Validar en el servidor. El formulario puede validar también, pero no es la defensa.
- Ruta protegida nueva: va bajo `app/(protected)/` **y** se agrega a `protectedRoutes` en `proxy.ts`.
- Botón de envío compartido con `useFormStatus`.
- Tras mutar, revalidar con la API vigente de Next 16. Verificar APIs contra la documentación de la versión instalada, no de memoria.
- Estados de carga, error y vacío en toda pantalla con datos.
- Sin `any`. Componentes < ~150 líneas; lógica pura en `lib/`.
- Tailwind con tokens en `@theme` de `app/globals.css`; nada de colores hardcodeados en `style=`. Tokens semánticos: `surface`, `surface-muted`, `ink`, `ink-muted`, `line`, `accent`, `accent-ink` (valores neutros provisionales; P6 los cambia). Pantallas nuevas usan solo estos tokens, sin `zinc-*`/`green-*`.

## Tiempo (crítico)

El servidor corre en UTC. "Hoy" y las horas de dosis se calculan en la zona del usuario: `Intl.DateTimeFormat().resolvedOptions().timeZone` del navegador (cookie o `profiles`), fallback `America/Mazatlan`. En DB todo es `timestamptz`. Tests obligatorios: dosis 23:30 y 00:15, día UTC distinto al local, varias dosis al día, zona distinta al fallback, Tijuana en cambio de horario.

La PC de desarrollo está en hora de Mazatlán y oculta bugs: `npm test` ya corre en UTC; la verificación visual de lógica de tiempo va con el dev server en UTC (PowerShell `$env:TZ="UTC"; npm run dev` · Git Bash `TZ=UTC npm run dev`), más una revisión en el preview de Vercel.

Horarios de medicamento: hora de pared local (`medications.schedule_times time[]`) + fecha local de inicio (`start_date date`); las dosis se generan como instantes UTC con `lib/dose-schedule.ts`. Cambio de horario: hora repetida → primera ocurrencia; hora inexistente → se recorre hacia adelante (02:30 → 03:30).

Horas en 12 h como las da `Intl` es-MX ("8:05 a.m."). Una dosis pendiente de ayer no aparece en "hoy". La app nunca asigna `missed`; si existe, se muestra como pendiente.

## Esquema (reglas)

- Toda tabla nueva: RLS habilitado **y** revocar `ALL` a `anon` y `TRUNCATE, REFERENCES, TRIGGER` a `authenticated` (los privilegios por defecto de Supabase se los dan a cada tabla nueva).
- Relación entre tablas del mismo usuario: **FK compuesta `(id, user_id)`** (las FK no aplican RLS).
- Políticas solo `to authenticated`, con `(select auth.uid())`.
- Índices en las columnas que filtra RLS.
- Migración nueva `YYYYMMDDHHMMSS_descripcion.sql`. **Mostrar el SQL completo y esperar aprobación antes de escribirlo o correrlo.** Nunca `supabase db push` sin aprobación.
- Procedimiento (evita desalinear el historial): aplicar con `apply_migration` del MCP → `list_migrations` → crear el archivo local con la versión exacta que registró y el mismo SQL. Nunca nombrar el archivo antes de aplicar.

Tablas: `profiles` (sin trigger de creación), `medications` (`schedule_times time[]` de 1 a 4, `start_date date`), `doses` (FK compuesta a `medications`, `medication_id` NOT NULL, `status` pending/taken/missed), `appointments`, `symptom_logs` (`log_date` único por usuario, `severity` 1 a 5 de autorreporte).

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
| "Tus síntomas son normales/graves" | "Registro guardado. Puedes mostrarlo a tu equipo médico en tu próxima cita" |
| "Adherencia", "cumplimiento" | "Tus dosis", "tu registro" |
| "Lucha", "batalla", "guerrero/a" | "tu tratamiento", "tu seguimiento" |
| "Cura", "libre de cáncer", "evita la recaída" | "te ayuda a llevar el registro de tu tratamiento" |
| "Diagnóstico", "evaluación" | "registro", "seguimiento" |
| "Alerta" (v1) | "recordatorio" |
| "Gravedad", "severidad" | "¿Qué tanto te molestó hoy?" (1 = poco, 5 = mucho) |

Línea estática propuesta para `/sintomas` (pendiente de revisión profesional): "Si algo te preocupa, comunícate con tu equipo médico. En una emergencia, llama al 911."

Tono: español de México, sereno, cálido, sin culpa, sin dramatismo. Hablarle de "tú".

## UI

- 390px primero (modo dispositivo de DevTools; Chrome no deja la ventana tan angosta) y teléfono real. Objetivos táctiles ≥ 44px, texto base ≥ 16px, contraste AA, `label` en todo input.
- iOS: las notificaciones push de una PWA solo funcionan si la app está instalada en la pantalla de inicio; el onboarding debe explicarlo cuando exista push (v2). Para iOS hace falta `app/apple-icon.png`.
- Modo oscuro: soportado completo con tokens o forzado a claro con `color-scheme: light`. Nunca a medias.
- Dirección visual: la del mockup del equipo (Source Serif 4 + Inter vía `next/font`, fondo blanco, sage/pine, acentos pine/coral/sky/plum). Coral nunca para síntomas.

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
- Supabase: migraciones `20260922171500`, `20260922230000` y `20260930041030` aplicadas. Historial reparado el 28 sept 2026 (las dos primeras estaban registradas con otras versiones; SQL idéntico). Desde P4, migraciones con el procedimiento de "Esquema (reglas)".
- `/hoy` (P3): dosis del día en la zona del usuario (cookie `tz`, fallback America/Mazatlan), ordenadas; marcar como tomada y deshacer con `useOptimistic` + `useFormStatus`; resumen neutro; estados vacío, carga y error.
- `/medicamentos` (P4): lista (nombre, dosis, horarios en 12 h, "Desde el…"), alta con 1 a 4 horarios y fecha de inicio (redirige a `/hoy`), eliminación con confirmación (cascade a sus dosis); estados vacío, carga y error. 150 tests de Vitest (zonas, 23:30/00:15, Tijuana 23 h/25 h y horas inexistente/repetida, ventana de 14 días, validación, formato 12 h, auth).
- `/sintomas` (P5): un registro por día en la zona del usuario (upsert; precargado si ya existe), "¿Qué tanto te molestó hoy?" 1 a 5 sin colores por valor, notas ≤ 500, historial cronológico de 14 días, línea estática del 911 siempre visible; estados vacío, carga y error (con error de consulta no se muestra el formulario para no sobrescribir el registro de hoy).
- `/citas` (P5): alta (título, fecha y hora locales, notas ≤ 300), próximas ascendentes con fecha larga y hora 12 h, "Anteriores" discreta, eliminación con confirmación; estados vacío, carga y error. 206 tests de Vitest.
- Los formularios guardan en el cliente lo enviado para recuperarlo si la acción falla (React 19 reinicia el formulario al terminar); el estado de `useActionState` solo lleva `status` y `code`, porque viaja al servidor en el siguiente envío.
- Aislamiento de citas y síntomas (P5, 30 sept 2026): como `authenticated` con la cuenta de pruebas contra filas ficticias de la demo, `13/13` (no ve, no modifica, no borra, no inserta a su nombre; el upsert sobre el registro de la demo da `insufficient_privilege`), con rollback.
- Prueba de dos cuentas contra el Supabase real (`supabase/verify-cross-user.sql`): `RESULTADO: 9/9 pruebas OK` el 30 sept 2026, tras la migración `20260930041030` (la prueba 9 ahora espera `permission denied` para `anon`). Repetir tras cada migración.
- Auth (demo): Confirm email desactivado, registro cerrado, 2 cuentas demo creadas desde el dashboard, solo datos ficticios.

Hallazgos abiertos:
- **AUTH-01**: Confirm email desactivado y registro cerrado durante la demo (cuentas creadas desde el dashboard). Antes de usuarios reales: reabrir el registro solo con Confirm email activo, crear la ruta de confirmación (exchangeCodeForSession o verifyOtp) y configurar SMTP propio; con Confirm email desactivado se puede saber si un correo tiene cuenta.
- **AUTH-02**: protección de contraseñas filtradas (HaveIBeenPwned) desactivada; requiere plan Pro de Supabase.
- **DB-02**: sin trigger de creación de `profiles`.
- **PWA-01**: falta `app/apple-icon.png` (iOS no usa los SVG del manifest).
- **SCHED-01**: cada medicamento genera dosis solo para 14 días desde su fecha de inicio; después deja de aparecer en /hoy. Antes de usuarios reales: generación continua (por ejemplo, extender la ventana al abrir /hoy o con un job programado).

Cerrados: **SEC-01** (mensajes por código y validación en servidor) y **UI-01** (modo claro forzado; modo oscuro completo post-presentación) en fix/base-segura; **DB-01** (`doses.medication_id` NOT NULL) y **DB-03** (sin grants para `anon`; `authenticated` solo SELECT/INSERT/UPDATE/DELETE) en la migración `20260930041030` de feat/medicamentos.
