# Lead Management SaaS — Plan

## Decisions
- Tenant: solo user (1 signup = 1 workspace)
- Billing: none for v1
- Stack: Next.js (App Router) + Postgres
- ORM: Drizzle
- Auth: Auth.js, email + password only
- Data flow: Server Components (reads) + Server Actions (writes), Zod validation
- Hosting: Vercel + Neon Postgres
- UI: Tailwind + shadcn/ui

## Architecture
```
app/
  (auth)/login, register
  (app)/dashboard, leads, leads/[id], projects, projects/[id], customers, customers/[id], settings
  api/auth/[...nextauth]
lib/
  db/        schema.ts, client.ts, migrations/
  auth.ts    Auth.js config
  actions/   leads.ts, projects.ts, customers.ts, notes.ts, activities.ts, reminders.ts, import-export.ts
  validators/ zod schemas
components/  ui/ (shadcn), leads/, projects/, pipeline/, dashboard/
```
- Every query/mutation scoped by `userId` from session. No cross-tenant access.
- Server Actions: validate (zod) → auth check → db → `revalidatePath`.

## Data Model
```
users        id, email, password_hash, name, created_at
projects     id, user_id, name, description, archived, created_at
leads        id, user_id, project_id?, name, email, phone, company, source,
             status (new|contacted|qualified|proposal|won|lost), position, created_at
tags         id, user_id, name
lead_tags    lead_id, tag_id
customers    id, user_id, lead_id?, name, email, phone, company, created_at
notes        id, user_id, lead_id, body, created_at
activities   id, user_id, lead_id, type (call|email|meeting), summary, occurred_at
reminders    id, user_id, lead_id, title, due_at, done
```
Indexes: `(user_id)` on all tenant tables; `(user_id, status)` on leads.

## Phases

### 1. Foundation
- Scaffold Next.js (TS, Tailwind, shadcn), Drizzle + Neon, migrations
- Auth.js credentials: register, login, logout, session, protected layout
- App shell: sidebar nav, empty pages

### 2. Projects + Leads (core)
- Projects CRUD, archive
- Leads CRUD, status field, assign to project, source
- Tags CRUD + attach to lead
- Leads list w/ search + filters (status, project, source, tag)

### 3. Lead Detail
- Notes (add/edit/delete)
- Activity log (call/email/meeting)
- Reminders w/ due date, mark done

### 4. Pipeline
- Kanban by status, drag-and-drop (dnd-kit) → update status + position

### 5. Customers
- Convert lead → customer
- Customer profile, linked projects/leads

### 6. Dashboard
- Counts by status, conversion rate (won / total), upcoming reminders

### 7. Import / Export
- CSV import (papaparse, column mapping, validation report)
- CSV export (filtered leads)

### 8. Ship
- Vercel deploy, Neon prod DB, env vars
- Basic error boundaries, loading states
- Seed script for dev

## Testing
- Vitest: validators, action logic (mock db)
- Playwright: auth flow, lead CRUD, kanban drag smoke test

## Out of Scope (v1)
- Teams/roles, billing, email sending, public API, OAuth
