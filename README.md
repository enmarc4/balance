# Balance MVP

Sprint 1 implementation for a mobile-first personal finance app with:

- Next.js 16 + App Router + TypeScript
- Locale routing with `ca`, `es`, `en` (`/[locale]/...`)
- Supabase Auth + PostgreSQL base schema + RLS policies
- Onboarding + account management (create, edit, archive)
- Foundation for transactions with `name` + `category`
- Home quick-entry flow with category search chips, optional notes and field-level validation

## 1. Install

```bash
npm install
```

## 2. Configure env

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_ANON_KEY"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 3. Apply SQL schema in Supabase

Run `supabase/schema.sql` in Supabase SQL editor.

This creates:

- `profiles`
- `accounts`
- `categories`
- `transactions`
- `recurrences`
- RLS policies for all user-owned tables

## 4. Run locally

```bash
npm run dev
```

Main routes:

- `/ca/login`, `/es/login`, `/en/login`
- `/{locale}/register`
- `/{locale}/forgot-password`
- `/{locale}/onboarding`
- `/{locale}/app`
- `/{locale}/app/accounts`
- `/{locale}/app/settings`

## 5. Quality checks

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
```

## i18n contract

- Messages live in `i18n/messages.ts`.
- Components should use translation keys, not inline product copy.
- Locale default is `ca`, with browser locale detection handled by `proxy.ts`.

## Notes

- If Supabase env vars are missing, auth/data routes show setup warnings.
- Currency conversion between accounts is intentionally out of Sprint 1 scope.
