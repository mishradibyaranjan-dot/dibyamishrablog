# Complete the missing jobs features

- Add signed-in saved jobs across devices, saved searches, and an in-app list of matching fresh jobs.
- Add AI classification using employer-provided evidence, with transparent results, caching and safe failure handling.
- Add administrator two-step verification for Jobs operations and Excel downloads.
- Honor each source's refresh interval and prevent overlapping refreshes; preserve original posting dates.
- Add consent-based page-speed measurements and check the existing Google Search Console connection.
- Test the account and administrator workflows, freshness rules and real source processing; update the operations guide.

## External dependencies
- Restricted job boards remain disabled until authorized partner access is provided.
- Scheduled email digests require a dedicated marketing email service. Lovable's app-email service cannot send list digests; in-app alerts can work without it.
- Do not publish without approval.

## Technical approach
Use existing authentication and design controls, owner-scoped Cloud policies for personal saves/preferences, server-validated MFA for jobs administration, official source adapters, and durable refresh/classification state. Keep public pages readable without an account and enforce the strict original-publication 24-hour rule.