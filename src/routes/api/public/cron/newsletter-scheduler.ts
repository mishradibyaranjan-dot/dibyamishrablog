import { createFileRoute } from "@tanstack/react-router";

/**
 * Called hourly by pg_cron. Finds active newsletter_schedules whose
 * next_run_at has passed, generates + auto-sends each one, and updates
 * last_run_at / next_run_at. Auth via CRON_SECRET.
 */
export const Route = createFileRoute("/api/public/cron/newsletter-scheduler")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const cronSecret = process.env.CRON_SECRET;
        if (!cronSecret) return new Response("Server misconfigured", { status: 500 });
        const authHeader = request.headers.get("authorization") ?? "";
        const bearer = authHeader.toLowerCase().startsWith("bearer ")
          ? authHeader.slice(7).trim()
          : "";
        const provided = bearer || request.headers.get("x-cron-secret") || "";
        const a = new TextEncoder().encode(provided);
        const b = new TextEncoder().encode(cronSecret);
        let ok = a.length === b.length;
        for (let i = 0; i < b.length; i++) ok = ok && a[i % a.length] === b[i];
        if (!ok || provided.length === 0) return new Response("Unauthorized", { status: 401 });

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { autoSendNewsletter, computeNextRun } = await import(
            "@/lib/newsletter-core.server"
          );

          const nowIso = new Date().toISOString();
          const { data: due, error } = await supabaseAdmin
            .from("newsletter_schedules")
            .select("*")
            .eq("active", true)
            .lte("next_run_at", nowIso);
          if (error) throw error;

          const results: Array<{ id: string; ok: boolean; error?: string; recipients?: number }> = [];
          for (const s of due ?? []) {
            try {
              const r = await autoSendNewsletter({
                topicHint: s.topic_hint ?? undefined,
                createdBy: s.created_by ?? null,
              });
              const next = computeNextRun(
                s.cadence as "daily" | "weekly" | "monthly",
                s.hour_utc,
                s.day_of_week,
                s.day_of_month,
              ).toISOString();
              await supabaseAdmin
                .from("newsletter_schedules")
                .update({ last_run_at: new Date().toISOString(), next_run_at: next })
                .eq("id", s.id);
              results.push({ id: s.id, ok: true, recipients: r.recipients });
            } catch (e) {
              console.error("schedule run failed", s.id, e);
              results.push({ id: s.id, ok: false, error: e instanceof Error ? e.message : String(e) });
            }
          }

          return Response.json({ ok: true, processed: results.length, results });
        } catch (err) {
          console.error("newsletter-scheduler cron failed", err);
          return Response.json({ error: "Cron failed" }, { status: 500 });
        }
      },
    },
  },
});
