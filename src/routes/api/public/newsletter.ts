import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { corsHeadersFor, isAllowedOrigin } from "@/lib/origin.server";
import { isBlockedEmail, BLOCKED_EMAIL_MESSAGE } from "@/lib/blocked-domains";

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
          // Detect whether this email was already an active subscriber so we
          // only send a welcome email on the first (or re-)subscribe.
          const { data: existing } = await supabaseAdmin
            .from("newsletter_subscribers")
            .select("status")
            .eq("email", email)
            .maybeSingle();
          const wasActive = existing?.status === "active";

          const { error } = await supabaseAdmin
            .from("newsletter_subscribers")
            .upsert(
              { email, status: "active", source: "site", unsubscribed_at: null },
              { onConflict: "email" },
            );
          if (error) throw error;

          if (!wasActive) {
            try {
              await supabaseAdmin.rpc("enqueue_email", {
                queue_name: "transactional_emails",
                payload: {
                  template_name: "newsletter-welcome",
                  recipient_email: email,
                  template_data: {},
                  idempotency_key: `newsletter-welcome-${email}`,
                },
              });
            } catch (e) {
              // Never fail the subscribe just because the welcome mail queue balked.
              console.error("welcome email enqueue failed", email, e);
            }
          }

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
