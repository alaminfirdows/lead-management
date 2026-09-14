# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

Scaffolded. Foundation phase (auth + app shell) is in place: Auth.js credentials login/register/logout, protected `(app)` shell with sidebar nav, empty placeholder pages for dashboard/leads/projects/customers/settings. `project-plan.md` is still the source of truth for scope, data model, and phase order — read it before starting Phase 2+ (Projects + Leads).

No database is provisioned in this environment (`DATABASE_URL` unset). Pages that call `requireUser()`/`db` cannot be smoke-tested locally without a real Neon connection string in `.env.local`.

## Stack

Next.js 16 App Router (TS) · Postgres on Neon (`@neondatabase/serverless`, `drizzle-orm/neon-serverless`) · Drizzle ORM · Auth.js v5 beta (credentials: email+password only) · Tailwind v4 + shadcn/ui (base-nova / Base UI style) · Zod v4 · dnd-kit (kanban, not yet added) · papaparse (CSV, not yet added) · Vitest (+ Playwright, not yet added) · pnpm · Vercel.

## Commands

```bash
pnpm dev                        # next dev
pnpm build && pnpm start        # production build/run
pnpm lint                       # eslint
pnpm typecheck                  # tsc --noEmit
pnpm test                       # vitest run
pnpm test:watch                 # vitest watch mode
pnpm db:generate                # drizzle-kit generate — emit migration from lib/db/schema.ts
pnpm db:migrate                 # drizzle-kit migrate — apply to DATABASE_URL
pnpm db:studio                  # drizzle-kit studio
pnpm dlx shadcn@latest add <c>  # add a shadcn component
```

Single-file/test-name runs: `pnpm exec vitest run path/to/file.test.ts`, `pnpm exec vitest run -t "test name"`.

## Directory layout

```
app/
  (auth)/            layout.tsx (redirects logged-in users), login/, register/
  (app)/             layout.tsx (requireUser + sidebar shell), dashboard/, leads/,
                     projects/, customers/, settings/ — each with page.tsx +
                     loading.tsx + error.tsx
  api/auth/[...nextauth]/route.ts
  layout.tsx         root layout, fonts, ThemeProvider, metadata template
  page.tsx           redirects to /dashboard or /login based on session
  error-fallback.tsx shared client error UI used by route error.tsx boundaries
lib/
  db/                schema.ts, client.ts (neon-serverless pool + drizzle), migrations/
  auth.config.ts     DB-free Auth.js config (safe for proxy.ts / edge)
  auth.ts            full Auth.js config incl. Credentials provider (db-backed)
  auth-helpers.ts    requireUser() (redirects to /login), getOptionalUser() (React cache)
  actions/           one file per entity — auth.ts done, leads/projects/customers/… TODO
  validators/        Zod schemas shared by actions and forms
  nav.ts             sidebar nav item definitions (title/href/icon)
  utils.ts           cn() re-export
components/
  ui/                shadcn-generated (base-nova/Base UI) — don't hand-edit heavily
  auth/              login-form.tsx, register-form.tsx (client, useActionState)
  app-sidebar.tsx    client sidebar (nav + NavUser), theme-provider.tsx
  nav-user.tsx       client dropdown: account info, settings link, logout form
hooks/
  use-mobile.ts      sidebar collapse breakpoint hook
types/
  next-auth.d.ts     module augmentation for session.user.id typing
proxy.ts             Node-runtime middleware — auth-page/redirect gate only, UX-only
drizzle.config.ts    drizzle-kit config (schema path, migrations out dir, DATABASE_URL)
vitest.config.ts     vitest config (path aliases, environment)
```

Tests are colocated next to the code they cover as `*.test.ts` (e.g. `lib/validators/auth.test.ts`, `lib/db/errors.test.ts`) — not under a separate `__tests__/` tree.

## Architecture rules

