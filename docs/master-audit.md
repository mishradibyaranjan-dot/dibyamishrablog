# Master audit — 28 October 2026

## Accepted overrides
Seven-day public job visibility, with 24/48/72/168-hour views; four daily refreshes at 07:00, 12:00, 16:00 and 21:00 India time. Internal compatibility estimate is a transparent heuristic, never an official ATS score or hiring prediction. No publication.

## Verified and repaired
- Live public policy already uses seven-day posting and 12-hour link verification, despite older migration text cited by read-only reviewers. Installed schedule matches the four daily runs; five-minute expiry maintenance is disabled.
- Missing 48/72-hour UI, URL and server validation are repaired; timezone defaults no longer overwrite the chosen period. Signed-out browser counts: 37/85/90/254 for 24/48/72/168 hours respectively at test time.
- Daily summary formerly used 24-hour/30-minute limits. Its applied function now aligns with seven-day/12-hour eligibility; database definition readback confirmed.
- Public source registry formerly allowed all-column reads. Applied column privileges deny board configuration and lock tokens, preserve public names/provider/status, and retain service access. Database privilege readback and public listings/source-page checks passed.
- Private My Career, evidence estimate, immutable approval and PDF/Word/PowerPoint generation verified signed in. Exported factual text preserved in all formats; synthetic PDF visually inspected without clipping/overlap. Signed-out workspace redirects to sign-in; phone layout has no horizontal overflow. No runtime errors in these flows; 81 targeted tests passed.
- Content metadata review checked shared helper patterns and added missing /blog metadata. Private resume/workspace pages have noindex. Repository utility excluded from static sitemap. Full metadata uniqueness and Google rendered-result acceptance are not certified.

## Partial, blocked or unverified
- Source inventory: 21 connected official employer/provider feeds. Restricted Naukri, LinkedIn, Foundit/IIMjobs, Indeed/Glassdoor and Workday coverage is not connected without authorized access. Adzuna needs credentials. Do not claim all Indian portals are connected or scrape restricted services.
- Database inventory showed 39 India-tagged jobs, 34 fresh/open before full public checks. Country metadata is inconsistent across international providers; do not interpret missing/region-valued countries as proof of no India jobs. No full country backfill or new source sync was run in this validation.
- Connected source status and terms notes are not independently validated contractual redistribution permission. Automatic AUTHORIZED classification lacks a dedicated permission evidence record; provider/legal approval remains an acceptance requirement.
- Jobs admin operations check protected role plus aal2 server-side. Fresh owner MFA enrollment/export workflow was not exercised; UI access is not a security guarantee.
- Deep security scan was still running at last status check; no clean certification. Independent cross-account penetration testing remains outstanding. Existing managed email/newsletter/assistant production deliveries were not rerun by this focused audit.
- Originals remain no-read quarantined because no scanner is connected. Large documents, exhaustive Unicode script coverage, every slide layout, accessibility tooling and unattended expiry callbacks require further acceptance.
- Email job digests require an authorized marketing provider; in-app alerts do not imply email delivery. Optional voice/curated retrieval/technical sandbox remain unverified or unimplemented, not silently claimed complete.
- Production Google results, indexing authorization, field performance and callback reachability require deployed acceptance. This change does not certify zero cloud cost or production readiness.

## Rollback and operations
Keep additive schema and immutable user versions; never remove user records as rollback. Preserve narrowed privileges and private policies. Review the existing roadmap for credential/owner/deployment dependencies. Run generation only after explicit consent; latest approved text alone permits export.