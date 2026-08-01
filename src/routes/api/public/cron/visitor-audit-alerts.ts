import { createFileRoute } from "@tanstack/react-router";

/**
 * Called every 15 minutes by pg_cron. Checks the visitor tracking audit log for
 * spikes in rejected/error outcomes or single-IP floods, emails the owner, and
 * runs the retention purge. Authenticated with the Supabase publishable/anon
 * key in the `apikey` header (or CRON_SECRET as a bearer token).
 */
export const Route = createFileRoute("/api/public/cron/visitor-audit-alerts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY ?? "";
        const cronSecret = process.env.CRON_SECRET ?? "";
        const apikey = request.headers.get("apikey") ?? "";
        const auth = request.headers.get("authorization") ?? "";
        const bearer = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
        const authorized =
          (anonKey.length > 0 && apikey === anonKey) || (cronSecret.length > 0 && bearer === cronSecret);
        if (!authorized) return new Response("Unauthorized", { status: 401 });

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
