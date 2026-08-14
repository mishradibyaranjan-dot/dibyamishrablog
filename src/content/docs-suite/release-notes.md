# Release Notes & Operations Runbook

**Classification:** Confidential — Super Admin only

---

## 1. Current release

**Release:** Engineering documentation suite
**Type:** Feature (admin-only)

### Added
- Owner-only engineering documentation suite at /admin/docs with in-app preview
  and downloads: BRD, SRS, HLD, LLD, architecture diagrams, test strategy and
  cases, user and administrator guide, release notes and runbook.
- Per-document Markdown download and a combined full-suite download.
- Account-menu entry visible only to the owner account.

### Security
- Document content is served exclusively by server functions that require an
  authenticated session, the admin role verified through the caller's own
  RLS-scoped client, and an exact match on the Super Admin email.
- Document text lives in a server-only module, so it never reaches a client
  bundle for unauthorized users.
- The route is marked noindex, nofollow and excluded from the sitemap and public
  navigation.

## 2. Release history (summary)

| Release | Highlights |
|---|---|
| Legal & consent | Privacy Notice, Copyright, Terms, cookie consent with script gating, legal JSON-LD |
| Theming | Ten themes, semantic token system, CI token lint, glassmorphic default |
| Security hardening | IP blocking, scanner detection, brute-force lockout, restrictive RLS on audit tables, CI dependency scan |
| Analytics | Visitor identification, tracking audit, server-side reports aggregation |
| Learning platform | Modules, narrated video, inline PDF reader, search and progress |
| Marketing upgrade | Advisory route, case study deep dives, lead magnet playbook, global search |
| Communications | Contact enquiry queue with replies, newsletter generation and scheduling |
| Agent surface | MCP tools with scoped OAuth access |

## 3. Deployment procedure

1. Confirm lint, theme token lint, unit tests and dependency scan pass.
2. Build and verify the preview: public routes 200, no console errors.
3. Run the release regression subset from the test plan.
4. Publish.
5. Post-release: verify canonical host, feeds, sitemap, one repository download,
   one contact submission, and Super Admin access to the documentation suite.

## 4. Rollback

Revert to the previous published version. No schema change is required by the
current release, so rollback is code-only and immediate. If a migration is part
of a future release, pair it with a forward-compatible read path so rollback does
not break the running version.

## 5. Operational runbook

| Situation | Action |
|---|---|
| Legitimate IP blocked | Security events → Blocked IPs → Unblock |
| Spam wave from one domain | Add the domain in Blocked domains; the audit log records it |
| Emails not delivering | Inspect send state, allow the retry job to drain, verify sending domain |
| Reports empty for a range | Confirm analytics consent traffic exists; check tracking audit outcomes |
| Suspected data exposure | Rotate keys, review security events and visitor audit, then re-run the scan |
| Documentation suite unreachable | Confirm owner email sign-in; check server logs for Forbidden |

## 6. Monitoring

- Security events for critical severity.
- Visitor tracking audit for rejected write spikes.
- Email send state for stuck items.
- Dependency scan on every pull request.

## 7. Known limitations

- Downloads are Markdown; no in-app PDF rendering of these documents.
- Rate limits are per-isolate, so limits are approximate under heavy scaling.
- The apex host redirects to the canonical www host at the hosting edge.
