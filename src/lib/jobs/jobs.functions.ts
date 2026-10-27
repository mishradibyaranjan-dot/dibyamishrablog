import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { hasJobsAdminAccess } from "./access";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

const PUBLIC_COLS =
  "id,slug,title,company,location,country,work_arrangement,employment_type,categories,career_level,salary_min,salary_max,salary_currency,summary,source_url,apply_url,original_posted_at,expires_at,last_verified_at,last_application_checked_at,remote_eligibility,skills,verification_status,job_sources(name,provider)";

export const jobFilters = z.object({
  q: z.string().max(120).optional().default(""),
  level: z.string().max(60).optional().default(""),
  category: z.string().max(60).optional().default(""),
  country: z.string().max(60).optional().default(""),
  arrangement: z.enum(["", "remote", "hybrid", "onsite"]).optional().default(""),
  company: z.string().max(80).optional().default(""),
  city: z.string().max(80).optional().default(""),
  region: z.string().max(80).optional().default(""),
  skill: z.string().max(80).optional().default(""),
  industry: z.string().max(80).optional().default(""),
  employment: z.string().max(60).optional().default(""),
  source: z.string().max(80).optional().default(""),
  currency: z.string().max(3).optional().default(""),
  salary: z.number().min(0).max(1e9).optional().default(0),
  experience: z.number().min(0).max(80).optional().default(0),
  checked: z.number().refine((n) => [0,15,30].includes(n)).optional().default(0),
  hours: z.number().int().refine((h) => [1, 3, 6, 12, 24, 168].includes(h)).optional().default(24),
  page: z.number().int().min(1).max(200).optional().default(1),
});
export type JobFilters = z.infer<typeof jobFilters>;
const PAGE = 20;

export const listJobs = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => jobFilters.parse(d ?? {}))
  .handler(async ({ data }) => {
    const db = publicClient();
    // Database policy already restricts to verified, open jobs < 7 days old; the window filter narrows further.
    let q = db.from("jobs").select(PUBLIC_COLS, { count: "exact" })
      .gt("original_posted_at", new Date(Date.now() - data.hours * 3600_000).toISOString())
      .order("original_posted_at", { ascending: false })
      .range((data.page - 1) * PAGE, data.page * PAGE - 1);
    const terms = data.q.trim().split(/\s+/).map((w) => w.replace(/[^\p{L}\p{N}]/gu, "")).filter(Boolean).map((w) => `${w}:*`).join(" & ");
    if (terms) q = q.textSearch("search", terms, { config: "simple" });
    if (data.level) q = q.eq("career_level", data.level);
    if (data.category) q = q.contains("categories", [data.category]);
    if (data.country) q = q.eq("country", data.country);
    if (data.arrangement) q = q.eq("work_arrangement", data.arrangement);
    if (data.company) q = q.ilike("company", data.company.replace(/[%_]/g, ""));
    const match = (v: string) => `%${v.replace(/[%_]/g, "")}%`;
    if (data.city) q = q.ilike("location", match(data.city));
    if (data.region) q = q.ilike("location", match(data.region));
    if (data.skill) q = q.contains("skills", [data.skill]);
    if (data.industry) q = q.ilike("industry", match(data.industry));
    if (data.employment) q = q.ilike("employment_type", match(data.employment));
    if (data.source) { const { data: sources } = await db.from("job_sources").select("id").ilike("name", match(data.source)); q = q.in("source_id", (sources ?? []).map((s) => s.id)); }
    if (data.salary) q = q.gte("salary_max", data.salary);
    if (data.currency) q = q.eq("salary_currency", data.currency.toUpperCase());
    if (data.experience) q = q.lte("experience_min", data.experience).gte("experience_max", data.experience);
    if (data.checked) q = q.gt("last_application_checked_at", new Date(Date.now() - data.checked * 60_000).toISOString());
    const { data: rows, count, error } = await q;
    if (error) { console.error("[jobs:list]", error.message); return { jobs: [], total: 0, pageSize: PAGE, error: "unavailable" as string | null }; }
    return { jobs: rows ?? [], total: count ?? 0, pageSize: PAGE, error: null as string | null };
  });

export const getJob = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data }) => {
    const { data: row } = await publicClient().from("jobs").select(PUBLIC_COLS).eq("slug", data.slug).maybeSingle();
    return row ?? null;
  });

export const listSources = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await publicClient().from("job_sources").select("name,provider,status,poll_minutes,terms_note,last_synced_at").order("status").order("name");
  return data ?? [];
});

export const reportJob = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({
    jobId: z.string().uuid(),
    reason: z.enum(["expired", "suspicious", "inaccurate", "broken_link"]),
    details: z.string().max(1000).optional(),
  }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("reported_jobs").insert({ job_id: data.jobId, reason: data.reason, details: data.details ?? null });
    if (error) throw new Error("Could not submit report");
    return { ok: true };
  });

// ---------- Admin ----------
async function assertAdmin(context: { supabase: any; userId: string; claims: Record<string, unknown> }) {
  const { data, error } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId).eq("role", "admin").maybeSingle();
  if (error) throw new Error("Role check failed");
  if (!hasJobsAdminAccess(data?.role, context.claims.aal)) throw new Error("Administrator two-step verification required");
}

