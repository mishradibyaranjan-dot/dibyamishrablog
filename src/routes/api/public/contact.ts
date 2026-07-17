import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { corsHeadersFor, isAllowedOrigin } from "@/lib/origin.server";

const noCRLF = /^[^\r\n]*$/;
const ContactSchema = z.object({
  name: z.string().trim().min(1).max(100).regex(noCRLF),
  email: z.string().trim().email().max(255).regex(noCRLF),
  subject: z.string().trim().min(1).max(200).regex(noCRLF),
  message: z.string().trim().min(1).max(5000),
});

const SITE_NAME = "dibyamishrablog";
const SENDER_DOMAIN = "notify.dibyamishra.co.in";
const FROM_DOMAIN = "notify.dibyamishra.co.in";
const OWNER_EMAIL = "mishra.dibyaranjan@gmail.com";

export const Route = createFileRoute("/api/public/contact")({
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
        const parsed = ContactSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json(
            { error: "Invalid input", issues: parsed.error.flatten() },
            { status: 400, headers: cors },
          );
        }
        const data = parsed.data;

        try {
          const [React, { render }, { createClient }, { template }] = await Promise.all([
            import("react"),
            import("@react-email/render"),
            import("@supabase/supabase-js"),
            import("@/lib/email-templates/contact-notification"),
          ]);

          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
          if (!supabaseUrl || !supabaseServiceKey) {
            console.error("Missing Supabase env for contact email");
            return Response.json({ error: "Server not configured" }, { status: 500, headers: cors });
          }

          const templateData = {
            name: data.name,
            email: data.email,
            subject: data.subject,
            message: data.message,
          };
          const element = React.createElement(template.component, templateData);
          const html = await render(element);
          const text = await render(element, { plainText: true });
          const subject =
            typeof template.subject === "function"
              ? template.subject(templateData)
              : template.subject;

          const supabase = createClient(supabaseUrl, supabaseServiceKey);
          const messageId = crypto.randomUUID();

          await supabase.from("email_send_log").insert({
            message_id: messageId,
            template_name: "contact-notification",
            recipient_email: OWNER_EMAIL,
            status: "pending",
          });

          const { error: enqueueError } = await supabase.rpc("enqueue_email", {
            queue_name: "transactional_emails",
            payload: {
              message_id: messageId,
              to: OWNER_EMAIL,
              from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
              sender_domain: SENDER_DOMAIN,
              reply_to: `${data.name} <${data.email}>`,
              subject,
              html,
              text,
              purpose: "transactional",
              label: "contact-notification",
              idempotency_key: `contact-notification-${messageId}`,
              queued_at: new Date().toISOString(),
            },
          });

          if (enqueueError) {
            console.error("Failed to enqueue contact email", enqueueError);
            await supabase.from("email_send_log").insert({
              message_id: messageId,
              template_name: "contact-notification",
              recipient_email: OWNER_EMAIL,
              status: "failed",
              error_message: "Failed to enqueue email",
            });
            return Response.json({ error: "Send failed" }, { status: 500, headers: cors });
          }

          return Response.json({ ok: true, messageId }, { headers: cors });
        } catch (err) {
          console.error("contact send failed", err);
          return Response.json(
            { error: "Send failed" },
            { status: 500, headers: cors },
          );
        }
      },
    },
  },
});
