# Fix newsletter delivery and accessibility regressions

## Scope
- Stop newsletter publishing from waiting serially or sleeping on rate limits.
- Restore a working unsubscribe path for existing and future newsletter emails.
- Keep sticky and fixed controls correctly positioned in accessibility modes.

## Implementation
1. Send newsletter recipients in small concurrent batches and return rate-limit failures immediately for the existing retry workflow.
2. Restore per-recipient unsubscribe tokens, pass them to managed email delivery, add the unsubscribe link to newsletter content, and restore the `/email/unsubscribe` endpoint.
3. Apply visual filters to a dedicated content wrapper rather than `body`, while preserving fixed/sticky navigation and controls.
4. Add a migration that preserves the unsubscribe-token table for fresh deployments.
5. Verify the build and the affected browser behavior, then resolve only these three monitoring findings.

## Technical details
- Managed delivery remains the email transport; no legacy send queue is restored.
- Sending uses bounded concurrency to avoid sequential request growth and uncontrolled bursts.
- The unsubscribe endpoint supports browser confirmation and RFC 8058 one-click POST requests.
