# Project engineering rules

- Send bulk newsletter email with bounded concurrency and never sleep inside request handlers; managed delivery and explicit retries handle rate limits.
- Newsletter sends must include a stable per-recipient unsubscribe token and retain the public `/email/unsubscribe` compatibility route.
- Keep theme, language, and accessibility controls directly available in both the main menu and footer so display preferences never depend on nested panels.