# Complete Admin & Security Build Prompt

Paste this prompt into Lovable to generate the entire protected admin section — **Reports, Blocked Domains, Spam Audit Log, and Security Events** — with production-grade security monitoring and access controls.

---

## Project context

This is a TanStack Start v1 + React 19 + Tailwind CSS v4 + Lovable Cloud (Supabase) portfolio site. The existing design uses a **Royal Blue** (`#2563eb`) accent on a soft white background, shadcn/ui components, `Section` / `SectionHeader` layout primitives, and subtle `Reveal` entrance animations. The site already has Supabase Auth, an admin role system (`public.user_roles`), visitor tracking, an AI chatbot, newsletter subscriptions, and email delivery through Lovable email.

You are extending the admin section with four protected surfaces and a security monitoring layer. Follow the existing design system exactly. Do not change global colors or navigation behavior unless instructed here.

---

## 1. Requirements

### A. Admin access model (applies to every page)

- Every admin page lives under `/admin/*` and is wrapped by the existing `_authenticated` layout (which redirects signed-out users to `/auth`).
- Each route also checks `useAuth().isAdmin` and renders a **Restricted** card for signed-in non-admins.
- Every admin route must set `head()` metadata: `title` ending with "— Admin", `name: "robots", content: "noindex"`.
- Use **defense in depth**:
  1. RLS policies on every table: admin-only reads via `public.has_role(auth.uid(), 'admin')`; append-only log tables deny `UPDATE` and `DELETE` to everyone.
  2. Every privileged server function uses `.middleware([requireSupabaseAuth])`, verifies admin role through the caller's RLS-scoped `context.supabase`, and throws `Forbidden` otherwise.
  3. `supabaseAdmin` (service role) is imported only inside the handler body after authorization; never at module scope and never used to decide who the caller is.
- Never return raw Postgres/provider errors to the browser. Log server-side with a request id; return a short, user-facing message.

### B. Database tables to create or extend

Create these migrations (include `GRANT`, `ENABLE ROW LEVEL SECURITY`, and policies):

1. `public.blocked_email_domains` — `id uuid primary key`, `domain text not null unique`, `reason text`, `created_by uuid references auth.users`, `created_at timestamp with time zone default now()`.
2. `public.spam_audit_log` — `id uuid primary key`, `action_type text not null`, `email text`, `domain text`, `reason text`, `actor_id uuid`, `metadata jsonb default '{}'::jsonb`, `created_at timestamp with time zone default now()`.
3. `public.security_events` — `id uuid primary key`, `severity text not null check (severity in ('low','medium','critical'))`, `event_type text not null`, `ip_address text`, `user_agent text`, `target_path text`, `user_id uuid`, `user_email text`, `action_taken text`, `metadata jsonb default '{}'::jsonb`, `created_at timestamp with time zone default now()`.
4. `public.ip_blocks` — `id uuid primary key`, `ip_address text not null unique`, `reason text not null`, `severity text not null`, `metadata jsonb default '{}'::jsonb`, `created_at timestamp with time zone default now()`, `expires_at timestamp with time zone`.
5. `public.disposable_email_domains` — `domain text primary key`, `created_at timestamp with time zone default now()`.
6. `public.failed_login_attempts` — `id uuid primary key`, `email text`, `ip text`, `reason text`, `attempted_at timestamp with time zone default now()`.
7. `public.visitors` and `public.visitor_logs` — extend if needed; keep existing RLS.

Create these functions:
- `public.normalize_blocked_domain()` — BEFORE INSERT/UPDATE trigger function: lowercase, trim, reject if missing a dot (`ERRCODE '22023'`).
- `public.is_blocked_email(_email text)` — `STABLE SECURITY DEFINER` with `SET search_path = public`; matches exact and subdomains. Revoke `EXECUTE` from `PUBLIC`, `anon`, and `authenticated`; only `service_role` may call it.
- `public.reject_blocked_email()` — BEFORE INSERT/UPDATE trigger on `public.profiles` and `public.newsletter_subscribers`; raises if `is_blocked_email(email)`.
- `public.audit_blocked_domain_change()` — AFTER INSERT/UPDATE/DELETE on `blocked_email_domains`, writes `blocklist_add`, `blocklist_update`, `blocklist_remove` to `spam_audit_log` with `auth.uid()` as `actor_id`.
- `public.is_disposable_email(_email text)` — `STABLE SECURITY DEFINER`; checks `disposable_email_domains`.
- `public.is_ip_blocked(_ip text)` — `STABLE SECURITY DEFINER`; checks active `ip_blocks`.
- `public.count_recent_failed_logins(_ip text, _minutes int default 15)` — `STABLE SECURITY DEFINER`.
- `public.touch_updated_at()` — generic trigger for `updated_at`.

