# Restore reliable scheduled job refreshes

## Confirmed problem
The current refresh processes four complete employer feeds concurrently and retains feed snapshots, write rows and verification evidence in one request. It then performs global duplicate processing and AI classification. This matches the supplied production memory-limit failures. No newer jobs-sync logs were available in the last-hour log view.

A smaller change such as reducing concurrency alone would only mitigate the problem: a single large feed could still exhaust memory. Cutting off a feed could incorrectly close real jobs. The repair therefore needs coordinated changes rather than a one-line patch.

## Changes
1. Keep the four daily starts at **07:00, 12:00, 16:00 and 21:00 India time**. Dispatch bounded, authenticated source work in separate requests so one large source cannot crash every other source. Reuse existing scheduling and server-only authorization; no paid service or extra frequent polling.
2. Read provider pages where officially supported. For full-board APIs, stream records with bounded buffers and trim unused descriptions early. Oversized or incomplete responses must fail safely without closing missing jobs.
3. Write jobs and verification evidence in small batches. Page prior/open job reads, use set-based membership, and finalize closure only after a complete successful source snapshot. Preserve original publication dates, saved links, AI results and moderation holds.
4. Bound duplicate processing and separate optional classification/retention work from feed requests. Keep durable source leases; expire interrupted audit runs during the next scheduled start, and never clear another request's live lease.
5. Preserve public access, seven-day freshness, the twelve-hour application-check visibility window and owner-only private data. Do not hide the failure by weakening visibility rules.

## Technical approach
- Inspect existing cron dispatch, lock RPCs and authorization before selecting the exact fan-out mechanism. Store credentials only in existing server-side configuration, never in public responses or migrations.
- Add an authenticated single-source mode and a bounded dispatcher. Keep manual administrator refresh compatible with the same execution path.
- Record completion/failure per source, including partial snapshot outcomes; retries remain on the existing durable backoff.
- Apply any database/schema changes with appropriate grants and policies; do not change the public job freshness policy.

## Verification
- Test large-feed buffering, batched writes, pagination and partial-feed closure protection.
- Test interrupted leases, concurrent dispatch, unauthorized requests and one-source failure isolation.
- Retain the existing four-time schedule and seven-day visibility tests.
- Exercise real source ingestion and verify updated listings read back through the Jobs page.
- Check preview compilation and runtime errors. Production memory recovery can only be confirmed after authorized publication and a completed scheduled run.

## Already completed separately
The PDF rejection finding is fixed in preview: parsed document checks accept normal initial-view destinations and ignore opaque compressed bytes while rejecting executable actions and attachments. Thirteen tests passed; the real resume upload form extracted a normal PDF and rejected an active PDF. Originals remain quarantined. Nothing has been published.