# CLAUDE.md · Rumbo

Fuente de verdad para cada sesión de Claude Code en este repo. Si algo no está aquí o en `git log`, no cuenta.

## Qué es Rumbo

PWA en español de México que acompaña a personas en remisión de cáncer para que no abandonen tratamientos largos (ej. hormonoterapia oral de 5+ años). MVP: dosis del día (`/hoy`), medicamentos (`/medicamentos`), citas de control (`/citas`), registro diario de síntomas (`/sintomas`). v2 (fuera de alcance): push y alertas a médico/familiar.

**Rumbo no da indicaciones clínicas, no interpreta síntomas, no sugiere dosis y no sustituye la atención médica.** Ningún texto, color o flujo puede insinuar lo contrario.

Fase actual: prototipo para presentación del **miércoles 30 sept 2026**. Solo datos ficticios (cuentas demo). Nada de datos reales de pacientes hasta tener aviso de privacidad y consentimiento (LFPDPPP).

## Stack y comandos

- Next.js 16 (App Router) · React 19 · TypeScript estricto · Tailwind v4 · Supabase (`@supabase/ssr`)
- Mac + zsh. Dev en `http://localhost:3000`.

```bash
npm run dev
npm run lint && npm run build   # verificación estándar (build = chequeo de tipos)
npm test                        # cuando exista (Vitest con TZ=UTC, se agrega con /hoy)
```

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
| `lib/date-range.ts`, `lib/dose-schedule.ts` | (por crear) Lógica de tiempo. Solo cambian con tests |

## Patrones obligatorios

- Leer con **Server Components**; escribir con **Server Actions**.
- Server Actions confían en RLS para filtrar, pero toman `user_id` de `supabase.auth.getUser()`, nunca del formulario.
- Validar en el servidor. El formulario puede validar también, pero no es la defensa.
- Ruta protegida nueva: va bajo `app/(protected)/` **y** se agrega a `protectedRoutes` en `proxy.ts`.
- Botón de envío compartido con `useFormStatus`.
- Tras mutar, revalidar con la API vigente de Next 16. Verificar APIs contra la documentación de la versión instalada, no de memoria.
- Estados de carga, error y vacío en toda pantalla con datos.
- Sin `any`. Componentes < ~150 líneas; lógica pura en `lib/`.
- Tailwind con tokens en `@theme` de `app/globals.css`; nada de colores hardcodeados en `style=`.

## Tiempo (crítico)

El servidor corre en UTC. "Hoy" y las horas de dosis se calculan en la zona del usuario: `Intl.DateTimeFormat().resolvedOptions().timeZone` del navegador (cookie o `profiles`), fallback `America/Mazatlan`. En DB todo es `timestamptz`. Tests obligatorios: dosis 23:30 y 00:15, día UTC distinto al local, varias dosis al día, zona distinta al fallback, Tijuana en cambio de horario.

La Mac de desarrollo está en hora de Mazatlán y oculta bugs: tests con `TZ=UTC` y verificación visual de lógica de tiempo con `TZ=UTC npm run dev`, más una revisión en el preview de Vercel.

Horas en 12 h como las da `Intl` es-MX ("8:05 a.m."). Una dosis pendiente de ayer no aparece en "hoy". La app nunca asigna `missed`; si existe, se muestra como pendiente.

## Esquema (reglas)

- Toda tabla nueva: RLS habilitado.
- Relación entre tablas del mismo usuario: **FK compuesta `(id, user_id)`** (las FK no aplican RLS).
- Políticas solo `to authenticated`, con `(select auth.uid())`.
- Índices en las columnas que filtra RLS.
- Migración nueva `YYYYMMDDHHMMSS_descripcion.sql`. **Mostrar el SQL completo y esperar aprobación antes de escribirlo o correrlo.** Nunca `supabase db push` sin aprobación.

Tablas: `profiles` (sin trigger de creación), `medications`, `doses` (FK compuesta a `medications`, `status` pending/taken/missed), `appointments`, `symptom_logs` (`log_date` único por usuario, `severity` 1 a 5 de autorreporte).

## Privacidad y seguridad

- Datos de salud = datos personales sensibles.
- Nunca `service_role` en Server Actions, cliente ni `.env.example`. `.env*` sigue ignorado.
- Nunca mostrar `error.message` de Supabase. Mensajes por **código** con diccionario cerrado en servidor; código desconocido = mensaje genérico.
- Nada personal, de salud ni texto libre en URLs, query strings o logs.
- `public/sw.js` no cachea datos de salud.
- Señala riesgos de seguridad o privacidad aunque no te lo pidan.

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

Cambios en archivos protegidos, `app/(protected)/layout.tsx`, migraciones o lógica de tiempo: Plan Mode + `/security-review` antes del commit. En el layout protegido se conserva siempre `getUser()` + `redirect("/login")`.

## Estado (28 sept 2026)

- Hecho: scaffold, auth, `proxy.ts`, PWA base, 2 migraciones (RLS + FK compuesta). Lint y build en verde.
- Placeholder: las 4 pantallas del MVP.
- Prueba de dos cuentas: pasa en Postgres local con stubs de `auth`; **pendiente contra el Supabase real** con `supabase/verify-cross-user.sql` (esperado: `RESULTADO: 9/9 pruebas OK`). Repetir tras cada migración.

Hallazgos abiertos:
- **SEC-01**: `auth-actions.ts` pone `error.message` en la URL y login/registro renderizan cualquier `?error=`/`?success=` (inyección de mensajes falsos).
- **UI-01**: en modo oscuro, `body {}` sin capa en `globals.css` le gana a Tailwind; texto claro sobre tarjetas blancas.
- **DB-01**: `doses.medication_id` acepta NULL (dosis huérfanas).
- **DB-02**: sin trigger de creación de `profiles`.
- **PWA-01**: falta `app/apple-icon.png` (iOS no usa los SVG del manifest).
