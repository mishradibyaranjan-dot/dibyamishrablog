# Software Requirements Specification (SRS)

**System:** dibyamishra.co.in platform
**Standard:** IEEE 830 style, adapted
**Classification:** Confidential — Super Admin only

---

## 1. Introduction

### 1.1 Scope
This SRS specifies functional and non-functional requirements for the public
site, the learning platform, the AI assistant, the newsletter engine, the
analytics pipeline and the administrative suite.

### 1.2 Definitions
- **Super Admin** — the single owner identity (mishra.dibyaranjan@gmail.com).
- **Admin** — role stored in public.user_roles; currently granted to the owner only.
- **Visitor** — unauthenticated user.
- **Server function** — typed RPC executed in the edge Worker.

## 2. Actors

| Actor | Description | Authentication |
|---|---|---|
| Visitor | Reads public content, submits forms | None |
| Authenticated user | Persists theme, learning progress | Email/password or Google |
| Admin | Reads governance surfaces | Session + admin role |
| Super Admin | Everything, plus engineering documentation | Session + admin role + owner email |
| Scheduler | Invokes cron endpoints | Shared secret header |
| Agent (MCP) | Calls scoped tools | OAuth bearer |

## 3. Functional requirements

### 3.1 Content and navigation
- FR-1 The system shall render each major content section as its own route with
  unique title, description and Open Graph metadata.
- FR-2 The system shall expose RSS and Atom feeds for blog and research posts.
- FR-3 The system shall publish sitemap.xml containing every public route.
- FR-4 The system shall emit JSON-LD (Organization, WebSite, BreadcrumbList,
  Article/BlogPosting, LegalPage) appropriate to each route.
- FR-5 Global search shall match posts, case studies, learn modules and pages,
  and shall open with the keyboard shortcut Cmd/Ctrl+K.

### 3.2 Contact and newsletter
- FR-6 The contact endpoint shall validate input with a schema, reject blocked
  and disposable domains, apply a honeypot and per-IP rate limiting, and persist
  the enquiry.
- FR-7 On success the system shall queue an owner notification and a submitter
  confirmation email, with idempotency keys and automated retry.
- FR-8 Newsletter subscription shall be double-checked against the blocklist and
  shall support one-click unsubscribe via a signed link.
- FR-9 The system shall generate draft newsletter issues with AI, allow review,
  scheduling and version comparison before dispatch.

### 3.3 Learning platform
- FR-10 The Learn hub shall list modules with topic filters and free-text search.
- FR-11 Each module shall support narrated video with captions and an inline PDF
  reader.
- FR-12 Progress shall persist per user and resume on return.

### 3.4 AI assistant
- FR-13 The assistant shall answer only from the curated knowledge base and site
  content, and shall decline out-of-scope requests.
- FR-14 Responses shall stream, and read-aloud shall be available on demand.
- FR-15 Prompts and responses shall never include secrets or internal URLs.

### 3.5 Analytics and audit
- FR-16 Visit tracking shall run only after analytics consent is granted.
- FR-17 The tracking endpoint shall derive identity from the bearer token only
  and shall ignore client-supplied user identifiers.
- FR-18 Every tracking write attempt shall be audited with outcome and reason.
- FR-19 Reports shall aggregate server-side over 24h/7d/14d/30d ranges with
  zero-filled time series.

### 3.6 Security operations
- FR-20 Requests to known scanner paths shall be recorded as critical events and
  the source IP blocked for 24 hours.
- FR-21 Five failed logins from one IP within 15 minutes shall block that IP for
  60 minutes and raise a critical alert.
- FR-22 Blocked-domain login attempts and blocklist changes shall be written to
  an append-only audit log.
- FR-23 Admin surfaces shall render a restricted notice for non-admins.

### 3.7 Engineering documentation suite
- FR-24 The system shall provide BRD, SRS, HLD, LLD, architecture diagrams, test
  strategy, user guide and release notes as in-app documents.
- FR-25 Documents shall be listed, previewed and downloaded from an admin route.
- FR-26 Document content shall be served only by a server function that requires
  an authenticated session, the admin role and the Super Admin email; all other
  callers receive Forbidden and no content.
- FR-27 The route shall be marked noindex, nofollow and shall never appear in the
  sitemap or public navigation.
- FR-28 Downloads shall be available per document (Markdown) and as a single
  combined bundle.

## 4. Non-functional requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-1 | Performance | Public routes interactive under 2.5s on a 4G profile |
| NFR-2 | Availability | Static and public routes independent of admin failures |
| NFR-3 | Security | Defence in depth: RLS + server-side authorization + UI gate |
| NFR-4 | Privacy | IP hashing, consent gating, retention purge |
| NFR-5 | Accessibility | Keyboard operable, captions, prefers-reduced-motion honoured |
| NFR-6 | Observability | Request-scoped ids in server logs; no PII in logs |
| NFR-7 | Maintainability | Semantic theme tokens enforced by CI lint |
| NFR-8 | Portability | Worker-compatible dependencies only |
| NFR-9 | SEO | Unique metadata per route; canonical host www.dibyamishra.co.in |
| NFR-10 | Error hygiene | User-facing messages never include provider errors |

## 5. External interfaces

| Interface | Direction | Notes |
|---|---|---|
| Lovable Cloud (Postgres, Auth, Storage) | Bidirectional | RLS enforced |
| AI Gateway | Outbound | Chat, generation, text-to-speech |
| Email delivery | Outbound | Queued, idempotent, retried |
| Cron scheduler | Inbound | Secret header required |
| MCP clients | Inbound | Scoped tools, OAuth |

## 6. Traceability

| BRD | SRS |
|---|---|
| BR-1 | FR-1..FR-5 |
| BR-2 | FR-6, FR-7 |
| BR-3 | FR-6, FR-8, FR-22 |
| BR-4 | FR-16..FR-18, NFR-4 |
| BR-5 | FR-23, NFR-3 |
| BR-6 | FR-24..FR-28 |
| BR-7 | FR-4 |
| BR-8 | FR-12, NFR-7 |
| BR-9 | NFR-5 |
| BR-10 | FR-9 |
