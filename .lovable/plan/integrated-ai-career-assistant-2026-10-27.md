# Integrated AI Career Assistant

## Confirmed requirements
- Keep jobs public and visible for seven days, with the existing four daily refreshes and live-link verification rules unchanged.
- Use **evidence-only resume assessment**. Do not add an ATS score, readiness percentage or hiring prediction.
- Extend the working interview assistant rather than replace it. Keep private resumes, original facts, retention/deletion and explicit approval safeguards.

## 1. Connect verified jobs to preparation and resume review
- Add Analyze My Resume alongside Apply at Source, Interview Prep and Save Job on every shared job-card/detail action group.
- Support `/interview-prep?jobId=...` and `/resume-analyzer?jobId=...`; preserve existing slug-based interview links.
- Retrieve the selected current job by ID and show its permitted description, metadata and original-source link. Clearly identify missing information; never fabricate a full JD or bypass expired-job policies.
- Support standalone pasted or uploaded PDF, DOCX and TXT JDs.

## 2. Private resume upload and evidence analysis
- Create a dedicated resume analyzer with file selection/drop, filename/type/status, explicit processing consent and retention choices.
- Preserve original uploads privately and preserve extracted original text independently of revised versions. Validate size, signatures, archive contents/integrity, extraction limits and potentially active content before processing.
- Extract supported chronology, skills, qualifications, projects and achievements. Compare each JD requirement as clearly demonstrated, partially demonstrated, not demonstrated in the resume or unable to assess, with exact supporting excerpts.
- Show parseability/formatting findings, missing evidence and confidence limits without a numeric score. Do not claim absence of evidence means absence of a skill.

## 3. Review recommendations and preserve versions
- Give each suggestion before/after text, category, severity, rationale, JD requirement, exact original evidence, confidence and approval state.
- Add individual accept, reject and edit actions, before/after preview, bulk acceptance of verified changes only, reject all, save draft and rollback to original.
- Generate revisions from accepted supported changes only. Prevent ambiguous/overlapping replacements and unsupported factual additions; requests for additional facts remain separate from exportable changes.
- Record approval decisions and immutable versions. Require explicit approval of the final preview; subsequent edits invalidate that approval.

## 4. Editable downloads and interview integration
- Offer Professional ATS, Modern Professional and Executive Leadership templates.
- Generate real editable DOCX resumes and PPTX career profiles from the same approved version. Organize presentation sections using supported resume facts, not invented content or screenshots.
- Reopen generated files to validate content/editability; handle long sections without clipped text. Keep existing interview PDF/Word downloads independent.
- Let the user explicitly choose an approved resume version for interview personalization.

## 5. Security, testing and documentation
- Verify signed-in create/read/delete flows and cross-account denial, consent, expiry, rollback, approval enforcement, corrupt/active files, evidence rejection and AI failure handling.
- Exercise the complete flow using a synthetic test resume: real job transfer → upload → streamed analysis → review → final approval → editable downloads → read-back validation → deletion.
- Check desktop/mobile layout and accessibility, plus existing job/interview regressions.
- Update BRD, HLD, LLD, data model, API notes, test plan, security notes and release notes. Clearly separate implemented behavior from release checks that remain unverified. Do not publish.

## Technical approach
- Use existing TanStack Start, Lovable Cloud authentication/RLS and server-only streaming AI helpers; keep credentials and personal document contents out of browser telemetry/logs.
- Add owner-scoped resume, version, matching, recommendation, approval and generated-document records with explicit grants and retention controls. Reuse existing interview analysis structures where appropriate without breaking their semantics.
- Read document text on-device; retain originals in private storage only after consent. Return only owner-authorized expiring download links. Use a shared job-context resolver for ID and legacy slug flows.
- Extend existing durable usage controls and service-pause handling for AI work; cache reusable results and avoid new polling schedules.
- Use pure-JavaScript/browser-compatible document generation and validation; no server processes or native document converters.

## Important limitation
File validation and active-content rejection are not a substitute for antivirus scanning. No working malware-scanning service has been established for this project. Keep retained originals quarantined and unavailable for download until a real scanner confirms they are safe; text-only review can continue after strict local validation. Production acceptance for scanned original-file recovery remains blocked until an appropriate scanning service is connected. AI usage and private storage may incur costs; zero investment is not guaranteed.