import { createFileRoute } from "@tanstack/react-router";

/**
 * Called every 10 minutes by pg_cron. Retries contact-form emails whose delivery
 * failed, using exponential backoff, until the retry ceiling is reached.
 * Authenticated with the server-only CRON_SECRET bearer token only.
 */
export const Route = createFileRoute("/api/public/cron/contact-email-retry")({
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
          const { runContactRetrySweep } = await import("@/lib/contact-email.server");
          const result = await runContactRetrySweep(10);
          return Response.json({ ok: true, ...result });
        } catch (err) {
          console.error("[cron:contact-email-retry]", err);
          return Response.json({ ok: false, error: "retry_failed" }, { status: 500 });
        }
      },
    },
  },
});
