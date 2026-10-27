// Job collection, verification, classification, de-duplication and expiry.
// Server-only. Every adapter reads an official, documented public feed.
import {
  parsePostedAt, isFresh, expiresAt, classifyLevel, classifyCategories,
  classifyArrangement, checkApplyUrl, dedupeKey, slugify,
} from "./rules";
import { retryDelayMinutes } from "./scheduling";
import { verifyApplication } from "./verify.server";
import { safeSnapshot, canonicalApplication } from "./verification";

type Source = { id: string; slug: string; name: string; provider: string; board_token: string | null; failure_count: number };

export type NormalizedJob = {
  source_job_id: string;
  title: string;
  company: string;
  location: string | null;
  department: string | null;
  employment_type: string | null;
  is_remote: boolean | null;
  posted_raw: unknown;
  source_url: string;
  apply_url: string;
  summary: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
};

const UA = { "User-Agent": "DibyaMishraJobs/1.0 (+https://www.dibyamishra.co.in/jobs/sources)" };

function stripHtml(s: string | null | undefined): string | null {
  if (!s) return null;
  const t = s.replace(/<[^>]+>/g, " ").replace(/&nbsp;|&amp;|&lt;|&gt;|&#39;|&quot;/g, " ").replace(/\s+/g, " ").trim();
  return t ? t.slice(0, 600) : null;
}

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(20_000) });
  if (res.status === 429) throw new Error("rate_limited");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const adapters: Record<string, (s: Source) => Promise<NormalizedJob[]>> = {
  async greenhouse(s) {
    const d = (await getJson(`https://boards-api.greenhouse.io/v1/boards/${s.board_token}/jobs`)) as { jobs: any[] };
    return d.jobs.map((j) => ({
      source_job_id: String(j.id), title: j.title, company: s.name, location: j.location?.name ?? null,
      department: null, employment_type: null, is_remote: null,
      posted_raw: j.first_published ?? null, // original publication, never updated_at
      source_url: j.absolute_url, apply_url: j.absolute_url, summary: null,
      salary_min: null, salary_max: null, salary_currency: null,
    }));
  },
  async lever(s) {
    const d = (await getJson(`https://api.lever.co/v0/postings/${s.board_token}?mode=json`)) as any[];
    return d.map((j) => ({
      source_job_id: j.id, title: j.text, company: s.name, location: j.categories?.location ?? null,
      department: j.categories?.team ?? null, employment_type: j.categories?.commitment ?? null,
      is_remote: j.workplaceType === "remote" ? true : null, posted_raw: j.createdAt ?? null,
      source_url: j.hostedUrl, apply_url: j.applyUrl ?? j.hostedUrl, summary: stripHtml(j.descriptionPlain ?? j.description),
      salary_min: j.salaryRange?.min ?? null, salary_max: j.salaryRange?.max ?? null, salary_currency: j.salaryRange?.currency ?? null,
    }));
  },
  async ashby(s) {
    const d = (await getJson(`https://api.ashbyhq.com/posting-api/job-board/${s.board_token}`)) as { jobs: any[] };
    return d.jobs.filter((j) => j.isListed !== false).map((j) => ({
      source_job_id: j.id, title: String(j.title).trim(), company: s.name, location: j.location ?? null,
      department: j.department ?? null, employment_type: j.employmentType ?? null,
      is_remote: j.isRemote ?? null, posted_raw: j.publishedAt ?? null,
      source_url: j.jobUrl, apply_url: j.applyUrl ?? j.jobUrl, summary: stripHtml(j.descriptionPlain ?? j.descriptionHtml),
      salary_min: null, salary_max: null, salary_currency: null,
    }));
  },
  async remoteok() {
    const d = (await getJson("https://remoteok.com/api")) as any[];
    return d.filter((j) => j && j.id && j.position).map((j) => ({
      source_job_id: String(j.id), title: j.position, company: j.company, location: j.location || "Worldwide (remote)",
      department: (j.tags ?? []).join(" "), employment_type: null, is_remote: true, posted_raw: j.date ?? j.epoch ?? null,
      source_url: j.url, apply_url: j.apply_url || j.url, summary: stripHtml(j.description),
      salary_min: j.salary_min || null, salary_max: j.salary_max || null, salary_currency: j.salary_min ? "USD" : null,
    }));
  },
  // Adzuna official job search API (developer.adzuna.com). Credentials are server-only secrets.
  async adzuna(s) {
    const id = process.env.ADZUNA_APP_ID, key = process.env.ADZUNA_APP_KEY;
    if (!id || !key) throw new Error("missing_credentials");
    const country = s.board_token || "in";
    const out: NormalizedJob[] = [];
    for (let page = 1; page <= 10; page++) {
      const d = (await getJson(`https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?app_id=${encodeURIComponent(id)}&app_key=${encodeURIComponent(key)}&results_per_page=50&max_days_old=7&sort_by=date&content-type=application/json`)) as { results?: any[] };
      const r = d.results ?? [];
      for (const j of r) {
        if (!j?.id || !j.redirect_url || !j.created) continue;
        out.push({
          source_job_id: String(j.id), title: String(j.title ?? "").replace(/<[^>]+>/g, "").trim(), company: j.company?.display_name ?? "Employer via Adzuna",
          location: j.location?.display_name ? `${j.location.display_name}${country === "in" && !/india/i.test(j.location.display_name) ? ", India" : ""}` : country === "in" ? "India" : null,
          department: j.category?.label ?? null, employment_type: j.contract_time ?? null, is_remote: null, posted_raw: j.created,
          source_url: j.redirect_url, apply_url: j.redirect_url, summary: stripHtml(j.description),
          salary_min: j.salary_min ?? null, salary_max: j.salary_max ?? null, salary_currency: j.salary_min ? (country === "in" ? "INR" : null) : null,
        });
      }
      if (r.length < 50) break;
    }
    return out;
  },
};

