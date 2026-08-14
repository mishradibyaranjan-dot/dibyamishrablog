# High-Level Design (HLD)

**Classification:** Confidential — Super Admin only

---

## 1. Architectural overview

The platform is a single full-stack TanStack Start v1 application deployed to an
edge Worker runtime, backed by Lovable Cloud (Postgres + Auth + Storage).

Layers:

1. **Presentation** — React 19 route components, Tailwind v4 semantic tokens,
   shadcn primitives, glassmorphic component set, cinematic motion helpers.
2. **Edge application** — SSR render, request middleware (security, headers),
   server functions (typed RPC), server routes (public HTTP: webhooks, cron,
   feeds, downloads).
3. **Data** — Postgres with row-level security on every table, security-definer
   helper functions with pinned search_path, append-only audit tables.
4. **External services** — AI gateway, email delivery, scheduler.

## 2. Component decomposition

| Component | Responsibility | Key modules |
|---|---|---|
| Site shell | Header, nav, footer, banners, consent, session timeout | components/layout, components/legal |
| Content engine | Posts, case studies, research, projects | lib/content, lib/post-meta, lib/search-index |
| Learn platform | Modules, player, PDF reader, progress | components/learn, lib/learn-catalog |
| Assistant | Streaming chat, read-aloud | components/chat, routes/api/public/chat, api/public/tts |
| Newsletter | Generation, scheduling, dispatch, unsubscribe | lib/newsletter*, components/admin |
| Contact | Public endpoint, admin queue, replies | routes/api/public/contact, lib/contact-* |
| Analytics | Visit capture, visitor identity, reports | lib/tracking, lib/visitor-tracking, lib/reports.functions |
| Security ops | IP blocks, events, failed logins, spam audit | lib/security-events*, lib/spam-audit.functions, start.ts |
| Governance docs | Engineering documentation suite | lib/docs-suite.*, routes/_authenticated/admin/docs |
| Agent surface | MCP tool exposure | lib/mcp, routes/mcp.ts |

## 3. Request flow

    Client → Edge Worker
      → requestMiddleware: security (IP blocklist, scanner detection), headers/CSP
      → route match
         → public route: SSR render + loader (TanStack Query prefetch)
         → server function: auth middleware → authorization → data access
         → server route (/api/public/*): explicit caller verification
      → response (+ security headers, cache policy)

## 4. Authentication and authorization model

Three independent checks, all required for privileged data:

1. **Route gate** — the _authenticated layout redirects signed-out users;
   the /admin layout wraps children in RequireAdmin.
2. **Server-side authorization** — every privileged server function runs
   requireSupabaseAuth, then re-checks the role through the caller's
   RLS-scoped client, and for the documentation suite additionally compares the
   token email against the Super Admin address.
3. **Database** — RLS policies keyed on has_role(auth.uid(), 'admin');
   audit tables are append-only and deny client writes with restrictive policies.

The service-role client is imported inside handler bodies only, after
authorization has already succeeded, and is never used to decide who the caller is.

## 5. Documentation suite design

- Content lives as Markdown assets compiled into a server-only module. It is
  never imported by client code, so the bundle contains no document text.
- A server function returns metadata (id, title, category, summary, size) for the
  index, and a second returns a single document body by id.
- The admin page renders the index, an in-app preview pane, per-document
  download and a combined bundle download assembled in the browser from
  already-authorized responses.
- Diagrams are Mermaid sources embedded in the diagram document and rendered as
  text in the preview, so no rendering dependency is added.

## 6. Data architecture (logical)

Domains:

- **Identity**: auth users, profiles, user_roles.
- **Engagement**: page_visits, user_activity, login_sessions, visitors,
  visitor_logs, visitor_tracking_audit.
- **Communication**: contact enquiries, newsletter subscribers, issues,
  schedules, email_send_state.
- **Security**: security_events, ip_blocks, failed_login_attempts,
  blocked_email_domains, disposable_email_domains, spam_audit_log.
- **Learning**: learn progress keyed by user.

## 7. Cross-cutting concerns

| Concern | Approach |
|---|---|
| Theming | Ten themes; semantic tokens in styles.css; preference in localStorage + profiles |
| Consent | Categories default off; scripts gated; cross-tab sync |
| CSP | Explicit allowlist per origin family; inline hashes only where unavoidable |
| Error handling | Request id in logs, generic client messages |
| Rate limiting | Per-isolate sliding windows on public endpoints |
| Caching | Immutable assets; feeds and sitemap short-TTL |

## 8. Deployment view

    Browser ── HTTPS ──► Edge Worker (SSR + server fns + server routes)
                              │
                              ├──► Postgres (RLS)
                              ├──► Object storage (PDF, video)
                              ├──► AI gateway
                              └──► Email delivery

Canonical host is www.dibyamishra.co.in; other hosts redirect. /.well-known/* is
excluded from middleware and routing.

## 9. Design decisions

| ID | Decision | Rationale |
|---|---|---|
| AD-1 | Server functions over edge functions | Type safety, single deployment |
| AD-2 | Markdown-as-asset for docs | Reviewable, diffable, zero client leakage |
| AD-3 | Client-side bundle assembly for downloads | No extra privileged endpoint |
| AD-4 | Restrictive RLS on audit tables | Immutability by construction |
| AD-5 | Email-scoped gate on the docs suite | Owner-only requirement beyond role |
