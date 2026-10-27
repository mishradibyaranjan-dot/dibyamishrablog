# Validate and complete the executive/jobs brief

## Additions and corrections
- Complete every requested job category and expand search/preferences with employer, city/state, salary/currency, skills, employment type, source and last-check filters. Missing employer facts stay marked unknown.
- Strengthen verification with provider-specific approved destinations, live application-link checks, quarantine on inconclusive results and a stored verification history.
- Stop refreshes overwriting completed AI classification or administrator moderation. Add explicit re-verification and better administrator filters/error states.
- Add five-minute expiry maintenance and daily operational summaries, while retaining database-enforced 24-hour expiry even if scheduled work stalls.
- Verify public pages, links, metadata, real-source processing, filtering and account workflows; provide the requested architecture, testing and release documentation.

## Boundaries
- Restricted boards remain disabled until authorized partner access is supplied.
- Email digests remain blocked on a dedicated marketing email service and consent setup.
- Full authenticator-protected administrator testing requires the owner's fresh sign-in and authenticator; do not bypass security.
- Report measured results and unresolved acceptance items honestly; do not publish.

## Technical approach
Extend the existing TanStack routes, semantic controls and Cloud schema additively. Use official ATS APIs, destination allowlists, bounded verification, durable audit records and SQL-only maintenance schedules. Keep all private operations role/MFA protected and public freshness enforced by the jobs policy.