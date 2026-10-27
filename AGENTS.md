# Project engineering rules

- Send bulk newsletter email with bounded concurrency and never sleep inside request handlers; managed delivery and explicit retries handle rate limits.
- Newsletter sends must include a stable per-recipient unsubscribe token and retain the public `/email/unsubscribe` compatibility route.
- Keep theme, language, and accessibility controls directly available in both the main menu and footer so display preferences never depend on nested panels.
- Full-page automatic translation is opt-in, lazy-loaded for non-English selections, and must preserve English as the authored source.
- Custom brand colours override only semantic brand tokens, persist locally, and always calculate a readable primary-button foreground.- Keep verified resume facts (roles, achievements, certifications) in `src/lib/profile.ts` and render portfolio pages from it, so no page invents or diverges on figures.
- Jobs platform: public job visibility (verified, open, primary, posted <24h, recently checked) is enforced by the `jobs` table's database policy, not only by the sync worker, so expired jobs vanish even if cron stalls.
- Job sources are adapters in `src/lib/jobs/sync.server.ts` keyed by `job_sources.provider`; only official public feeds are used and a job's original posting time is always taken from the source, never the import time.
