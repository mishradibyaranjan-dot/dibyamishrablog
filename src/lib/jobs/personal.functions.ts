import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { jobFilters } from "./jobs.functions";

export const personalJobs = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const [saves, searches] = await Promise.all([
    context.supabase.from("saved_jobs").select("job_id,jobs(*)").eq("user_id", context.userId),
    context.supabase.from("job_alerts").select("*").eq("user_id", context.userId).order("created_at", { ascending: false }),
  ]);
  if (saves.error || searches.error) throw new Error("Could not load your saved jobs and searches");
  return { saves: saves.data ?? [], searches: searches.data ?? [] };
});

export const saveJobToAccount = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ jobId: z.string().uuid(), saved: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    const query = data.saved
      ? context.supabase.from("saved_jobs").upsert({ job_id: data.jobId, user_id: context.userId }, { onConflict: "user_id,job_id" })
      : context.supabase.from("saved_jobs").delete().eq("job_id", data.jobId).eq("user_id", context.userId);
    const { error } = await query;
    if (error) throw new Error("Could not update saved job");
    return { ok: true };
  });

export const saveJobSearch = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ name: z.string().trim().min(1).max(80), filters: jobFilters, enabled: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("job_alerts").upsert({ user_id: context.userId, name: data.name, filters: data.filters, enabled: data.enabled }, { onConflict: "user_id,name" });
    if (error) throw new Error("Could not save search");
    return { ok: true };
  });

export const removeJobSearch = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("job_alerts").delete().eq("id", data.id).eq("user_id", context.userId);
    if (error) throw new Error("Could not delete search");
    return { ok: true };
  });