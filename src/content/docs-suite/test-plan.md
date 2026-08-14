# Test Strategy, Plan & Cases

**Classification:** Confidential — Super Admin only

---

## 1. Objectives and scope

Verify functional correctness, authorization boundaries, privacy behaviour,
accessibility and SEO of the platform. Highest-risk areas are authorization,
audit immutability and public endpoint abuse resistance.

## 2. Test levels

| Level | Tooling | Coverage focus |
|---|---|---|
| Unit | Vitest | Pure helpers: security headers, captions, theme tokens, breadcrumbs |
| Component | Vitest + DOM | Cards, gates, consent state machine |
| Integration | Server function invocation | Authorization, aggregation shape |
| End-to-end | Headless browser | Navigation, forms, chat, downloads |
| Static analysis | ESLint, theme lint, typecheck | Regression prevention |
| Security | Dependency scan, database linter, RLS review | Zero critical/high |

## 3. Entry and exit criteria

- **Entry:** build succeeds, typecheck clean, dev server serves all routes.
- **Exit:** all priority-1 cases pass, no open critical/high security findings,
  no console errors on public routes, SEO checks pass.

## 4. Test cases

### 4.1 Authorization — documentation suite (priority 1)

| ID | Case | Steps | Expected |
|---|---|---|---|
| TC-D1 | Signed-out access | Open /admin/docs | Redirect to /auth |
| TC-D2 | Signed-in non-admin | Open /admin/docs | Restricted card, no document titles |
| TC-D3 | Admin but not owner email | Call listEngineeringDocs | Forbidden, empty response |
| TC-D4 | Super Admin | Open /admin/docs | Index renders, categories grouped |
| TC-D5 | Preview | Select each document | Body renders, no truncation error |
| TC-D6 | Single download | Click download on each doc | .md file saved with expected name |
| TC-D7 | Bundle download | Click download all | One .md containing every document + TOC |
| TC-D8 | Unknown id | Call getEngineeringDoc with a bogus id | Not found, nothing leaked |
| TC-D9 | Indexing | Inspect head and sitemap | noindex/nofollow; absent from sitemap |
| TC-D10 | Bundle hygiene | Search client bundle for a document phrase | No match (server-only content) |

### 4.2 Public content and SEO

| ID | Case | Expected |
|---|---|---|
| TC-P1 | Every public route responds | HTTP 200 |
| TC-P2 | Unique title/description per route | No duplicates, title < 60 chars |
| TC-P3 | Single H1 per page | Exactly one |
| TC-P4 | JSON-LD validity | Parses; correct @type per route |
| TC-P5 | Feeds | rss.xml and atom.xml valid XML, correct items |
| TC-P6 | Sitemap | Contains all public routes, no admin routes |
| TC-P7 | Canonical host | Non-canonical hosts redirect to www |

### 4.3 Forms and abuse resistance

| ID | Case | Expected |
|---|---|---|
| TC-F1 | Valid contact submission | 200, enquiry visible in admin queue, emails queued |
| TC-F2 | Blocked domain | 400 generic message, no row written |
| TC-F3 | Disposable domain | Rejected |
| TC-F4 | Honeypot filled | Rejected silently |
| TC-F5 | Rate limit exceeded | Throttled response, no rows |
| TC-F6 | Repeated failures | CAPTCHA fallback appears |
| TC-F7 | Newsletter unsubscribe link | One click removes subscription |

### 4.4 Security operations

| ID | Case | Expected |
|---|---|---|
| TC-S1 | Scanner path request | 403, critical event recorded, IP blocked 24h |
| TC-S2 | Five failed logins | IP blocked 60 min, critical alert raised |
| TC-S3 | Client write to audit table | Denied by restrictive policy |
| TC-S4 | Admin unblock | Block removed, event recorded with actor |
| TC-S5 | Security-definer functions | search_path pinned, EXECUTE revoked from anon |
| TC-S6 | Error responses | No provider or internal URL text |

### 4.5 Privacy and consent

| ID | Case | Expected |
|---|---|---|
| TC-C1 | First visit | Banner shown, optional categories off |
| TC-C2 | Decline analytics | No tracking request issued |
| TC-C3 | Accept analytics | Tracking request issued, IP stored hashed |
| TC-C4 | Reopen preferences and reset | Returns to default state, syncs across tabs |
| TC-C5 | Tracking spoof attempt | Client-supplied user id ignored |

### 4.6 Learning and media

| ID | Case | Expected |
|---|---|---|
| TC-L1 | Module search and filter | Correct subset shown |
| TC-L2 | Video captions and settings | Toggle works, preference persists |
| TC-L3 | Inline PDF reader | Renders, paginates |
| TC-L4 | Progress persistence | Resumes after sign-out/in |
| TC-L5 | Repository download | Streams file, no internal URL exposed |

### 4.7 Assistant

| ID | Case | Expected |
|---|---|---|
| TC-A1 | In-scope question | Grounded answer streams |
| TC-A2 | Out-of-scope question | Polite decline |
| TC-A3 | Read aloud | Audio plays on user gesture |
| TC-A4 | Prompt injection attempt | Instructions in content ignored |

### 4.8 Accessibility and theming

| ID | Case | Expected |
|---|---|---|
| TC-X1 | Keyboard-only navigation | All interactive elements reachable |
| TC-X2 | prefers-reduced-motion | Transitions reduced |
| TC-X3 | Each theme | Text contrast meets AA |
| TC-X4 | Theme persistence | Survives reload and second device |

## 5. Regression suite

Run before every release: unit tests, theme token lint, dependency scan, build,
then TC-D1..TC-D10, TC-P1..TC-P7, TC-S1..TC-S3.

## 6. Defect management

Severity 1 (authorization, data exposure) blocks release. Severity 2 (broken
primary journey) blocks release. Severity 3/4 are scheduled.