export const adminJobsOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const now = Date.now();
    const iso = (ms: number) => new Date(now - ms).toISOString();
    const c = async (f: (q: any) => any) => (await f(db.from("jobs").select("id", { count: "exact", head: true }))).count ?? 0;
    const startOfDay = new Date(); startOfDay.setUTCHours(0, 0, 0, 0);
    const [live, lastHour, expiringSoon, expiredToday, quarantined, duplicates, closed, reports] = await Promise.all([
      c((q) => q.eq("verification_status", "VERIFIED").eq("application_status", "OPEN").eq("is_primary", true).eq("admin_hold", false).eq("source_access_status", "AUTHORIZED").eq("verification_basis", "authorized_feed_and_live_link").gt("last_application_checked_at", iso(1800_000)).gt("expires_at", new Date(now).toISOString()).lte("original_posted_at", new Date(now).toISOString()).gt("original_posted_at", iso(86_400_000))),
      c((q) => q.gt("first_seen_at", iso(3_600_000))),
      c((q) => q.eq("application_status", "OPEN").gt("original_posted_at", iso(86_400_000)).lt("original_posted_at", iso(82_800_000))),
      c((q) => q.lt("expires_at", new Date(now).toISOString()).gt("expires_at", startOfDay.toISOString())),
      c((q) => q.in("verification_status", ["QUARANTINED", "REJECTED"])),
      c((q) => q.eq("is_primary", false)),
      c((q) => q.eq("application_status", "CLOSED")),
      (await db.from("reported_jobs").select("id", { count: "exact", head: true }).eq("status", "open")).count ?? 0,
    ]);
    const { data: sources } = await db.from("job_sources").select("id,slug,name,provider,status,poll_minutes,last_synced_at,last_error,active").order("name");
    const { data: runs } = await db.from("source_sync_runs").select("id,started_at,finished_at,status,fetched,accepted,rejected,closed,error,job_sources(name)").order("started_at", { ascending: false }).limit(40);
    const { data: recent } = await db.from("jobs").select("id,slug,title,company,career_level,country,source_id,categories,verification_status,application_status,is_primary,original_posted_at,verification_notes").order("original_posted_at", { ascending: false }).limit(100);
    const { data: reported } = await db.from("reported_jobs").select("id,reason,details,created_at,status,jobs(title,company)").eq("status", "open").order("created_at", { ascending: false }).limit(50);
    return { stats: { live, lastHour, expiringSoon, expiredToday, quarantined, duplicates, closed, reports }, sources: sources ?? [], runs: runs ?? [], recent: recent ?? [], reported: reported ?? [] };
  });

export const adminJobAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ jobId: z.string().uuid(), action: z.enum(["quarantine", "reject", "republish"]), note: z.string().max(500).optional() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const status = data.action === "republish" ? "PENDING" : data.action === "reject" ? "REJECTED" : "QUARANTINED";
    // Republishing only flips verification; the 24-hour rule is still enforced by the database policy.
    const { error } = await db.from("jobs").update({ verification_status: status, admin_hold: data.action !== "republish", last_application_checked_at: data.action === "republish" ? null : undefined, verification_notes: `Admin ${data.action}${data.note ? `: ${data.note}` : ""}`, updated_at: new Date().toISOString() }).eq("id", data.jobId);
    if (error) throw new Error(error.message);
    await db.from("job_admin_audit").insert({ actor_id: context.userId, job_id: data.jobId, action: data.action, note: data.note ?? null });
    if (data.action === "republish") {
      const { data: job } = await db.from("jobs").select("job_sources(slug)").eq("id", data.jobId).maybeSingle();
      if (job?.job_sources?.slug) { const { runJobSync } = await import("./sync.server"); await runJobSync({ sourceSlug: job.job_sources.slug, force: true }); }
    }
    return { ok: true };
  });

export const adminSourceUpdate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), active: z.boolean().optional(), poll_minutes: z.number().int().min(15).max(1440).optional() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const { id, ...patch } = data;
    const { error } = await db.from("job_sources").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) throw new Error(error.message);
    await db.from("job_admin_audit").insert({ actor_id: context.userId, action: "source_update", note: JSON.stringify(data) });
    return { ok: true };
  });

export const adminRunSync = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { runJobSync } = await import("./sync.server");
    const results = await runJobSync({ force: true });
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    await db.from("job_admin_audit").insert({ actor_id: context.userId, action: "manual_sync" });
    return results;
  });

export const adminResolveReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    await db.from("reported_jobs").update({ status: "resolved" }).eq("id", data.id);
    await db.from("job_admin_audit").insert({ actor_id: context.userId, action: "resolve_report", note: data.id });
    return { ok: true };
  });

export const adminClassifyJobs = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  await assertAdmin(context);
  const { getRequest } = await import("@tanstack/react-start/server");
  const { classifyPendingJobs } = await import("./classify.server");
  return classifyPendingJobs(getRequest());
});

export const adminResumeClassification = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  await assertAdmin(context);
  const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
  const { error } = await db.from("jobs_ai_state").upsert({ id: "classification", paused: false, reason: null, updated_at: new Date().toISOString() });
  if (error) throw new Error("Could not resume AI classification");
  await db.from("job_admin_audit").insert({ actor_id: context.userId, action: "resume_ai_classification" });
  return { ok: true };
});

export const adminClassificationResults = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  await assertAdmin(context);
  const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
  const [results, vitals, verification, summaries] = await Promise.all([
    db.from("job_classifications").select("job_id,status,result,error,updated_at,jobs(title)").order("updated_at", { ascending: false }).limit(30),
    db.from("web_vital_samples").select("metric,value,rating,path,device,created_at").gte("created_at", new Date(Date.now() - 7 * 86400_000).toISOString()).order("created_at", { ascending: false }).limit(500),
    db.from("job_verifications").select("id,status,http_status,evidence,checked_at,jobs(title)").order("checked_at", { ascending: false }).limit(30),
    db.from("job_operational_summaries").select("*").order("day", { ascending: false }).limit(14),
  ]);
  return { classifications: results.data ?? [], vitals: vitals.data ?? [], verification: verification.data ?? [], summaries: summaries.data ?? [] };
});
