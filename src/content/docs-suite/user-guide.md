# User & Administrator Guide

**Classification:** Confidential — Super Admin only

---

## Part A — Visitor guide

### Navigating
The header links the main sections: About, Expertise, Advisory, Projects,
Research, Case Studies, Blog, Learn, Newsletter and Contact. Press Cmd+K (or
Ctrl+K) anywhere to open global search across posts, case studies, learn modules
and pages.

### Themes
Use the theme control in the header to pick any of the available light and dark
palettes. The choice is remembered on the device, and for signed-in users it
follows the account across devices.

### Cookies and privacy
On the first visit a notice appears. Optional categories are off until accepted.
Preferences can be reopened at any time from the footer link and reset to the
default state. Analytics scripts load only after the matching category is
accepted.

### AI assistant
Open the floating chat button to ask about the site's research, services and
learning content. The assistant answers from curated site knowledge. Use the
read-aloud control to hear an answer; audio starts after you press play.

### Learn
Browse modules by topic or search. Each module may include a narrated video with
captions, diagrams and an inline PDF reader. Progress is saved automatically for
signed-in users.

### Downloads
Whitepapers and guides are available from the repository and playbook pages.
Downloads are served through the application, so links never expose storage
locations.

### Contact
Complete the contact form; the privacy notice link explains how the submission is
handled. A confirmation email is sent to the address provided.

## Part B — Administrator guide

Administrative surfaces are reachable from the account menu after signing in with
the owner account. They are excluded from search engines.

### Reports
Choose a range (24h, 7d, 14d, 30d). The page shows KPI cards, a visits vs unique
visitors chart, top pages and tabs, traffic sources, countries and devices, an
identified-visitor table and CSV export. All figures are aggregated server-side.

### Contact enquiries
Search, review and reply to enquiries; export as CSV; monitor submission volume.

### Blocked domains
Add a domain with an optional reason, or remove one. Validation mirrors the
database rules: lowercase, no @, must contain a dot. Subdomains of a blocked
domain are blocked automatically.

### Spam audit log
Filter by action type to review blocked login attempts and blocklist changes.
The log is append-only; entries cannot be edited or deleted.

### Security events
The Events tab lists severity-filtered events with paths, IPs and the action
taken. The Blocked IPs tab lists active blocks with expiry and an Unblock action
behind a confirmation.

### Visitor tracking audit
Review every tracking write attempt with its outcome and reason, plus alerting
for suspicious patterns.

### Engineering documentation (Super Admin only)
Available at Admin → Engineering docs. Only the owner account
(mishra.dibyaranjan@gmail.com) can open it; every other account, including any
other administrator, receives a restricted response and no content.

To use it:

1. Select a document from the grouped index to preview it in the reading pane.
2. Use **Download** on a card to save that document as Markdown.
3. Use **Download full suite** to save every document as one Markdown file with a
   table of contents.

Documents included: BRD, SRS, HLD, LLD, architecture diagrams, test strategy and
cases, this user guide, and the release notes.

### Newsletter
Generate a draft issue, review and compare versions, schedule the send, and
monitor delivery. Unsubscribes are honoured immediately.

## Part C — Troubleshooting

| Symptom | Check |
|---|---|
| Restricted card on an admin page | Signed in with the owner account? |
| Documentation index empty | Session may have expired; reload and sign in again |
| Download does nothing | Browser blocking generated files; allow downloads |
| No analytics data | Analytics cookie category accepted? |
| Email not received | Check the enquiry's send state and the retry job |
| Audio will not play | Press the play control directly; autoplay is blocked |


## Career assistant walkthrough
From a job card or details choose Analyze My Resume or Interview Prep. A permitted employer excerpt loads automatically; missing descriptions require a permitted pasted/uploaded JD. Jobs never require sign-in; private reviews do.
Consent, upload PDF/DOCX/TXT or paste text, choose retention and analyze. Read exact evidence and limitations, then accept/reject/edit suggestions. Unsupported suggestions cannot be applied. Preview and save drafts; explicitly approve final content before generating Word, PowerPoint or PDF. Download appears only after successful creation. Any edit requires renewed approval. Restore a version as a draft or revert to original. Use Prepare with approved resume for interview practice. Choose a saved private review to recover it after reloading; Delete removes original upload and all versions. Quarantined binaries cannot be downloaded because no scanner is connected.


## Career workspace update — 28 October 2026
Private My Career groups resume reviews, approved version counts, interview sessions, saved jobs/alerts and generated document history. The internal estimate exposes weights, exclusions, exact evidence and limitations, with no hiring prediction. Approved PDF is available alongside editable Word/PowerPoint. Seven-day jobs with 24/48/72-hour selections and four daily refreshes remain unchanged. No publication or scanner certification is claimed.
