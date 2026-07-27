# Admin & Security Implementation Script

A complete, reproducible build prompt for the four protected admin surfaces of
this site — **Reports**, **Blocked Domains**, **Spam Audit Log**, and
**Security Events** — plus the monitoring layer that feeds them.

Paste any single section into Lovable to rebuild that surface from scratch, or
use the whole document to recreate the admin section end to end.

---

## 0. Global rules (apply to every section)

**Stack**: TanStack Start v1 + React 19 + Tailwind v4 + Lovable Cloud (Supabase).

**Routing & access**
- Every admin page lives under `src/routes/_authenticated/admin/*`. The
  integration-managed `_authenticated/route.tsx` gate (`ssr: false`) redirects
  signed-out users to `/auth`.
- Route-level auth is **not** authorization. Every page additionally checks
  `useAuth().isAdmin` and renders a "Restricted" card for non-admins.
- Every admin route sets `head()` with `{ name: "robots", content: "noindex" }`
  and an admin-scoped title.

**Data access (defense in depth — all three layers required)**
1. **RLS** on every table: admin-only `SELECT` via
   `public.has_role(auth.uid(), 'admin')`; writes limited to `service_role`
   for append-only log tables.
2. **Server function guard**: any function that reads privileged data uses
   `.middleware([requireSupabaseAuth])`, then verifies the role through the
   caller's RLS-scoped `context.supabase` (never through `supabaseAdmin`) and
   throws `Forbidden` otherwise.
3. **Admin client only after authorization**: `supabaseAdmin` is imported
   *inside* the handler with `await import("@/integrations/supabase/client.server")`
   and is used solely for cross-table aggregation, never to decide who the
   caller is.

**Error hygiene**: never return raw Postgres/provider errors to the browser.
Log details server-side with a request id; return a short user-facing message.

**Visual system**: Royal Blue (`#2563eb`) accents on soft white; use `Section`
/ `SectionHeader` from `@/components/layout/Section`, shadcn cards, buttons and
badges, `Reveal` for entrance animation. All colors come from semantic tokens
in `src/styles.css` — no hardcoded `text-white` / `bg-black` / hex utilities.

---

## 1. Reports (`/reports`)

**Route**: `src/routes/_authenticated/reports.tsx`
**Server**: `src/lib/reports.functions.ts` → `getReports`

### Server function contract

```ts
getReports({ data: { days: 7 | 14 | 30 } }) => {
  kpis: { totalUsers, activeUsers24h, activeUsers7d, activeUsers30d,
          chatMessages, downloads, pageVisits, uniqueVisitors },
  traffic:  { date: string; visits: number; visitors: number }[],
  topPages: { path: string; views: number }[],
  topTabs:  { page: string; tab: string; opens: number }[],
  sources:  { source: string; count: number }[],
  countries:{ country: string; count: number }[],
  devices:  { device: string; count: number }[],
  visitors: { visitorId, email, displayName, country, city, device, browser,
              os, totalVisits, totalPageviews, firstSeenAt, lastSeenAt,
              identified: boolean }[],
  sessions: { userId, email, startedAt, durationSeconds, ip }[],
}
```

Implementation rules:
- `createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])`.
- Verify admin from `context.supabase.from("user_roles")` → `throw new Error("Forbidden")`.
- Load `supabaseAdmin` inside the handler; run all reads in `Promise.all`.
- Cap every query with `.limit()` (10k–20k) and a `gte` time filter derived from
  `days`, so a large table can never blow the Worker memory budget.
- Bucket the time series **server-side** by UTC day and emit zero-filled rows
  for days with no traffic (this is what fixed the "empty 7/14/30-day graphs").
- Return plain DTOs only — no Supabase response objects.

### Page

- Range switcher: **24h / 7d / 14d / 30d**, default 7d; refetch on change.
- 8 KPI stat cards at the top.
- Recharts: area chart for visits vs. unique visitors; bar charts for top pages
  and top tabs; donut/list for sources, countries, devices.
- `TrafficAnalyticsPanel` and `IdentifiedVisitorsPanel` receive the **shared
  payload as props** — they must not issue their own client queries.
