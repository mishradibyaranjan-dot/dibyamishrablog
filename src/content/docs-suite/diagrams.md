# Architecture & Flow Diagrams

**Classification:** Confidential — Super Admin only
Diagrams are Mermaid sources; paste any block into a Mermaid renderer.

---

## 1. System context

    graph TD
      V[Visitor] --> W[Edge Worker: SSR + RPC]
      U[Authenticated user] --> W
      A[Super Admin] --> W
      S[Cron scheduler] --> W
      M[MCP agent client] --> W
      W --> DB[(Postgres with RLS)]
      W --> ST[(Object storage)]
      W --> AI[AI gateway]
      W --> EM[Email delivery]

## 2. Container view

    graph LR
      subgraph Browser
        R[React 19 routes]
        Q[TanStack Query cache]
      end
      subgraph Edge Worker
        MW[Request middleware]
        SSR[SSR renderer]
        FN[Server functions]
        API[Public server routes]
      end
      R --> Q
      Q --> FN
      R --> API
      MW --> SSR
      MW --> FN
      MW --> API
      FN --> DB[(Postgres)]
      API --> DB

## 3. Documentation suite access flow

    sequenceDiagram
      participant B as Browser
      participant G as Admin route gate
      participant F as getEngineeringDoc
      participant DB as Postgres
      B->>G: open /admin/docs
      G->>G: session? admin role? else Restricted
      B->>F: getEngineeringDoc(id) + bearer token
      F->>F: verify token, read claims.email
      F->>F: email == super admin? else Forbidden
      F->>DB: user_roles lookup as caller (RLS)
      DB-->>F: admin row or empty
      F->>F: empty -> Forbidden
      F-->>B: { title, filename, content }
      B->>B: Blob download

## 4. Contact enquiry flow

    sequenceDiagram
      participant U as Visitor
      participant API as /api/public/contact
      participant DB as Postgres
      participant Q as Email queue
      U->>API: POST form
      API->>API: schema validate, honeypot, rate limit
      API->>API: blocked / disposable domain check
      API->>DB: insert enquiry
      API->>Q: queue owner notification + confirmation
      API-->>U: 200 generic success
      Note over Q: retry job drains failures

## 5. Failed-login and IP blocking

    stateDiagram-v2
      [*] --> Normal
      Normal --> Counting: failed login recorded
      Counting --> Counting: < 5 failures in 15 min
      Counting --> Blocked: 5th failure
      Blocked --> Normal: block expires (60 min) or admin unblock
      Normal --> Blocked: scanner path probe (24h block)

## 6. Visitor tracking with consent

    flowchart TD
      P[Page view] --> C{Analytics consent?}
      C -- no --> X[No network call]
      C -- yes --> T[POST /api/public/track-visit]
      T --> A{Bearer token present?}
      A -- yes --> I[Attach verified user id]
      A -- no --> N[Anonymous visitor id]
      I --> W[Write visit + audit row]
      N --> W
      W --> R[Reports aggregation]

## 7. Logical data model (governance subset)

    erDiagram
      USERS ||--o| PROFILES : has
      USERS ||--o{ USER_ROLES : granted
      VISITORS ||--o{ VISITOR_LOGS : produces
      VISITORS ||--o{ PAGE_VISITS : records
      SECURITY_EVENTS }o--|| IP_BLOCKS : may_trigger
      BLOCKED_EMAIL_DOMAINS ||--o{ SPAM_AUDIT_LOG : audited_by
      FAILED_LOGIN_ATTEMPTS }o--|| IP_BLOCKS : escalates_to

## 8. Release pipeline

    flowchart LR
      D[Change] --> L[Lint + theme token lint]
      L --> T[Unit tests]
      T --> S[Dependency security scan]
      S --> B[Build]
      B --> PV[Preview verification]
      PV --> PB[Publish]
      PB --> V[Post-release checks: SEO, feeds, downloads]