export { countryOf };
const INDIA = /\b(india|ind|bengaluru|bangalore|mumbai|bombay|delhi|ncr|gurugram|gurgaon|noida|hyderabad|secunderabad|pune|chennai|madras|kolkata|calcutta|ahmedabad|kochi|cochin|jaipur|chandigarh|bhubaneswar|indore|coimbatore|lucknow|nagpur|surat|vadodara|visakhapatnam|vizag|mysuru|mysore|thiruvananthapuram|goa|patna|ludhiana|karnataka|maharashtra|tamil nadu|telangana|kerala|gujarat|haryana|punjab|rajasthan|uttar pradesh|andhra pradesh|west bengal|odisha|bihar|madhya pradesh)\b/i;
function countryOf(loc: string | null): string | null {
  if (!loc) return null;
  if (INDIA.test(loc) || /(^|[,\s(-])IN$/.test(loc.trim())) return "India";
  if (/\b(remote|worldwide|anywhere)\b/i.test(loc) && !/,/.test(loc)) return null;
  const parts = loc.split(",").map((p) => p.trim()).filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 1] : null;
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = []; let i = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) { const idx = i++; out[idx] = await fn(items[idx]); }
  }));
  return out;
}

export async function runJobSync(opts: { sourceSlug?: string; force?: boolean } = {}) {
  const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
  let q = db.from("job_sources").select("id,slug,name,provider,board_token,failure_count").eq("active", true).eq("status", "connected");
  if (opts.sourceSlug) q = q.eq("slug", opts.sourceSlug);
  const { data: sources, error } = await q;
  if (error) throw new Error(error.message);

  const results = await mapLimit((sources ?? []) as Source[], 4, async (s) => {
    const adapter = adapters[s.provider];
    if (!adapter) return { source: s.slug, status: "skipped" };
    const token = crypto.randomUUID();
    const claim = await db.rpc("claim_job_source", { p_id: s.id, p_token: token, p_force: Boolean(opts.force) });
    if (claim.error) throw new Error("Could not lock source");
    if (!claim.data) return { source: s.slug, status: "skipped" };
    const { data: run, error: runError } = await db.from("source_sync_runs").insert({ source_id: s.id }).select("id").single();
    if (!run || runError) {
      await db.from("job_sources").update({ locked_until: null, lock_token: null }).eq("id", s.id).eq("lock_token", token);
      return { source: s.slug, status: "failed", error: "Could not start source audit" };
    }
    const now = new Date();
    let fetched = 0, accepted = 0, rejected = 0, closed = 0;
    try {
      const items = await adapter(s);
      fetched = items.length;
      const { data: existing, error: existingError } = await db.from("jobs").select("id,source_job_id,slug,admin_hold,career_level,categories,skills,last_application_checked_at,verification_status").eq("source_id", s.id).gt("original_posted_at", new Date(now.getTime()-86400_000).toISOString());
      if (existingError) throw new Error("Could not read prior source snapshot");
      if (!safeSnapshot(existing?.length ?? 0, items.length)) throw new Error("Incomplete source snapshot: closure processing deferred");
      const previous = new Map((existing ?? []).map((j) => [j.source_job_id, j]));
      const seen: string[] = [];
      const rows = [];
      const evidenceRows: { source_job_id: string; status: string; http_status: number | null; final_url: string; evidence: string }[] = [];
      for (const j of items) {
        seen.push(j.source_job_id);
        const posted = parsePostedAt(j.posted_raw);
        if (!posted || !isFresh(posted, now)) { rejected++; continue; } // no credible timestamp or too old
        const link = checkApplyUrl(j.apply_url);
        const src = checkApplyUrl(j.source_url);
        const old = previous.get(j.source_job_id);
        const due = !old?.last_application_checked_at || now.getTime() - Date.parse(old.last_application_checked_at) >= 30 * 60_000;
        const check = link.ok && src.ok && due ? await verifyApplication(j.apply_url, s.provider, s.board_token) : null;
        const verified = link.ok && src.ok && (check ? check.ok : old?.verification_status === "VERIFIED");
        if (check) evidenceRows.push({ source_job_id: j.source_job_id, status: check.ok ? "VERIFIED" : "QUARANTINED", http_status: check.status, final_url: check.finalUrl, evidence: check.evidence });
        if (!verified) rejected++; else accepted++;
        const text = `${j.title} ${j.location ?? ""}`;
        rows.push({
          source_id: s.id, source_job_id: j.source_job_id,
          slug: old?.slug ?? slugify(j.company, j.title, j.source_job_id.slice(-8)),
          title: j.title, company: j.company, location: j.location, country: countryOf(j.location),
          work_arrangement: classifyArrangement(text, j.is_remote), employment_type: j.employment_type,
          categories: old?.categories ?? classifyCategories(j.title, j.department), career_level: old?.career_level ?? classifyLevel(j.title), skills: old?.skills ?? [],
          salary_min: j.salary_min, salary_max: j.salary_max, salary_currency: j.salary_currency,
          summary: j.summary, source_url: j.source_url, apply_url: j.apply_url,
          original_posted_at: posted.toISOString(), expires_at: expiresAt(posted).toISOString(),
          last_verified_at: now.toISOString(),
          last_application_checked_at: check?.ok ? now.toISOString() : old?.last_application_checked_at ?? null,
          verification_basis: verified ? "authorized_feed_and_live_link" : null,
          canonical_apply_url: link.ok ? canonicalApplication(j.apply_url) : null,
          remote_eligibility: j.is_remote ? j.location : null,
          verification_status: old?.admin_hold ? "QUARANTINED" : verified ? "VERIFIED" : "QUARANTINED",
          verification_notes: check?.evidence ?? (verified ? `Listed in ${s.provider} feed for ${s.name}; recent live link check retained` : "Application destination requires review"),
          application_status: "OPEN", source_access_status: "AUTHORIZED",
          dedupe_key: dedupeKey(j.company, j.title, j.location),
          is_primary: true, updated_at: now.toISOString(),
        });
      }
      if (rows.length) {
        // original_posted_at is only ever set from the source; re-imports carry the same value.
        const { error: upErr } = await db.from("jobs").upsert(rows, { onConflict: "source_id,source_job_id" });
        if (upErr) throw new Error(upErr.message);
        const { data: stored } = await db.from("jobs").select("id,source_job_id").eq("source_id", s.id);
        const ids = new Map((stored ?? []).map((r) => [r.source_job_id, r.id]));
        const logs = evidenceRows.flatMap(({ source_job_id, ...e }) => { const id = ids.get(source_job_id); return id ? [{ job_id: id, ...e }] : []; });
        if (logs.length) { const log = await db.from("job_verifications").insert(logs); if (log.error) throw new Error("Could not record verification evidence"); }
      }
      // Jobs no longer in the feed are closed immediately.
      const { data: open } = await db.from("jobs").select("id,source_job_id").eq("source_id", s.id).eq("application_status", "OPEN");
      const gone = (open ?? []).filter((o) => !seen.includes(o.source_job_id)).map((o) => o.id);
      if (gone.length) {
        for (let i = 0; i < gone.length; i += 100) await db.from("jobs").update({ application_status: "CLOSED", updated_at: now.toISOString() }).in("id", gone.slice(i, i + 100));
        closed = gone.length;
      }
      await db.from("job_sources").update({ last_synced_at: now.toISOString(), last_error: null, failure_count: 0, retry_after: null, locked_until: null, lock_token: null }).eq("id", s.id).eq("lock_token", token);
      await db.from("source_sync_runs").update({ finished_at: new Date().toISOString(), status: "completed", fetched, accepted, rejected, closed }).eq("id", run.id);
      return { source: s.slug, status: "completed", fetched, accepted, rejected, closed };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[jobs:sync] ${s.slug} failed`, msg);
      const failures = s.failure_count + 1;
      await db.from("job_sources").update({ last_error: msg, failure_count: failures, retry_after: new Date(Date.now() + retryDelayMinutes(failures) * 60_000).toISOString(), locked_until: null, lock_token: null }).eq("id", s.id).eq("lock_token", token);
      await db.from("source_sync_runs").update({ finished_at: new Date().toISOString(), status: "failed", fetched, error: msg }).eq("id", run.id);
      return { source: s.slug, status: "failed", error: msg };
    }
  });

  await dedupeAcrossSources();
  return results;
}

/** Keep one primary card per duplicate group, preferring employer ATS over aggregators. */
async function dedupeAcrossSources() {
  const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
  const since = new Date(Date.now() - 7 * 24 * 3600_000).toISOString();
  const { data } = await db.from("jobs").select("id,dedupe_key,canonical_apply_url,source_id,original_posted_at,job_sources(provider)").gt("original_posted_at", since).eq("application_status", "OPEN").eq("verification_status", "VERIFIED").eq("source_access_status", "AUTHORIZED").eq("admin_hold", false).gt("expires_at", new Date().toISOString());
  const groups = new Map<string, any[]>();
  const canonicalGroups = new Map<string,string>();
  for (const r of data ?? []) {
    const key = r.canonical_apply_url ? canonicalGroups.get(r.canonical_apply_url) ?? r.dedupe_key : r.dedupe_key;
    if (r.canonical_apply_url) canonicalGroups.set(r.canonical_apply_url,key);
    groups.set(key, [...(groups.get(key) ?? []),r]);
  }
  const secondary: string[] = [];
  const primary: string[] = [];
  for (const g of groups.values()) {
    g.sort((a, b) => Number((a.job_sources as any)?.provider === "remoteok") - Number((b.job_sources as any)?.provider === "remoteok") || a.original_posted_at.localeCompare(b.original_posted_at));
    primary.push(g[0].id);
    secondary.push(...g.slice(1).map((x) => x.id));
  }
  for (let i = 0; i < secondary.length; i += 100) await db.from("jobs").update({ is_primary: false }).in("id", secondary.slice(i, i + 100));
  for (let i = 0; i < primary.length; i += 100) await db.from("jobs").update({ is_primary: true }).in("id", primary.slice(i, i + 100));
}
