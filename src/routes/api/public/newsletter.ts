import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { corsHeadersFor, isAllowedOrigin } from "@/lib/origin.server";

const NewsletterSchema = z.object({
  email: z.string().trim().email().max(255).regex(/^[^\r\n]*$/),
});

export const Route = createFileRoute("/api/public/newsletter")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) =>
        new Response(null, { status: 204, headers: corsHeadersFor(request) }),
      POST: async ({ request }) => {
        const cors = corsHeadersFor(request);
        if (!isAllowedOrigin(request)) {
          return Response.json({ error: "Forbidden" }, { status: 403, headers: cors });
        }
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400, headers: cors });
        }
        const parsed = NewsletterSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json({ error: "Invalid email" }, { status: 400, headers: cors });
        }
        const email = parsed.data.email;

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { error } = await supabaseAdmin
            .from("newsletter_subscribers")
            .upsert(
              { email, status: "active", source: "site", unsubscribed_at: null },
              { onConflict: "email" },
            );
          if (error) throw error;
          return Response.json({ ok: true }, { headers: cors });
        } catch (err) {
          console.error("newsletter subscribe failed", err);
          return Response.json(
            { error: "Subscribe failed" },
            { status: 500, headers: cors },
          );
        }
      },
    },
  },
});
