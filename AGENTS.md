# Project engineering rules

- Send bulk newsletter email with bounded concurrency and never sleep inside request handlers; managed delivery and explicit retries handle rate limits.
- Newsletter sends must include a stable per-recipient unsubscribe token and retain the public `/email/unsubscribe` compatibility route.
- Keep theme, language, and accessibility controls directly available in both the main menu and footer so display preferences never depend on nested panels.
- Full-page automatic translation is opt-in, lazy-loaded for non-English selections, and must preserve English as the authored source.
- Custom brand colours override only semantic brand tokens, persist locally, and always calculate a readable primary-button foreground.- Keep verified resume facts (roles, achievements, certifications) in `src/lib/profile.ts` and render portfolio pages from it, so no page invents or diverges on figures.
- Jobs platform: public job visibility (verified, open, primary, posted <24h, recently checked) is enforced by the `jobs` table's database policy, not only by the sync worker, so expired jobs vanish even if cron stalls.
- Job sources are adapters keyed by provider; official feeds only, durable source locks enforce polling/backoff, and a database trigger preserves original publication times to prevent refreshes from renewing expired jobs.
- Jobs personal saves/searches use owner-scoped policies and the same public freshness policy for matches; in-app alerts do not imply email delivery.
- Jobs admin RPCs require both the protected admin role and authenticated aal2; the authenticator UI is not the security boundary.
- AI job classification uses server-only streaming Responses calls, verbatim employer evidence, cached outputs and durable pause state; factual job fields are never rewritten by AI.
- Page-speed samples require analytics consent and store only coarse path/device, metric/value/rating; no identifiers or query parameters.
- Public jobs additionally require authorized-feed evidence and an approved live application check within 30 minutes; redirects are manually validated against provider/board allowlists before fetching.
- Source refreshes preserve stable slugs, AI classifications and moderation holds; publication and verification transitions have durable audit records.
- Sitemap dynamic content uses public credentials, paginated policy-filtered rows and an explicit unavailable response on errors; private utility routes are excluded.
