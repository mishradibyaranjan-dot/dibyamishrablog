
## Overview

A large build. Grouped into 5 phases I'll ship in order. After approval I'll execute end-to-end without pausing between phases.

## Phase 1 — Auth (email + Google + Apple)

- Enable Google and Apple via managed OAuth (single-click).
- New routes (all use the existing futuristic glass/aurora theme):
  - `/auth` — combined Login + Register tabs, with Google/Apple buttons.
  - `/forgot-password` — request reset email.
  - `/reset-password` — set new password (handles recovery hash).
- Auth context + `supabase.auth.onAuthStateChange` wired once in `__root.tsx`.
- Header: replace "Connect" with avatar menu (Sign in / Sign out) when logged in.
- Email validation via Zod. Passwords hashed by Supabase (bcrypt) — never stored plaintext.
- Skipping "Forgot Username" (email is the identifier).

## Phase 2 — Database (Lovable Cloud)

Single migration creates:

- `profiles` (id → auth.users, display_name, email, avatar_url, created_at)
- `app_role` enum (`admin`, `user`) + `user_roles` table + `has_role()` SECURITY DEFINER
- `login_sessions` (user_id, started_at, ended_at, ip, user_agent, duration_seconds)
- `user_activity` (user_id, action_type, target, metadata jsonb, occurred_at)
- `page_visits` (user_id, path, referrer, duration_seconds, visited_at)
- `tab_access` (user_id, page, tab_id, opened_at)
- `search_queries` (user_id, query, results_count, searched_at)
- `chatbot_messages` (user_id, role: user/assistant, content, conversation_id, created_at, sources jsonb)
- `resource_access` (user_id, resource_id, resource_type, accessed_at)
- `failed_login_attempts` (email, ip, attempted_at, reason)

RLS:
- Users read/write only their own rows.
- Admin (via `has_role`) reads everything for Reports.
- `service_role` full access for the auth webhook + cron.
- All public tables get explicit GRANTs.

Trigger: `handle_new_user()` auto-creates `profiles` row on signup. Admin email `mishra.dibyaranjan@gmail.com` is auto-granted `admin` role on first sign-in via the same trigger.

## Phase 3 — Learn page + protected routes

New page `src/routes/_authenticated/learn.tsx` (using a thin `_authenticated` layout that redirects to `/auth` if not signed in).

Three tabs (existing `Tabs` shadcn component, same neon/glass cards used in Research):
- **Intro to AI** — parsed sections from the AI guide doc: What is AI, Types of AI, ML vs DL, AI Agents, Real-world examples, Glossary.
- **Intro to Cloud** — parsed sections from the Cloud doc: What is Cloud, Service models (IaaS/PaaS/SaaS), Deployment models, Benefits, Key services, Glossary.
- **Intro to SaaS** — parsed sections from the SaaS doc: What is SaaS, Multi-tenancy, Architecture patterns, Pricing models, Security, Glossary.

Each tab uses the same Reveal animations, gradient cards, AnimatedCounter highlights, and a "Key Takeaways" summary block matching Research aesthetics. No company names appear anywhere.

**Protected routes** (moved under `_authenticated/` layout via redirect-on-load, keeping current URLs):
- `/learn`, `/research`, `/projects`, `/case-studies`

When not signed in, these render a centered glass card: *"Please register or log in to access this content."* with three buttons: **Login**, **Register**, **Forgot Password**.

(Note: I'm treating "Resources" as the existing Research page since there isn't a separate Resources route — confirm in feedback if you want a different page.)

## Phase 4 — Chatbot retrain

`FloatingChat` currently calls `/api/public/chat`. I'll:
- Extract parsed content from the three uploaded docs + existing Research/Case Studies/Projects/Learn content into a single `src/lib/knowledge-base.ts` (chunked, no company names).
- Update `/api/public/chat` server route to:
  - Greet on first message: *"Hi! I'm your Learning Assistant. I can help you explore AI, Cloud, SaaS, research articles, and case studies. What would you like to learn about?"*
  - Inject knowledge-base context into the system prompt (small enough to fit in-context; no vector DB needed for v1).
  - Log every user question + assistant reply to `chatbot_messages` when user is authenticated.
  - Suggest relevant Learn tab / Research post links inline.

## Phase 5 — Activity tracking + Reports

**Tracking** (lightweight client → server fn batches):
- Login/logout writes `login_sessions` (close session on sign-out / beacon on unload).
- Route changes → `page_visits` with duration.
- Tab switches on Learn → `tab_access`.
- Failed sign-ins → `failed_login_attempts` via the auth flow.

**Reports** (`/_authenticated/_admin/reports`, admin-only):
- KPI cards: Total users, Active users (24h/7d/30d), Avg session, Total chatbot queries.
- Charts (Recharts, already installed): Daily activity line, Most visited pages bar, Most accessed tabs bar, Top chatbot questions list.
- Filters: date range, user.
- Export to CSV button.
- Same cinematic glass + aurora theme.

## Out of scope (flag if you want them)

- True vector-search RAG (current plan: in-context knowledge base, ~30k tokens, works well for this corpus).
- A separate "Resources" route distinct from Research.
- Newsletter/marketing emails to users.

## Execution order after approval

1. Enable Google + Apple OAuth.
2. Run one DB migration (all tables + RLS + admin grant trigger).
3. Build auth pages + `_authenticated` layout + header avatar.
4. Parse docx content → knowledge base file.
5. Build Learn page + gate Research/Projects/Case Studies.
6. Update chatbot route + greeting + logging.
7. Add activity tracker hook + Reports page.
8. Verify build, test sign-in flow end-to-end, then publish.

Reply **approve** to start, or tell me what to change.
