# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

Greenfield. Only `project-plan.md` exists — read it first; it is the source of truth for scope, data model, and phase order. No code, no git history, no package.json yet. Update this file once scaffolding lands (real scripts, actual dir layout).

## Planned stack (from project-plan.md)

Next.js App Router (TS) · Postgres on Neon · Drizzle ORM · Auth.js (credentials: email+password only) · Tailwind + shadcn/ui · Zod · dnd-kit (kanban) · papaparse (CSV) · Vitest + Playwright · Vercel.

## Expected commands (once scaffolded — verify against package.json)

```bash
npm run dev                 # next dev
npm run build && npm start
npm run lint
npx drizzle-kit generate    # emit migration from lib/db/schema.ts
npx drizzle-kit migrate     # apply to DATABASE_URL
npx drizzle-kit studio
npx vitest                  # unit: validators, action logic (mock db)
npx vitest run path/to/file.test.ts
npx playwright test         # e2e: auth, lead CRUD, kanban drag
npx playwright test tests/auth.spec.ts
npx shadcn@latest add <component>
```

## Architecture rules

- **Single-tenant-per-user.** Every table (except `users`) carries `user_id`; every query and mutation MUST filter by `userId` from the Auth.js session. No exceptions, no cross-tenant reads.
- **Reads = Server Components, writes = Server Actions.** No client-side fetching for CRUD. Server Action shape: Zod validate → auth check (session userId) → Drizzle → `revalidatePath`.
- **Layout:** `app/(auth)/` login/register; `app/(app)/` protected shell (dashboard, leads, projects, customers, settings); `lib/db/` schema + client + migrations; `lib/actions/` one file per entity; `lib/validators/` Zod schemas shared by actions and forms; `components/ui/` is shadcn-generated (don't hand-edit heavily).
- **Lead status enum:** `new|contacted|qualified|proposal|won|lost`. `position` column drives kanban ordering within a status column.
- **Customer** is a converted lead (`customers.lead_id` nullable FK). Conversion is a distinct action, not a status.
- Indexes: `(user_id)` on all tenant tables, `(user_id, status)` on leads — add in schema, not ad hoc.

## Out of scope for v1 (don't build)

Teams/roles, billing, email sending, public API, OAuth providers.
