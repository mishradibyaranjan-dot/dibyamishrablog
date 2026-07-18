import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getRequest } from "@tanstack/react-start/server";

// ---------- Public: record client-observed failed sign-in ----------
const failedLoginSchema = z.object({
  email: z.string().trim().email().max(255),
  reason: z.string().max(500).optional(),
});

export const recordClientFailedLogin = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => failedLoginSchema.parse(input))
  .handler(async ({ data }) => {
    const req = getRequest();
    const { getClientIp, evaluateFailedLogin } = await import("@/lib/security-events.server");
    const ip = getClientIp(req);
    const userAgent = req.headers.get("user-agent");
    await evaluateFailedLogin({
      ip,
      email: data.email.toLowerCase(),
      userAgent,
      reason: data.reason ?? "invalid_credentials",
    });
    return { ok: true };
  });

// ---------- Public: check if an email is disposable ----------
const disposableSchema = z.object({ email: z.string().trim().email().max(255) });

export const checkDisposableEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => disposableSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: result } = await supabaseAdmin.rpc("is_disposable_email", { _email: data.email });
    return { disposable: Boolean(result) };
  });

// ---------- Admin: list security events ----------
const listSchema = z.object({
  page: z.number().int().min(0).default(0),
  pageSize: z.number().int().min(1).max(100).default(50),
  severity: z.enum(["low", "medium", "critical", "all"]).default("all"),
  eventType: z.string().max(80).optional(),
});

export const listSecurityEvents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => listSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("security_events")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(data.page * data.pageSize, data.page * data.pageSize + data.pageSize - 1);
    if (data.severity !== "all") q = q.eq("severity", data.severity);
    if (data.eventType) q = q.eq("event_type", data.eventType);
    const { data: rows, count, error } = await q;
    if (error) throw error;

    // Aggregate summary counts for the dashboard header
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: summaryRows } = await supabaseAdmin
      .from("security_events")
      .select("severity")
      .gte("created_at", since);
    const summary = { low: 0, medium: 0, critical: 0 };
    for (const r of summaryRows ?? []) {
      const s = (r as { severity: keyof typeof summary }).severity;
      if (s in summary) summary[s] += 1;
    }
    return { rows: rows ?? [], count: count ?? 0, summary };
  });

// ---------- Admin: list IP blocks ----------
export const listIpBlocks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("ip_blocks")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return { rows: data ?? [] };
  });

// ---------- Admin: unblock IP ----------
const unblockSchema = z.object({ ip: z.string().min(1).max(64) });

export const unblockIp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => unblockSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("ip_blocks").delete().eq("ip_address", data.ip);
    if (error) throw error;
    const { invalidateBlocklistCache, recordSecurityEvent } = await import(
      "@/lib/security-events.server"
    );
    invalidateBlocklistCache();
    await recordSecurityEvent({
      severity: "low",
      eventType: "ip_unblocked",
      ip: data.ip,
      actionTaken: "admin_unblock",
      userId: context.userId,
    });
    return { ok: true };
  });
