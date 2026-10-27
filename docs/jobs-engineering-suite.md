# Executive Portfolio + Verified Jobs: engineering suite

## BRD and acceptance scope
The portfolio preserves authored executive facts and existing URLs. The jobs product provides public discovery of real openings originally published less than 24 hours ago. Candidates apply at the source; no resumes are collected. Personal accounts save jobs/searches and show in-app matches. Administrators manage sources, holds/review, evidence and reports. Restricted boards and list email delivery require external authorization/services.

## SRS
- Publication: authorized source, credible UTC original timestamp, nonfuture age <24h, unexpired, open, primary, no administrator hold, feed verification <3h and approved application check <30min.
- Search: keyword, career level, category, country/location text, arrangement, employer, age 1/3/6/12/24h, skills, employment type, source, salary/currency, explicit industry/experience and last check. Unknown fields never satisfy factual filters.
- Accounts: owner-scoped saves/searches; no access to another person's rows.
- Admin: protected role plus server-validated aal2. Manual release goes through re-verification, not direct public override.
- Privacy: metrics require analytics consent; measurements are coarse and omit identifiers.

## HLD / architecture
```text
Official ATS feeds -> collector -> timestamp + destination checks -> live link verifier
                                 -> quarantine / verified records -> public RLS -> Jobs pages
                                                   |
                                                   -> AI classification + evidence/cache
Auth -> owner RLS -> saves/searches -> matching public queries
Admin role + aal2 -> operational dashboard -> audited moderation/source actions
SQL schedules -> expiry history / daily summary (not public eligibility)
```
Four adapters support 21 configured feeds; these are not 21 independent provider integrations. The private registry and operational data remain in Cloud. AI calls and secrets remain server-only. Public reads use publishable credentials and restrictive policies.

## LLD and database
`job_sources` holds provider, board, interval, connection status and lock/backoff state. `jobs` holds source IDs, stable slug, timestamps, source/application links, normalized fields, hold and verification evidence. `job_verifications` logs live checks. `source_sync_runs` logs collection outcomes. `job_classifications` caches evidence-based output by input hash; `jobs_ai_state` pauses terminal failures. `saved_jobs` and `job_alerts` have owner policies. `reported_jobs` and `job_admin_audit` are private. `job_publication_events` records lifecycle transitions. `job_operational_summaries` stores daily counts. `web_vital_samples` is consented coarse measurement.

Existing row types are generated after additive migrations. A publication-preserving trigger makes original posting time immutable; expiry is bounded by the original time plus 24h. A service-only source claim excludes overlap and respects interval/backoff. No foreign keys from new personal tables point into managed auth schema.

## Agent workflows
1. Source registry: only configured approved feeds are enabled; external permissions cannot be discovered or fabricated automatically.
2. Collector: retrieves official JSON feeds with bounded concurrency, logs errors and retains source IDs.
3. Verifier: validates age, provider/board destination and each redirect; combines authorized feed presence with successful link/closed-marker checks. Inconclusive results are quarantined. This is not a fraud guarantee or a bypass of authentication.
4. Classifier: streaming structured AI, literal evidence and explicit skills; original requirements/titles untouched. Refresh preserves normalized classifications.
5. Duplicates: normalized employer/title/location plus canonical application URL. Original source rows remain; primary rows are selected. Semantic similarity and canonical requisition reference modeling are not fully implemented.
6. Publisher: policy controls every public read; schedules maintain history and summaries only.

## API inventory
Public RPCs: `listJobs`, `getJob`, `listSources`, `reportJob`. Account RPCs: `personalJobs`, `saveJobToAccount`, `saveJobSearch`, `removeJobSearch`. Jobs admin RPCs check role+aal2 before reads/writes. Cron HTTP endpoint `/api/public/cron/jobs-sync` checks a server-only secret before source/AI work. Maintenance functions are service-only.

## Source matrix
Greenhouse: official board API, original `first_published`; custom career destinations stay quarantined unless configured. Lever: official postings API, `createdAt`, configured board URLs. Ashby: official posting API, `publishedAt`, listed jobs and configured board URLs. Remote OK: official API, original timestamp; third-party application destinations are not automatically trusted. LinkedIn Jobs, Indeed, Naukri, Foundit, IIMjobs/Hirist, Glassdoor, Wellfound and Workday remain pending/restricted, not connected by claim.

## Testing and security report
33 rule tests cover timestamp boundaries, source destination safety, snapshot truncation, classification evidence, categories, MFA assurance and polling. Real forced collection completed 21 source configurations with application-check evidence. Browser checks validate public/account flows separately from authenticated administrator flows. Full admin/export interaction testing is blocked on owner authenticator enrollment; no bypass is authorized. Google Rich Results validation, Indexing API notifications and production field Core Web Vitals compliance are not claimed.

## Deployment guide
Do not publish until approval and remaining release acceptance checks. Confirm cron server-only secret, published endpoint reachability, source terms and configured board tokens. Check actual scheduled runs after deployment. Enroll the owner authenticator using an ordinary fresh sign-in. Obtain email-provider and partner permissions before enabling those features. No credentials belong in source or documentation.

## Monitoring runbook
Inspect source last success/error and sync history. Repeated failures back off 15 minutes up to one day. Verify quarantine evidence before release. Large snapshot contraction skips closure processing rather than mass-closing. After fixing AI account/configuration failures, explicitly resume from the admin control. Review daily summary and pending reports. Live eligibility fails closed when application checks age out, even if refresh stalls.

## Release notes and remaining dependencies
Added categories/advanced filters, redirect-safe live checks and history, holds preserved through refresh, stable slugs, explicit re-verification, operational schedules, public-only dynamic sitemap, and operations evidence. Remaining: partner access; a marketing email provider with consent/unsubscribe configuration; owner MFA/end-to-end export check; measured production performance; provider-specific richer factual fields; semantic duplicate references; full discovery-agent automation; Google Rich Results/Indexing API verification.