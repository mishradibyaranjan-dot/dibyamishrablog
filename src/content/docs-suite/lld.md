# Low-Level Design (LLD)

**Classification:** Confidential — Super Admin only

---

## 1. Module: engineering documentation suite

### 1.1 Files

| File | Role |
|---|---|
| src/content/docs-suite/*.md | Document sources |
| src/lib/docs-suite.server.ts | Server-only registry; imports Markdown raw |
| src/lib/docs-suite.functions.ts | Server functions: list + fetch one |
| src/routes/_authenticated/admin/docs.tsx | Admin UI: index, preview, downloads |

### 1.2 Registry shape

    type DocMeta = {
      id: string;            // stable slug, used as the RPC key
      title: string;
      category: "Requirements" | "Design" | "Quality" | "Operations";
      summary: string;
      filename: string;      // download name
      bytes: number;         // computed from content length
    };

The registry is a frozen record keyed by id. Unknown ids resolve to a thrown
"Not found" error; the id is validated with a schema before lookup.

### 1.3 Authorization sequence

    listEngineeringDocs / getEngineeringDoc
      1. requireSupabaseAuth middleware → { supabase, userId, claims }
      2. claims.email (lowercased) must equal the Super Admin address
      3. user_roles lookup through the caller's RLS client must return 'admin'
      4. only then read the registry and return data
      Any failure → throw new Error("Forbidden"); no partial payload

Step 2 precedes step 3 so a role granted in error still cannot open the suite.

### 1.4 Client contract

    listEngineeringDocs() → { docs: DocMeta[]; generatedAt: string }
    getEngineeringDoc({ id }) → { id, title, filename, content }

### 1.5 Download implementation

    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    anchor.href = url; anchor.download = filename; anchor.click();
    URL.revokeObjectURL(url);

The bundle download fetches every document sequentially, concatenates them with
a table of contents and horizontal rules, and downloads one .md file. No
server-side archive step is required, which keeps the Worker free of native
compression dependencies.

### 1.6 UI states

| State | Rendering |
|---|---|
| loading | spinner in a centred grid |
| forbidden | restricted card (from the admin layout gate) |
| error | inline card with the generic message and a retry button |
| ready | category-grouped cards + preview pane |
| preview loading | skeleton lines inside the pane |

## 2. Module: security middleware (existing, documented)

    securityMiddleware(request):
      if path startsWith '/.well-known/' → next()
      ip = cf-connecting-ip ?? x-real-ip ?? first hop of x-forwarded-for
      if isIpBlocked(ip)        → 403
      if isScannerPath(path)    → recordSecurityEvent(critical); blockIp(24h); 403
      next()

Never throws; all failures are caught and logged.

## 3. Module: reports aggregation (existing, documented)

- Single POST server function, admin-checked.
- All reads run in Promise.all, each with a gte time filter and a hard limit.
- Time series bucketed by UTC day server-side and zero-filled.
- Returns plain DTOs; panels receive the payload as props.

## 4. Data access patterns

| Pattern | Rule |
|---|---|
| Read as caller | context.supabase (RLS applies) |
| Aggregate across tables | service-role client, imported inside the handler |
| Public read | publishable client created in-handler, narrow anon SELECT policy |
| Write to audit tables | service role only; clients denied by restrictive policy |

## 5. Error taxonomy

| Thrown | Meaning | Client sees |
|---|---|---|
| Unauthorized: ... | No/invalid bearer token | Sign-in redirect |
| Forbidden | Authenticated but not permitted | Restricted card |
| Not found | Unknown document id | Inline error |
| Anything else | Unexpected | "Something went wrong." + logged id |

## 6. Naming and structure conventions

- Server functions live in *.functions.ts and are thin wrappers: imports, types
  and exported declarations only.
- Server-only logic lives in *.server.ts and is never imported by components.
- Colours come from semantic tokens; CI lints for palette and hex literals.
- Route ids in createFileRoute match the filename mapping exactly.

## 7. Extensibility

Adding a document requires three steps: add the Markdown file, register it in the
server registry with metadata, and nothing else — the admin page renders from the
registry, so no UI change is needed.