- `DataExportPanel`: CSV export of visitors, sessions and page visits, built in
  the browser from the already-fetched payload (no extra privileged endpoint).
- States: skeleton while loading, inline error card with retry on failure,
  "No data for this period" empty state per chart.

---

## 2. Blocked Domains (`/admin/blocked-domains`)

**Route**: `src/routes/_authenticated/admin/blocked-domains.tsx`
**Table**: `public.blocked_email_domains` (`domain`, `reason`, `created_by`, `created_at`)
**Helpers**: `src/lib/blocked-domains.ts` (static seed list + `isBlockedDomain`)

### Database

- `SELECT` restricted to admins (`has_role(auth.uid(),'admin')`); insert/update/
  delete admin-only. No `anon` grant.
- `normalize_blocked_domain()` BEFORE INSERT/UPDATE trigger: lowercases, trims,
  and rejects anything without a dot (`ERRCODE 22023`).
- `public.is_blocked_email(text)` — `STABLE SECURITY DEFINER`,
  `SET search_path = public`, matches the exact domain **and** subdomains
  (`domain LIKE '%.' || b.domain`). `EXECUTE` is revoked from `PUBLIC`, `anon`
  and `authenticated`; only `service_role` may call it.
- `reject_blocked_email()` BEFORE INSERT/UPDATE trigger on `profiles` and
  `newsletter_subscribers` so blocked domains can never be persisted, even if a
  code path forgets to check.

### Page

- Add form: domain input + optional reason. Client validation (lowercase, no
  `@`, must contain a dot) mirrors the DB trigger; show the DB error verbatim
  when the trigger still rejects.
- Table of domains with reason, added-by and date; delete with a confirm dialog.
- Search box (server-side `ilike`) and pagination at 25 rows/page.
- Optimistic UI is not used here — refetch after each mutation so the audit
  trigger's effect is visible immediately.

### Enforcement points (must all exist)

| Layer | Location | Behaviour |
|---|---|---|
| Signup / signin | `src/routes/auth.tsx` | reject before calling Supabase auth |
| Contact form | `src/routes/api/public/contact.ts` | 400 with generic message |
| Newsletter | `src/routes/api/public/newsletter.ts` | 400, no row written |
| Session guard | `src/components/auth/SpamDomainGuard.tsx` in `SiteLayout` | signs the user out and shows "Access blocked" |
| Database | triggers above | last line of defense |

---

## 3. Spam Audit Log (`/admin/spam-audit`)

**Route**: `src/routes/_authenticated/admin/spam-audit.tsx`
**Table**: `public.spam_audit_log` — append-only
(`action_type`, `email`, `domain`, `reason`, `actor_id`, `metadata`, `created_at`)
**Server**: `src/lib/spam-audit.functions.ts` → `logBlockedLoginAttempt`

### Rules

- RLS: admin `SELECT` only; `INSERT` only by `service_role` /
  `SECURITY DEFINER` triggers. `UPDATE` and `DELETE` are denied to everyone —
  an audit log that can be edited is not an audit log.
- `audit_blocked_domain_change()` AFTER INSERT/UPDATE/DELETE trigger on
  `blocked_email_domains` writes `blocklist_add` / `blocklist_update` /
  `blocklist_remove` rows with `auth.uid()` as `actor_id`.
- `logBlockedLoginAttempt` is an **unauthenticated** server fn (the caller has
  just been refused a session). It therefore: takes only an email, never trusts
  any client-supplied identity, writes `action_type = 'blocked_login_attempt'`,
  and returns `{ ok: true }` with no detail regardless of outcome.

### Page

- Action-type filter chips with color-coded badges
  (blocked login = red, add = emerald, remove = amber, update = blue).
- Columns: action, email/domain, reason, actor, timestamp; `metadata` shown in
  an expandable `<pre>`.
- Pagination at 25 rows/page with exact count; manual refresh button.

---

## 4. Security Events (`/admin/security-events`)

