# Verified Jobs: completion and operations

## Personalization
Public `/jobs`, `/jobs/saved` and `/jobs/alerts` remain accessible without an account. Signed-in saves and searches persist through owner-scoped database policies. Signed-out saves stay on the current device. Matching alerts use the public query and its mandatory 24-hour rule; they refresh while the page is open. An expired saved job remains in private history but is not exposed as a live vacancy.

Email digests are intentionally disabled. A dedicated marketing email service and explicit consent are prerequisites; Lovable app emails may not be used for list digests. Restricted partner sources remain disabled until authorized credentials and permissions are supplied.

## Synchronization
The refresh scheduler runs four times daily at 07:00, 12:00, 16:00 and 21:00 Asia/Kolkata (01:30, 06:30, 10:30 and 15:30 UTC). Its legacy job name is `jobs-sync-15min`; that name no longer describes its cadence. Per-source polling intervals and failure backoff are honored within these four scheduled runs, and concurrent claims are excluded for five minutes. Failed runs remain visible in operations history. A database trigger keeps original publication dates immutable on refresh. New listings can take up to ten hours to appear, plus failed-source backoff. Public freshness remains enforced independently of scheduler operation.

Important: the approved live-application check and feed re-verification must be within 12 hours, aligned with the four daily refreshes so listings stay visible between refresh windows. The original-posting visibility limit is 7 days, enforced by the database policy on every request.

## AI
At most three new, uncached fresh jobs are classified per scheduled request. Streaming structured output is validated against allowed levels/categories and literal employer evidence; only normalized classification fields are changed. Explicit skills are retained only if they occur in the source. Terminal configuration/access/credit errors pause classification persistently. No automatic replay occurs for failed input hashes. Source collection remains independent of classifier success. Restoring paused classification requires fixing the reported account/configuration issue and an explicit administrator reset.

## Administrator access
Every jobs-admin server function requires the admin role plus validated `aal2` claims. The Jobs page offers authenticator enrollment/challenge before mounting private operations. No claim is made that the owner's authenticator has been enrolled: the managed test session was rejected by enrollment with “A valid session and a registered user are required to enroll a factor.” A fresh ordinary sign-in and the owner's authenticator are required to complete this check. Do not weaken MFA to bypass that limitation.

Excel export creates a real `.xlsx` workbook from the authorized recent-job rows already loaded in the admin page. Values are written as strings, not executable spreadsheet formulas. Exports cover the dashboard's latest 100 jobs, not full history.

## Measurement and SEO
LCP, INP and CLS collection loads only after analytics consent. Each document emits one finalized sample per metric; withdrawal suppresses later samples. Only a coarse path, mobile/desktop category, value and rating are stored; no identifiers or query strings. The jobs dashboard reports p75 from at most 500 samples in seven days. Low-volume data is not proof of target compliance; field measurement needs real visitors and publication.

Google Search Console was checked on 27 October 2026: its stored homepage inspection reported Submitted and indexed and selected the www domain as canonical. This is not a live test or verification of new Jobs indexing.

## Verification
- 33 tests passed for freshness/URL/classification rules, MFA role+assurance, source interval/backoff, approved provider/board redirects, incomplete snapshots and all requested categories.
- Signed-in browser checks saved and reloaded a search, and saved/read a real job through `/jobs/saved`; test saves/searches were removed.
- A real AI request returned a schema-valid Senior Individual Contributor / Software Engineering classification with verbatim evidence.
- All 21 official connected sources completed a real refresh.
- Jobs admin with an aal1 session showed the verification screen, not private job operations.
- Full aal2 dashboard/export UI verification remains blocked on owner enrollment; do not report it as tested.
- No production publish was requested or performed.

## Validation follow-up
The 27 October audit found that earlier “verified” rows only had feed/URL checks. Public policy now also requires a live approved application check within 12 hours. The stricter forced run completed all 21 source configurations across four adapters: Greenhouse, Lever, Ashby and Remote OK. It accepted 44 fresh rows and quarantined 21 at the time of inspection; counts are transient and not proof of current eligibility. Employer-custom destinations require explicit approved configuration and are quarantined rather than trusted from a feed-provided URL.

Maintenance schedules: `jobs-expiry-5min` is disabled; expiry is derived by public query policy without a recurring history sweep. `jobs-summary-daily` remains at 18:37 UTC to record live/expired/failing-source/report counts. Refresh scheduling drops from 96 to four possible runs daily, and 288 daily history-maintenance runs are removed. These are scheduled-run reductions, not measured billing savings. Newsletter and security schedules remain unchanged and can still keep Cloud active; AI and hosting usage also remain billable according to account coverage.

Advanced filters now cover employer, city/state text, explicit skills, employment type, source, salary/currency, experience and last application check. Industry and experience filters return only explicitly populated employer data; adapters do not invent missing facts. Structured state/city extraction, visa sponsorship and full descriptions remain limited by source evidence.