- **Single-tenant-per-user.** Every table (except `users`) carries `user_id`; every query and mutation MUST filter by `userId` from the Auth.js session. No exceptions, no cross-tenant reads.
- **Reads = Server Components, writes = Server Actions.** No client-side fetching for CRUD. Server Action shape: Zod validate → auth check (`requireUser()`) → Drizzle → `revalidatePath`.
- **Layout:** `app/(auth)/` login/register; `app/(app)/` protected shell (dashboard, leads, projects, customers, settings); `lib/db/` schema + client + migrations; `lib/actions/` one file per entity; `lib/validators/` Zod schemas shared by actions and forms; `components/ui/` is shadcn-generated (don't hand-edit heavily).
- **Lead status enum:** `new|contacted|qualified|proposal|won|lost`. `position` column drives kanban ordering within a status column.
- **Customer** is a converted lead (`customers.lead_id` nullable FK). Conversion is a distinct action, not a status.
- Indexes: `(user_id)` on all tenant tables, `(user_id, status)` on leads — add in schema, not ad hoc.
- `lead_tags` (the leads↔tags join table) carries its own `user_id` too, per the single-tenant-per-user rule above. Attach/detach actions must verify the requesting user owns *both* the lead and the tag (not just stamp `user_id` on the join row) before writing.

## Stack notes / Next 16 gotchas

- `proxy.ts` (not `middleware.ts`) runs on the **Node runtime** and only does UX redirects (logged-in → away from `/login`/`/register`, logged-out → to `/login?callbackUrl=…`) using the DB-free `auth.config.ts`. It is **not** the security boundary — every Server Action and every data-reading page MUST still call `requireUser()`/check session `userId` itself.
- `params`, `searchParams`, `cookies()`, and `headers()` are all **async** now — `await` them (e.g. `const { callbackUrl } = await searchParams` in a page whose prop type is `Promise<{...}>`).
- Call `redirect()` **outside** try/catch — it throws a special `NEXT_REDIRECT` control-flow error; catching `AuthError` around `signIn()` must not also swallow a subsequent `redirect()`.
- `revalidateTag` now takes 2 args in some contexts — check current signature before use; not used yet in this codebase.
- `next build` no longer runs ESLint as part of the build — `pnpm lint` is a separate required step (see below).
- Keep `cacheComponents` off in `next.config.ts`. `(app)/layout.tsx` calls `auth()`/`requireUser()` directly in a Server Component; enabling Cache Components would require wrapping dynamic reads in Suspense/`"use cache"` boundaries we haven't built yet.
- Auth.js config is split: `lib/auth.config.ts` has **no** db/bcrypt imports (safe for `proxy.ts`); `lib/auth.ts` adds the `Credentials` provider and is the only place that touches Drizzle for auth. Never import `lib/auth.ts` from `proxy.ts`.
- Zod is v4: use `z.email()` (not `z.string().email()`), `z.flattenError(error)` (not `error.flatten()` as a zod-v3-style method in some helpers — check per-call), etc.
- shadcn components here are the **base-nova / Base UI** style, not Radix: use `render={<Link href=… />}` instead of `asChild` for polymorphic components (`SidebarMenuButton`, `DropdownMenuItem`, `DropdownMenuTrigger`, etc.), and the `Field`/`FieldGroup`/`FieldLabel`/`FieldError` primitives instead of bare `Label` for form fields. Check the actual component file in `components/ui/` for prop names before using — they differ from upstream shadcn/Radix docs.
- DB driver is `@neondatabase/serverless` + `drizzle-orm/neon-serverless` (`Pool`-based), which supports real transactions (unlike the HTTP-only neon driver) — use `db.transaction()` where multi-statement writes need atomicity (e.g. future lead↔customer conversion).
- `next-auth` is pinned to a `5.0.0-beta.x` release — re-check the changelog before bumping; the beta API can change between minors.
- eslint is pinned to `^9` (not the `eslint@10` "latest" tag): `eslint-config-next@16.3.4`'s `eslint-plugin-react@7.37.5` dependency throws (`contextOrFilename.getFilename is not a function`) under ESLint 10 because it still calls the removed `context.getFilename()` API. Don't bump eslint past 9.x until upstream `eslint-plugin-react`/`eslint-config-next` publish ESLint-10-compatible releases.
- Never set `debug: true` on the Auth.js config in production — `@auth/core`'s debug logger prints the raw callback request body, which for the Credentials provider includes the plaintext password. Use the scoped `logger.error` override in `lib/auth.config.ts` instead of `debug` if you need more visibility into auth failures.

## Out of scope for v1 (don't build)

Teams/roles, billing, email sending, public API, OAuth providers.
