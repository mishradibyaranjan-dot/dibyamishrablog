import { createFileRoute } from "@tanstack/react-router";

/**
 * Called at 07:00, 12:00, 16:00 and 21:00 Asia/Kolkata by pg_cron. Pulls fresh postings from connected
 * public employer feeds, verifies and classifies them, and closes jobs that
 * left the feed. Authenticated with the server-only CRON_SECRET.
 * Public freshness is also enforced by database policy, so a delayed run
 * never keeps an expired job visible.
 */
export const Route = createFileRoute("/api/public/cron/jobs-sync")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const cronSecret = process.env.CRON_SECRET ?? "";
        if (!cronSecret) return new Response("Server misconfigured", { status: 500 });
        const auth = request.headers.get("authorization") ?? "";
        const provided = (auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "") || request.headers.get("x-cron-secret") || "";
        const a = new TextEncoder().encode(provided);
        const b = new TextEncoder().encode(cronSecret);
        let ok = a.length === b.length && provided.length > 0;
        for (let i = 0; i < b.length; i++) ok = ok && a[i % a.length] === b[i];
        if (!ok) return new Response("Unauthorized", { status: 401 });
        try {
          const { runJobSync } = await import("@/lib/jobs/sync.server");
          const results = await runJobSync();
          const { classifyPendingJobs } = await import("@/lib/jobs/classify.server");
          const classification = await classifyPendingJobs(request);
          return Response.json({ ok: true, results, classification });
        } catch (err) {
          console.error("[cron:jobs-sync]", err);
          return Response.json({ ok: false, error: "sync_failed" }, { status: 500 });
        }
      },
    },
  },
});
