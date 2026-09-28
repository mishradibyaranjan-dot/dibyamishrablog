import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error("Role check failed");
  if (!data) throw new Error("Forbidden");
}

const scheduleInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(120),
  cadence: z.enum(["daily", "weekly", "monthly"]),
  hour_utc: z.number().int().min(0).max(23),
  day_of_week: z.number().int().min(0).max(6).nullable().optional(),
  day_of_month: z.number().int().min(1).max(28).nullable().optional(),
  topic_hint: z.string().max(500).nullable().optional(),
  active: z.boolean().default(true),
});

export const listNewsletterSchedules = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("newsletter_schedules")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertNewsletterSchedule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => scheduleInput.parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { computeNextRun } = await import("./newsletter-core.server");
    const next = computeNextRun(
      data.cadence,
      data.hour_utc,
      data.day_of_week ?? null,
      data.day_of_month ?? null,
    ).toISOString();
    const payload = {
      name: data.name,
      cadence: data.cadence,
      hour_utc: data.hour_utc,
      day_of_week: data.cadence === "weekly" ? (data.day_of_week ?? 1) : null,
      day_of_month: data.cadence === "monthly" ? (data.day_of_month ?? 1) : null,
      topic_hint: data.topic_hint ?? null,
      active: data.active,
      next_run_at: next,
    };
    if (data.id) {
      const r = await context.supabase
        .from("newsletter_schedules")
        .update(payload)
        .eq("id", data.id)
        .select("*")
        .single();
      if (r.error) throw new Error(r.error.message);
      return r.data;
    }
    const r = await context.supabase
      .from("newsletter_schedules")
      .insert({ ...payload, created_by: context.userId })
      .select("*")
      .single();
    if (r.error) throw new Error(r.error.message);
    return r.data;
  });

export const deleteNewsletterSchedule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("newsletter_schedules")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const runScheduleNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { data: sched, error } = await context.supabase
      .from("newsletter_schedules")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error || !sched) throw new Error("Schedule not found");
    const { autoSendNewsletter, computeNextRun } = await import("./newsletter-core.server");
    const result = await autoSendNewsletter({
      topicHint: sched.topic_hint ?? undefined,
      createdBy: context.userId,
      scheduleId: sched.id,
      triggerSource: "manual_run",
    });
    const next = computeNextRun(
      sched.cadence as "daily" | "weekly" | "monthly",
      sched.hour_utc,
      sched.day_of_week,
      sched.day_of_month,
    ).toISOString();
    await context.supabase
      .from("newsletter_schedules")
      .update({ last_run_at: new Date().toISOString(), next_run_at: next })
      .eq("id", data.id);
    return result;
  });

export const listScheduleHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ scheduleId: z.string().uuid(), limit: z.number().int().min(1).max(50).default(10) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { data: runs, error } = await context.supabase
      .from("newsletter_send_runs")
      .select("id, issue_id, trigger_source, title, recipients_total, queued_count, failed_count, status, error_message, linkedin_status, linkedin_error, started_at, finished_at")
      .eq("schedule_id", data.scheduleId)
      .order("started_at", { ascending: false })
      .limit(data.limit);
    if (error) throw new Error(error.message);
    const ids = (runs ?? []).map((r) => r.id);
    let failures: Array<{ run_id: string; email: string; error_message: string | null }> = [];
    if (ids.length > 0) {
      const { data: recs, error: e2 } = await context.supabase
        .from("newsletter_send_recipients")
        .select("run_id, email, error_message")
        .in("run_id", ids)
        .eq("status", "failed")
        .limit(500);
      if (e2) throw new Error(e2.message);
      failures = recs ?? [];
    }
    return (runs ?? []).map((r) => ({
      ...r,
      failed_recipients: failures.filter((f) => f.run_id === r.id),
    }));
  });

export const retryFailedRunRecipients = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ runId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: run, error: runErr } = await supabaseAdmin
      .from("newsletter_send_runs")
      .select("id, issue_id, title")
      .eq("id", data.runId)
      .single();
    if (runErr || !run) throw new Error("Run not found");
    if (!run.issue_id) throw new Error("Run has no associated issue to retry");

    const { data: issue, error: issueErr } = await supabaseAdmin
      .from("newsletter_issues")
      .select("id, slug, title, summary, body_markdown")
      .eq("id", run.issue_id)
      .single();
    if (issueErr || !issue) throw new Error("Issue not found");

    const { data: failed, error: failErr } = await supabaseAdmin
      .from("newsletter_send_recipients")
      .select("id, email")
      .eq("run_id", data.runId)
      .eq("status", "failed");
    if (failErr) throw new Error(failErr.message);
    const list = failed ?? [];
    if (list.length === 0) return { retried: 0, queued: 0, errors: 0 };

    const { enqueueRenderedTemplate } = await import("./newsletter-core.server");
    let queued = 0;
    let errors = 0;
    const updates: Array<{ id: string; status: "queued" | "failed"; error_message: string | null }> = [];

    for (const rec of list) {
      try {
        const r = await enqueueRenderedTemplate({
          templateName: "newsletter-issue",
          recipientEmail: rec.email,
          templateData: {
            title: issue.title,
            summary: issue.summary,
            bodyMarkdown: issue.body_markdown,
            slug: issue.slug,
          },
          // Fresh idempotency key so the queue processor treats retry as a new send.
          idempotencyKey: `newsletter-${issue.id}-${rec.email}-retry-${Date.now()}`,
        });
        if (r.queued) {
          queued++;
          updates.push({ id: rec.id, status: "queued", error_message: null });
        } else {
          errors++;
          updates.push({ id: rec.id, status: "failed", error_message: r.reason ?? "not queued" });
        }
      } catch (e) {
        errors++;
        updates.push({
          id: rec.id,
          status: "failed",
          error_message: e instanceof Error ? e.message : String(e),
        });
      }
    }

    // Update recipient rows individually so the history reflects the retry outcome.
    for (const u of updates) {
      await supabaseAdmin
        .from("newsletter_send_recipients")
        .update({ status: u.status, error_message: u.error_message })
        .eq("id", u.id);
    }

    // Recompute run counters from the recipient table (authoritative).
    const { data: agg } = await supabaseAdmin
      .from("newsletter_send_recipients")
      .select("status")
      .eq("run_id", data.runId);
    const newQueued = (agg ?? []).filter((a) => a.status === "queued").length;
    const newFailed = (agg ?? []).filter((a) => a.status === "failed").length;
    await supabaseAdmin
      .from("newsletter_send_runs")
      .update({ queued_count: newQueued, failed_count: newFailed })
      .eq("id", data.runId);

    return { retried: list.length, queued, errors };
  });