### C. Reports (`/reports` and `/admin/reports` if needed)

Build a server function `src/lib/reports.functions.ts` named `getReports`:
- `createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])`.
- Input: `z.object({ days: z.union([z.literal(7), z.literal(14), z.literal(30)]) })`. Also support a `24h` quick filter.
- Verify admin role through `context.supabase`.
- Load `supabaseAdmin` inside handler and aggregate in `Promise.all`:
  - KPIs: total users, active users (24h / 7d / 30d), chat messages, downloads, page visits, unique visitors.
  - Time series: visits vs unique visitors per UTC day, zero-filled for missing days.
  - Top pages, top tabs, sources, countries, devices.
  - Visitors table: `visitor_id`, `email`, `display_name`, `country`, `city`, `device`, `browser`, `os`, `total_visits`, `total_pageviews`, `first_seen_at`, `last_seen_at`, `identified`.
  - Sessions table: `user_id`, `email`, `started_at`, `duration_seconds`, `ip`.
- Cap every query with `.limit()` (max 10k) and a `gte` time filter so Worker memory is bounded.
- Return plain DTOs only.

Build the page `src/routes/_authenticated/reports.tsx`:
- Range switcher: 24h / 7d / 14d / 30d, default 7d.
- 8 KPI stat cards at top with skeleton and error states.
- Recharts visualizations: area chart for visits vs visitors; bar charts for top pages and top tabs; donut/list for sources, countries, devices.
- `TrafficAnalyticsPanel` and `IdentifiedVisitorsPanel` receive the shared payload as props; no separate client queries.
- `DataExportPanel`: CSV export of visitors, sessions, and page visits from the already-fetched payload.
- Empty state per chart: "No data for this period".

### D. Blocked Domains (`/admin/blocked-domains`)

Build `src/routes/_authenticated/admin/blocked-domains.tsx`:
- Add form: domain input + optional reason. Client validation: lowercase, no `@`, must contain a dot.
- Table: domain, reason, added by, date; delete with confirm dialog.
- Search box with server-side `ilike` and pagination at 25 rows/page.
- Refetch after each mutation so the audit trigger's effect is visible immediately.

Enforce blocklist at every layer:
- Signup / signin in `src/routes/auth.tsx` — reject before calling Supabase auth.
- Contact form in `src/routes/api/public/contact.ts` — 400 with generic message.
- Newsletter in `src/routes/api/public/newsletter.ts` — 400, no row written.
- `src/components/auth/SpamDomainGuard.tsx` in `SiteLayout` — signs out the user and shows "Access blocked" if their email domain is on the list.
- Database triggers as the last line of defense.

### E. Spam Audit Log (`/admin/spam-audit`)

Build `src/routes/_authenticated/admin/spam-audit.tsx`:
- Read from `public.spam_audit_log` through an admin-only server function.
- Filter chips by action type: `blocked_login_attempt`, `blocklist_add`, `blocklist_update`, `blocklist_remove`.
- Color-coded badges: blocked login = red, add = emerald, remove = amber, update = blue.
- Columns: action, email, domain, reason, actor, timestamp. Show `metadata` in an expandable `<pre>` block.
- Pagination at 25 rows/page with exact count; manual refresh.

Create `src/lib/spam-audit.functions.ts` with `logBlockedLoginAttempt`:
- Unauthenticated server function (caller has just been refused a session).
- Takes only `email`; never trusts client-supplied identity or IP.
- Returns `{ ok: true }` always to prevent enumeration.
- Writes `action_type = 'blocked_login_attempt'`.

### F. Security Events (`/admin/security-events`)

