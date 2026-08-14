# Business Requirements Document (BRD)

**Product:** dibyamishra.co.in — Executive Portfolio, Advisory & Learning Platform
**Owner:** DIAA IT Solutions Pvt Ltd
**Document status:** Baselined
**Classification:** Confidential — Super Admin only

---

## 1. Purpose

Define the business rationale, stakeholders, scope and success measures for the
platform. This document is the contractual reference for what the business needs;
the SRS translates it into system behaviour.

## 2. Business context

The platform serves as the primary digital presence for an enterprise technology
leader. It has three commercial jobs to do:

1. **Credibility** — present research, case studies and measurable outcomes in a
   form senior buyers trust.
2. **Conversion** — turn anonymous traffic into qualified advisory enquiries and
   newsletter subscribers.
3. **Enablement** — deliver a self-serve learning library (modules, videos,
   whitepapers) that keeps the audience returning.

## 3. Stakeholders

| Stakeholder | Interest | Involvement |
|---|---|---|
| Owner / Super Admin | Brand, pipeline, data governance | Approves all scope |
| Prospective clients | Proof of capability, ease of contact | Primary audience |
| Newsletter subscribers | Ongoing insight | Recurring audience |
| Learners | Structured AI/cloud learning | Secondary audience |
| Data protection (self-administered) | Lawful processing, consent | Sign-off on privacy |

## 4. Business objectives and success measures

| ID | Objective | Measure | Target |
|---|---|---|---|
| BO-1 | Increase qualified enquiries | Contact submissions / month | Upward trend, spam < 2% |
| BO-2 | Grow owned audience | Newsletter subscribers | Net growth monthly |
| BO-3 | Demonstrate authority | Research + case study pageviews | Top-5 pages by views |
| BO-4 | Retain learners | Learn module completion rate | > 40% per started module |
| BO-5 | Protect the estate | Critical security findings | 0 open |
| BO-6 | Search visibility | Indexed routes, rich results | All public routes indexed |

## 5. Scope

### 5.1 In scope

- Public marketing surfaces: Home, About, Expertise, Advisory, Projects,
  Research, Case Studies, Blog, Playbook, Guide, Newsletter, Contact, Trust.
- Legal surfaces: Privacy Notice, Copyright & Content Use, Terms of Use, cookie
  consent with category gating.
- Learning platform: modules, inline PDF reader, narrated videos, search,
  progress tracking.
- Document repository with server-mediated PDF downloads.
- AI assistant (chat) grounded in site knowledge, with voice read-aloud.
- Newsletter generation, scheduling and delivery.
- Visitor identification and analytics with audit logging.
- Admin suite: Reports, Contact Enquiries, Blocked Domains, Spam Audit,
  Security Events, Visitor Tracking Audit, Engineering Documentation.
- Agent integration surface (MCP) with scoped tools.

### 5.2 Out of scope

- E-commerce / paid checkout.
- Multi-tenant customer accounts or per-client workspaces.
- Native mobile applications.
- Third-party CRM synchronisation.

## 6. Business requirements

| ID | Requirement | Priority |
|---|---|---|
| BR-1 | Every public page must be readable without an account | Must |
| BR-2 | Enquiries must reach contactme@dibyamishra.co.in and be visible in an admin queue | Must |
| BR-3 | Spam and disposable email domains must be refused at every entry point | Must |
| BR-4 | All analytics must be consent-gated and IP-hashed | Must |
| BR-5 | Administrative and governance data must be visible to the Super Admin only | Must |
| BR-6 | The engineering documentation suite must be downloadable in-app by the Super Admin only | Must |
| BR-7 | Content must carry copyright and reproduction notices site-wide | Must |
| BR-8 | Themes must be selectable and persist per user across devices | Should |
| BR-9 | The site must degrade gracefully with motion, audio and JS restrictions | Should |
| BR-10 | Newsletter issues must be generatable with AI assistance and reviewable before send | Should |

## 7. Assumptions

- A single owner operates the platform; there is no delegated admin team.
- Backend, auth, storage and scheduled jobs are provided by Lovable Cloud.
- Email delivery uses the verified sending domain notify.dibyamishra.co.in.

## 8. Constraints

- Runtime is an edge Worker: no native binaries, no long-running processes.
- Router and framework are fixed (TanStack Start v1 + React 19 + Tailwind v4).
- All colour must come from semantic theme tokens; no palette or hex literals.

## 9. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Automated abuse of public forms | Spam, cost | Honeypot, rate limits, CAPTCHA fallback, domain blocklist |
| Credential compromise of owner account | Full data exposure | Session timeouts, role trigger, audit trail |
| Analytics over-collection | Regulatory exposure | Consent gating, IP hashing, retention purge |
| AI answers drifting from facts | Reputational | Grounded knowledge base, no free-form claims |

## 10. Acceptance

The release is accepted when: all Must requirements are demonstrated, the
security scan reports zero critical or high findings, SEO checks pass, and the
Super Admin can download the full documentation suite from within the app.
