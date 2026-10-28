import { createFileRoute } from "@tanstack/react-router";
import { refreshRequest } from '@/lib/jobs/refresh-request';

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
        let input: { mode: 'dispatch' | 'source' | 'maintenance'; sourceSlug?: string; force: boolean };
        try {
          const raw = await request.text();
          input = refreshRequest.parse(raw ? JSON.parse(raw) : {});
          if (input.mode === 'source' && !input.sourceSlug) return new Response('Missing source', { status: 400 });
        } catch { return new Response('Invalid refresh request', { status: 400 }); }
        try {
          if (input.mode === 'dispatch') {
            const { dispatchJobRefresh } = await import('@/lib/jobs/dispatch.server');
            const url = new URL(request.url); url.search = ''; url.hash = '';
            return Response.json({ ok: true, results: await dispatchJobRefresh(url.toString(), input.force) });
          }
          if (input.mode === 'source') {
            const { runJobSync } = await import('@/lib/jobs/sync.server');
            const results = await runJobSync({ sourceSlug: input.sourceSlug, force: input.force });
            return Response.json({ ok: !results.some(r => r.status === 'failed'), results });
          }
          const { purgeExpiredCareerReviews } = await import("@/lib/career/retention.server");
          await purgeExpiredCareerReviews();
          const { classifyPendingJobs } = await import("@/lib/jobs/classify.server");
          const classification = await classifyPendingJobs(request);
          return Response.json({ ok: true, classification });
        } catch (err) {
          console.error("[cron:jobs-sync]", err);
          return Response.json({ ok: false, error: "sync_failed" }, { status: 500 });
        }
      },
    },
  },
});
