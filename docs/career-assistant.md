# Career Assistant — Engineering and Acceptance

## Scope and decisions
Seven-day public jobs default; 24/48/72/168-hour filters remain available. Resume matching is qualitative and evidence-only, with no ATS/readiness score or hiring prediction. Private original text is preserved, versions are immutable and latest-version approval is required for generation. Optional final PDF is not implemented.

## Data and security
career_resumes owns the sanitized original/JD snapshot, analysis/recommendations, consent, expiry and lease. career_resume_versions stores content, decisions, template and approval; career_resume_approvals records decisions; career_generated_documents records metadata. Owner RLS checks the unexpired parent; service-only RPCs commit analysis/version changes. Original files use private no-read quarantine; integrity checks are not antivirus scanning. No scanner is connected. Expiry cleanup removes storage objects first, then metadata, through existing jobs callbacks and owner reads, bounded to 100 reviews per invocation.

## Contracts
Authenticated server functions create/list/save versions/read approved content/record generation/delete reviews. Job contexts read existing public freshness policy. POST /api/public/resume-analysis validates a bearer, owner, retention, durable pause, usage reservation and processing lease; streamed NDJSON conveys progress and terminal failures. Shared server-only Responses generation validates exact evidence. Browser DOCX/PPTX generation uses authorized approved text and validates ZIP/XML before showing download.

## Verification
41 targeted career/interview/jobs tests passed. Real private synthetic flow exercised AI review, approval, editable Word/PowerPoint downloads, recovery after reload and approved-resume interview transfer. Changes or draft saving blocked export; signed-out analysis returned 401 and showed no private assessment. Mobile inspection had no horizontal overflow. Synthetic fixture deletion was confirmed by subsequent unavailable review readback.

## Outstanding acceptance
No publishing performed. Original malware scanning requires a connected scanner. Independent cross-account isolation testing, complete deep security review, published callback reachability/unattended cleanup and exhaustive large-document/all-slide accessibility checks remain pending. Do not describe this preview as production-ready.