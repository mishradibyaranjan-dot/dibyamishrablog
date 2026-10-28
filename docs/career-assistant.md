# Career Assistant — Engineering and Acceptance

## Scope and decisions
Seven-day public jobs default; 24/48/72/168-hour filters remain available. Requirement observations and recommendations remain qualitative and evidence-only. A separate user-approved internal compatibility estimate is not an official ATS score or hiring prediction. Private original text is preserved, versions are immutable and latest-version approval is required for generation. Approved PDF export and the private My Career workspace are implemented.

## Data and security
career_resumes owns the sanitized original/JD snapshot, analysis/recommendations, consent, expiry and lease. career_resume_versions stores content, decisions, template and approval; career_resume_approvals records decisions; career_generated_documents records metadata. Owner RLS checks the unexpired parent; service-only RPCs commit analysis/version changes. Original files use private no-read quarantine; integrity checks are not antivirus scanning. No scanner is connected. Expiry cleanup removes storage objects first, then metadata, through existing jobs callbacks and owner reads, bounded to 100 reviews per invocation.

## Contracts
Authenticated server functions create/list/save versions/read approved content/record generation/delete reviews. Job contexts read existing public freshness policy. POST /api/public/resume-analysis validates a bearer, owner, retention, durable pause, usage reservation and processing lease; streamed NDJSON conveys progress and terminal failures. Shared server-only Responses generation validates exact evidence. Browser DOCX/PPTX/PDF generation uses authorized approved text and validates ZIP/XML before showing download.

## Verification
41 targeted career/interview/jobs tests passed. Real private synthetic flow exercised AI review, approval, editable Word/PowerPoint downloads, recovery after reload and approved-resume interview transfer. Changes or draft saving blocked export; signed-out analysis returned 401 and showed no private assessment. Mobile inspection had no horizontal overflow. Synthetic fixture deletion was confirmed by subsequent unavailable review readback.

## Outstanding acceptance
No publishing performed. Original malware scanning requires a connected scanner. Independent cross-account isolation testing, complete deep security review, published callback reachability/unattended cleanup and exhaustive large-document/all-slide accessibility checks remain pending. Do not describe this preview as production-ready.

## Compatibility and workspace validation — 28 October 2026
Weights: skills 30, experience 25, achievements 15, formatting 15, keywords 10, completeness 5. Unassessable factors are excluded and remaining weights normalized. Formatting is never awarded from plain text; keyword overlap is lexical, not skill proof. Requirement categories use a transparent regex heuristic and can overlap; section headings affect completeness. The estimate has no employer ATS validation or outcome calibration. Each evidence excerpt must exist in the supplied text.

Signed-in My Career loaded reviews, interview history, saves, alerts and document history without runtime errors. A synthetic approved resume generated PDF/DOCX/PPTX; all three retained candidate, employer and skill facts as real text. PDF visually inspected: no clipping or overlap in the one-page fixture. Large/multilingual documents and every presentation layout remain unverified.
