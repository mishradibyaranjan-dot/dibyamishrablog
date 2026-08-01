import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(supabase: { from: (t: string) => any }, userId: string) {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden");
}

// ---------- Admin: filtered, paginated audit list ----------
const listSchema = z.object({
  page: z.number().int().min(0).default(0),
  pageSize: z.number().int().min(10).max(200).default(25),
  outcome: z.enum(["all", "accepted", "rejected", "error"]).default("all"),
  from: z.string().max(40).optional(),
  to: z.string().max(40).optional(),
  path: z.string().max(300).optional(),
  visitorId: z.string().max(150).optional(),
  userId: z.string().max(80).optional(),
  country: z.string().max(10).optional(),
  ipHash: z.string().max(80).optional(),
  reason: z.string().max(120).optional(),
  identified: z.enum(["all", "yes", "no"]).default("all"),
  search: z.string().max(200).optional(),
});

export const listVisitorAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => listSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let q = supabaseAdmin
      .from("visitor_tracking_audit")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(data.page * data.pageSize, data.page * data.pageSize + data.pageSize - 1);

    if (data.outcome !== "all") q = q.eq("outcome", data.outcome);
    if (data.from) q = q.gte("created_at", new Date(data.from).toISOString());
    if (data.to) q = q.lte("created_at", new Date(data.to).toISOString());
    if (data.path) q = q.ilike("path", `%${data.path}%`);
    if (data.visitorId) q = q.ilike("visitor_id", `%${data.visitorId}%`);
    if (data.userId) q = q.eq("user_id", data.userId);
    if (data.country) q = q.eq("country", data.country.toUpperCase());
    if (data.ipHash) q = q.ilike("ip_hash", `${data.ipHash}%`);
    if (data.reason) q = q.eq("reason", data.reason);
    if (data.identified !== "all") q = q.eq("identified", data.identified === "yes");
    if (data.search) {
      const t = data.search.replace(/[%,]/g, "");
      q = q.or(
        `path.ilike.%${t}%,reason.ilike.%${t}%,visitor_id.ilike.%${t}%,ip_hash.ilike.%${t}%,error_message.ilike.%${t}%`,
      );
    }

    const { data: rows, count, error } = await q;
    if (error) throw error;
    return { rows: rows ?? [], count: count ?? 0 };
  });

// ---------- Admin: aggregated analytics ----------
const analyticsSchema = z.object({ days: z.number().int().min(1).max(90).default(14) });

export const getVisitorAuditAnalytics = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => analyticsSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { buildAnalytics, loadSettings } = await import("@/lib/visitor-audit.server");
    const [analytics, settings] = await Promise.all([buildAnalytics(data.days), loadSettings()]);
    return { analytics, settings };
  });

// ---------- Admin: retention settings ----------
const settingsSchema = z.object({
  retention_days: z.number().int().min(1).max(365),
  alerts_enabled: z.boolean(),
  alert_window_minutes: z.number().int().min(5).max(1440),
  alert_min_events: z.number().int().min(1).max(10000),
  alert_failure_pct: z.number().int().min(1).max(100),
});

export const updateVisitorAuditSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => settingsSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("visitor_audit_settings")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", 1);
    if (error) throw error;
    return { ok: true };
  });

// ---------- Admin: manual cleanup ----------
const purgeSchema = z.object({ olderThanDays: z.number().int().min(0).max(365).optional() });

export const purgeVisitorAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => purgeSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (typeof data.olderThanDays === "number") {
      const cutoff = new Date(Date.now() - data.olderThanDays * 86_400_000).toISOString();
      const { data: deleted, error } = await supabaseAdmin
        .from("visitor_tracking_audit")
        .delete()
        .lt("created_at", cutoff)
        .select("id");
      if (error) throw error;
      return { deleted: deleted?.length ?? 0, cutoff };
    }

    const { data: count, error } = await supabaseAdmin.rpc("purge_visitor_tracking_audit");
    if (error) throw error;
    return { deleted: Number(count ?? 0), cutoff: null };
  });

// ---------- Admin: run the spike check on demand ----------
export const runVisitorAuditSpikeCheck = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { evaluateAuditSpike } = await import("@/lib/visitor-audit.server");
    const res = await evaluateAuditSpike();
    return {
      checked: res.checked,
      alerted: res.alerted,
      reason: res.reason ?? null,
      stats: res.stats ? JSON.stringify(res.stats) : null,
    };
  });