**Route**: `src/routes/_authenticated/admin/security-events.tsx`
**Server**: `src/lib/security-events.functions.ts` (RPC surface) and
`src/lib/security-events.server.ts` (server-only engine)
**Tables**: `security_events`, `ip_blocks`, `disposable_email_domains`,
`failed_login_attempts`

### Monitoring engine (`security-events.server.ts`)

- `getClientIp(request)` — reads `cf-connecting-ip` → `x-real-ip` →
  first hop of `x-forwarded-for`.
- `SCANNER_PATH_PATTERNS` / `isScannerPath(pathname)` — `.env`, `wp-admin`,
  `.git`, `phpmyadmin`, shell/config probes.
- `recordSecurityEvent({ severity, eventType, ip, userAgent, path, userId,
  email, actionTaken, metadata })` — single append-only write; never throws
  into the request path (`try/catch` + `console.error`).
- `blockIp({ ip, reason, severity, ttlMinutes })` — upserts into `ip_blocks`
  with `expires_at`; `invalidateBlocklistCache()` clears the in-request memo.
- `isIpBlocked(ip)` — memoized read backed by `public.is_ip_blocked(text)`.
- `evaluateFailedLogin({ email, ip })` — counts failures via
  `count_recent_failed_logins(ip, 15)`; at **5 failures** blocks the IP for
  **60 minutes**, records a `critical` event and fires an alert.
- `sendCriticalAlert(payload)` — queues an email through the existing email
  queue for `critical` severity only; failures are swallowed and logged.

### Request middleware (`src/start.ts`)

`securityMiddleware` in `requestMiddleware` runs before every request:
1. Resolve IP; if `isIpBlocked(ip)` → `403` immediately.
2. If `isScannerPath(pathname)` → record a `critical` event, `blockIp` for 24h,
   return `403`.
3. Otherwise continue. The middleware must never add measurable latency for
   normal traffic (single cached lookup) and must never throw.

### RPC surface (`security-events.functions.ts`)

All three are `POST` + `requireSupabaseAuth` + admin check + `Forbidden`:
- `listSecurityEvents({ severity?, eventType?, days, page })`
- `listIpBlocks({ activeOnly })`
- `unblockIp({ ip })` — deletes the block, records an event with
  `actionTaken: "admin_unblock"` and the acting admin's id.

Two more are intentionally public but hardened:
- `recordClientFailedLogin({ email })` — server derives the IP itself, ignores
  any client-supplied IP or user id, and returns `{ ok: true }` always.
- `checkDisposableEmail({ email })` — boolean only, backed by
  `is_disposable_email()`.

### Page

- Tabs: **Events** | **Blocked IPs**.
- Events: severity filter (low / medium / critical) with color-coded badges,
  event-type filter, 7/30-day range, paginated table
  (time, severity, type, IP, path, user, action taken), expandable metadata.
- Blocked IPs: IP, reason, severity, created, expires, and an **Unblock**
  button behind a confirm dialog; "active only" toggle.
- Live-ish refresh: manual refresh button plus a 60s `setInterval` poll while
  the tab is visible.

---

## 5. Security verification checklist

Run through this after any change to the admin section:

- [ ] Every admin page renders "Restricted" for a signed-in non-admin.
- [ ] Every privileged server fn throws `Forbidden` for a non-admin, verified
      through the caller's RLS client and **not** the admin client.
- [ ] `supabaseAdmin` is imported only inside handler bodies.
- [ ] No route or component imports `*.server.ts` directly.
- [ ] `spam_audit_log`, `security_events`, `ip_blocks`, `visitor_logs` deny
      `UPDATE`/`DELETE` to all app roles.
- [ ] Every `SECURITY DEFINER` function pins `SET search_path = public` and has
      `EXECUTE` revoked from `PUBLIC`/`anon` where it is not needed.
- [ ] Public endpoints (`/api/public/*`) validate input with Zod, never echo
      internal errors, and never return PII.
- [ ] CI: `bun run security:scan` (`.github/workflows/security-scan.yml`)
      blocks merges on new high/critical dependency advisories.
- [ ] `supabase--linter` and the security scanner report no new findings.