Create `src/lib/security-events.server.ts`:
- `getClientIp(request)` — prefer `cf-connecting-ip`, then `x-real-ip`, then first hop of `x-forwarded-for`.
- `isScannerPath(pathname)` — match `.env`, `.git/`, `wp-admin`, `xmlrpc.php`, `phpmyadmin`, `actuator`, shell/config probes, etc.
- `recordSecurityEvent(input)` — append-only write; never throws into the request path.
- `blockIp({ ip, reason, severity, ttlMinutes })` — upsert into `ip_blocks` with `expires_at`.
- `isIpBlocked(ip)` — memoized read backed by `public.is_ip_blocked()`.
- `evaluateFailedLogin({ email, ip })` — count failures in 15-minute window; at 5 failures block the IP for 60 minutes, record a `critical` event, and send a critical email alert.
- `sendCriticalAlert(payload)` — use the existing Lovable email queue to email the site owner for `critical` events only; failures swallowed and logged.

Create `src/lib/security-events.functions.ts`:
- `listSecurityEvents({ severity?, eventType?, days, page })` — admin only.
- `listIpBlocks({ activeOnly })` — admin only.
- `unblockIp({ ip })` — admin only; deletes block, records `admin_unblock` event.
- `recordClientFailedLogin({ email })` — public; server derives IP, returns `{ ok: true }` always.
- `checkDisposableEmail({ email })` — public; boolean only.

Update `src/start.ts`:
- Add `securityMiddleware` to `requestMiddleware`.
- It resolves IP, checks `isIpBlocked(ip)` → `403` if blocked.
- It checks `isScannerPath(pathname)` → record `critical` event, block IP for 24h, return `403`.
- Must never add measurable latency for normal traffic and must never throw.

Build `src/routes/_authenticated/admin/security-events.tsx`:
- Tabs: **Events** | **Blocked IPs**.
- Events tab: severity filter (low/medium/critical), event-type filter, 7/30-day range, paginated table with time, severity, type, IP, path, user, action taken; expandable metadata.
- Blocked IPs tab: IP, reason, severity, created, expires, and an **Unblock** button with confirm dialog; toggle "active only".
- Manual refresh plus a 60-second polling refresh while the tab is visible.

### G. Security scanning and CI

Ensure the existing `scripts/security-scan.mjs` and `.github/workflows/security-scan.yml` still run:
- `bun run security:scan` must fail on any high or critical dependency advisory.
- After implementation, run the security scanner and address any new findings introduced by these changes.

---

## 2. Design constraints

- Use the existing `Section` and `SectionHeader` from `@/components/layout/Section`.
- Use shadcn `Button`, `Card`, `Badge`, `Skeleton`, `Dialog`, `Table` components.
- Colors must come from CSS semantic tokens in `src/styles.css`; do not hardcode `text-white`, `bg-black`, or hex utilities.
- Use `lucide-react` icons.
- Keep animations subtle: `Reveal` wrapper for entrance, `framer-motion` only for tab transitions.
- Responsive layout: stack on mobile, grid on desktop.

---

## 3. Verification checklist

After generating, confirm:

- [ ] `/reports` loads 24h/7d/14d/30d filters and renders all charts without empty data.
- [ ] `/admin/blocked-domains` allows an admin to add and remove domains; changes are reflected in `/admin/spam-audit`.
- [ ] A non-admin signed-in user sees "Restricted" on every admin page.
- [ ] A signed-out user is redirected to `/auth` when trying to access any admin route.
- [ ] `getReports` and all admin server functions throw `Forbidden` for non-admin callers.
- [ ] `supabaseAdmin` is only imported inside handler bodies.
- [ ] `blocked_email_domains` SELECT is restricted to admins; `is_blocked_email()` has `EXECUTE` revoked from `PUBLIC`/`anon`/`authenticated`.
- [ ] `spam_audit_log`, `security_events`, `ip_blocks`, `failed_login_attempts` deny `UPDATE`/`DELETE` to all app roles.
- [ ] After 5 failed sign-in attempts from the same IP, the IP is blocked for 60 minutes and a critical alert event is recorded.
- [ ] Scanning `/wp-admin` or `/.env` returns 403 and records a `critical` event.
- [ ] The security scanner reports no new high/critical findings after the migration.

---

## 4. Output

Return the full file contents for every new or modified file, including the migration SQL, server functions, route pages, and any component changes. Do not omit code. After the code, list the files changed and a short verification note.
