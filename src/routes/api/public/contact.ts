import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { corsHeadersFor, isAllowedOrigin } from "@/lib/origin.server";
import { isBlockedEmail, BLOCKED_EMAIL_MESSAGE } from "@/lib/blocked-domains";

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
const OWNER_EMAILS = ["mishra.dibyaranjan@gmail.com", "contactme@dibyamishra.co.in"];

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

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
        if (isBlockedEmail(data.email)) {
          return Response.json({ error: BLOCKED_EMAIL_MESSAGE }, { status: 400, headers: cors });
        }
        try {
          const { supabaseAdmin: sbAdmin } = await import("@/integrations/supabase/client.server");
          const { data: disposable } = await sbAdmin.rpc("is_disposable_email", { _email: data.email });
          if (disposable) {
            return Response.json(
              { error: "Please use a permanent email address — disposable providers are not accepted." },
              { status: 400, headers: cors },
            );
          }
        } catch { /* fall open */ }

        try {
          const [React, { render }, { createClient }, { template }, { sendLovableEmail }] =
            await Promise.all([
              import("react"),
              import("@react-email/render"),
              import("@supabase/supabase-js"),
              import("@/lib/email-templates/contact-notification"),
              import("@lovable.dev/email-js"),
            ]);

          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
          const apiKey = process.env.LOVABLE_API_KEY;
          if (!supabaseUrl || !supabaseServiceKey || !apiKey) {
            console.error("contact: missing env", {
              hasUrl: Boolean(supabaseUrl),
              hasKey: Boolean(supabaseServiceKey),
              hasApiKey: Boolean(apiKey),
            });
            return Response.json({ error: "Server not configured" }, { status: 500, headers: cors });
          }

          const templateData = { name: data.name, email: data.email, subject: data.subject, message: data.message };
          const element = React.createElement(template.component, templateData);
          const html = await render(element);
          const text = await render(element, { plainText: true });
          const subject =
            typeof template.subject === "function" ? template.subject(templateData) : template.subject;

          const supabase = createClient(supabaseUrl, supabaseServiceKey);
          const messageId = crypto.randomUUID();

          async function tokenFor(email: string): Promise<string | null> {
            const normalized = email.toLowerCase();
            const { data: existing, error: lookupError } = await supabase
              .from("email_unsubscribe_tokens")
              .select("token")
              .eq("email", normalized)
              .maybeSingle();
            if (lookupError) console.error("contact: token lookup error", lookupError);
            if (existing?.token) return existing.token;
            const newToken = generateToken();
            const { error: insErr } = await supabase
              .from("email_unsubscribe_tokens")
              .upsert({ token: newToken, email: normalized }, { onConflict: "email", ignoreDuplicates: true });
            if (insErr) console.error("contact: token upsert error", insErr);
            const { data: stored } = await supabase
              .from("email_unsubscribe_tokens")
              .select("token")
              .eq("email", normalized)
              .maybeSingle();
            return stored?.token ?? newToken;
          }

          let anySent = false;
          for (const recipient of OWNER_EMAILS) {
            const unsubscribeToken = await tokenFor(recipient);
            if (!unsubscribeToken) {
              console.error("contact: could not obtain unsubscribe token for", recipient);
              continue;
            }

            await supabase.from("email_send_log").insert({
              message_id: messageId,
              template_name: "contact-notification",
              recipient_email: recipient,
              status: "pending",
            });

            // Send synchronously via SDK — bypass queue to avoid staleness/misroutes
            try {
              await sendLovableEmail(
                {
                  to: recipient,
                  from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
                  sender_domain: SENDER_DOMAIN,
                  subject,
                  html,
                  text,
                  purpose: "transactional",
                  label: "contact-notification",
                  idempotency_key: `contact-notification-${messageId}-${recipient}`,
                  unsubscribe_token: unsubscribeToken,
                  message_id: messageId,
                },
                { apiKey, sendUrl: process.env.LOVABLE_SEND_URL },
              );
              anySent = true;
              await supabase.from("email_send_log").insert({
                message_id: messageId,
                template_name: "contact-notification",
                recipient_email: recipient,
                status: "sent",
              });
            } catch (sendErr) {
              const msg = sendErr instanceof Error ? sendErr.message : String(sendErr);
              console.error("contact: sendLovableEmail failed", recipient, msg);
              await supabase.from("email_send_log").insert({
                message_id: messageId,
                template_name: "contact-notification",
                recipient_email: recipient,
                status: "failed",
                error_message: msg.slice(0, 1000),
              });
            }
          }

          if (!anySent) {
            return Response.json({ error: "Send failed" }, { status: 500, headers: cors });
          }

          return Response.json({ ok: true, messageId }, { headers: cors });

        } catch (err) {
          console.error("contact send failed", err);
          return Response.json({ error: "Send failed" }, { status: 500, headers: cors });
        }
      },
    },
  },
});
