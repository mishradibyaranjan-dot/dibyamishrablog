import { createFileRoute } from "@tanstack/react-router";

/**
 * Called every 15 minutes by pg_cron. Checks the visitor tracking audit log for
 * spikes in rejected/error outcomes or single-IP floods, emails the owner, and
 * runs the retention purge. Authenticated with the server-only CRON_SECRET
 * bearer token (or `x-cron-secret` header) only.
 */
export const Route = createFileRoute("/api/public/cron/visitor-audit-alerts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const cronSecret = process.env.CRON_SECRET ?? "";
        if (!cronSecret) return new Response("Server misconfigured", { status: 500 });
        const auth = request.headers.get("authorization") ?? "";
        const bearer = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
        const provided = bearer || request.headers.get("x-cron-secret") || "";
        const a = new TextEncoder().encode(provided);
        const b = new TextEncoder().encode(cronSecret);
        let ok = a.length === b.length;
        for (let i = 0; i < b.length; i++) ok = ok && a[i % a.length] === b[i];
        if (!ok || provided.length === 0) return new Response("Unauthorized", { status: 401 });


        try {
          const { evaluateAuditSpike } = await import("@/lib/visitor-audit.server");
          const spike = await evaluateAuditSpike();

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data: purged } = await supabaseAdmin.rpc("purge_visitor_tracking_audit");

          return Response.json({ ok: true, spike, purged: Number(purged ?? 0) });
        } catch (err) {
          console.error("[cron:visitor-audit-alerts]", err);
          return Response.json({ ok: false, error: "check_failed" }, { status: 500 });
        }
      },
    },
  },
});
