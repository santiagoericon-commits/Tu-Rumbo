# Rumbo

Base inicial de una PWA para acompañar a personas en remisión oncológica con seguimiento de tratamiento.

## Requisitos

- Node.js 20+
- npm
- Proyecto de Supabase

## Configuración

1. Instala dependencias:

```bash
npm install
```

2. Crea variables de entorno a partir de `.env.example`:

```bash
cp .env.example .env.local
```

3. Llena estas variables en `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Base de datos (Supabase)

Este repositorio incluye una migración en:

- `supabase/migrations/20260922171500_init_rumbo.sql`

Para aplicarla con Supabase CLI:

```bash
supabase db push
```

También puedes ejecutar el SQL manualmente en el SQL Editor de Supabase.

## Desarrollo

```bash
npm run dev
```

Abre `http://localhost:3000`.

## Scripts

- `npm run dev` - servidor de desarrollo
- `npm run build` - build de producción
- `npm run lint` - lint con ESLint
