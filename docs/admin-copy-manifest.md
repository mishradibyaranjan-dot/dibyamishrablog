# Admin Section — Copy Manifest

Use this list when copying the admin section (Reports, Blocked Domains, Spam Audit Log,
Security Events) from this project into another Lovable project.

## How to copy

Cross-project copying is **pull-only**: open the *target* project, then send it a prompt like:

> Copy the complete admin section (Reports, Blocked Domains, Spam Audit Log, Security Events)
> from @<this-project-name>. Read `docs/admin-copy-manifest.md`,
> `docs/admin-security-build-prompt.md` and `docs/admin-security-implementation.md`
> there, then copy every file listed and apply the required database migrations.

## Files to copy

### Routes (UI)
- `src/routes/_authenticated/reports.tsx`
- `src/routes/_authenticated/admin/blocked-domains.tsx`
- `src/routes/_authenticated/admin/spam-audit.tsx`
- `src/routes/_authenticated/admin/security-events.tsx`

### Server functions / libs
- `src/lib/reports.functions.ts`
- `src/lib/spam-audit.functions.ts`
- `src/lib/security-events.functions.ts`
- `src/lib/security-events.server.ts`
- `src/lib/blocked-domains.ts`
- `src/lib/security-headers.ts` (CSP + security headers)

### Supporting components
- `src/components/security/CaptchaChallenge.tsx`
- `src/components/auth/SpamDomainGuard.tsx`
- `src/components/layout/SiteLayout.tsx` (only the guard + admin nav wiring)

### App wiring
- `src/start.ts` — `securityMiddleware` (IP auto-block, probe detection)
- `src/lib/tracking.ts` + visitor tracking hook (Reports data source)

### Specs
- `docs/admin-security-build-prompt.md` — single reproducible build prompt
- `docs/admin-security-implementation.md` — detailed implementation spec

## Database objects required in the target project

Tables: `user_roles` (+ `app_role` enum, `has_role()`), `security_events`, `ip_blocks`,
`blocked_email_domains`, `disposable_email_domains`, `spam_audit_log`,
`failed_login_attempts`, `visitors`, `visitor_logs`, `page_visits`, `user_activity`,
`login_sessions`, `profiles`.

Functions: `has_role`, `is_blocked_email`, `is_disposable_email`, `is_ip_blocked`,
`count_recent_failed_logins`, `purge_expired_ip_blocks`, `audit_blocked_domain_change`,
`normalize_blocked_domain`, `reject_blocked_email`.

Security model (must be preserved):
1. RLS on every table, admin-only reads via `has_role(auth.uid(),'admin')`.
2. Authenticated server fn re-checks admin before any privileged work.
3. Admin (service-role) client loaded **inside** the handler, only after authorization.
4. Security-definer functions have pinned `search_path` and `EXECUTE` revoked from
   `PUBLIC`/`anon` where not needed.
