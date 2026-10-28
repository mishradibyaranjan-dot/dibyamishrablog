# Project engineering rules
- Interview preparation uses account-private sanitized text snapshots and server-only streaming generation; browser-only document extraction avoids public upload URLs. Generation commits bounded batches atomically and uses a durable queue lease with drain-based retry removal.
- Career resume reviews use a shared policy-filtered job-context resolver, private originals in no-read quarantine, server-validated evidence-only wording changes, atomic immutable approval versions and latest-version export authorization; this prevents fact invention, accidental original overwrite and stale approved downloads. Browser-generated editable documents use only the authorized approved text, while original binaries remain unavailable until a real scanner is integrated.
- Career retention cleanup reuses existing jobs refresh callbacks and owner reads, deleting quarantine objects before metadata so storage failures remain retryable without extra polling.
- Resume document selection extracts locally before storage/AI consent; analysis requires explicit consent, refreshes the current bearer session, and accepts success only after the server's committed completion event so uploads and interrupted streams never fail silently.

- Send bulk newsletter email with bounded concurrency and never sleep inside request handlers; managed delivery and explicit retries handle rate limits.
- Newsletter sends must include a stable per-recipient unsubscribe token and retain the public `/email/unsubscribe` compatibility route.
- Keep theme, language, and accessibility controls directly available in both the main menu and footer so display preferences never depend on nested panels.
- Full-page automatic translation is opt-in, lazy-loaded for non-English selections, and must preserve English as the authored source.
- Custom brand colours override only semantic brand tokens, persist locally, and always calculate a readable primary-button foreground.- Keep verified resume facts (roles, achievements, certifications) in `src/lib/profile.ts` and render portfolio pages from it, so no page invents or diverges on figures.
- Jobs platform: public job visibility (verified, open, primary, posted within 7 days, recently checked) is enforced by the `jobs` table's database policy, not only by the sync worker, so expired jobs vanish even if cron stalls.
- Job sources are adapters keyed by provider; official feeds only, durable source locks enforce polling/backoff, and a database trigger preserves original publication times to prevent refreshes from renewing expired jobs.
- Jobs personal saves/searches use owner-scoped policies and the same public freshness policy for matches; in-app alerts do not imply email delivery.
- Jobs admin RPCs require both the protected admin role and authenticated aal2; the authenticator UI is not the security boundary.
- AI job classification uses server-only streaming Responses calls, verbatim employer evidence, cached outputs and durable pause state; factual job fields are never rewritten by AI.
- Page-speed samples require analytics consent and store only coarse path/device, metric/value/rating; no identifiers or query parameters.
- Public jobs additionally require authorized-feed evidence and an approved live application check within 12 hours (aligned with the four daily refreshes); redirects are manually validated against provider/board allowlists before fetching.
- Source refreshes preserve stable slugs, AI classifications and moderation holds; publication and verification transitions have durable audit records.
- Sitemap dynamic content uses public credentials, paginated policy-filtered rows and an explicit unavailable response on errors; private utility routes are excluded.

- Career compatibility arithmetic stays in a pure evidence-validating module with transparent factor exclusions and limitations; this keeps estimates reproducible without changing factual recommendations or implying employer ATS validation.
- My Career aggregates owner-policy reads through one authenticated server function; approved document history links back to a fresh authorization check rather than reusable original-file URLs.
- Public job source reads have column-level grants only for registry display fields; configuration, lock tokens and operational errors stay service-only to prevent metadata exposure.
- Future Experience is an additive CSS-token rollout keyed by the existing theme selection; old theme IDs/defaults and backend contracts remain unchanged, while new appearance/density choices stay local to avoid schema changes.
- Deferred assistant loading retains the existing transport, account-scoped persistence and first-session greeting; the lightweight launcher is available immediately so optional chat code does not block first paint.
- Shared contextual navigation uses only existing public destinations and never links guessed or role-restricted parents; this preserves bookmarked routes and authorization boundaries.
