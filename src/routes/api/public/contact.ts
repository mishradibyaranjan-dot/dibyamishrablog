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
  /** Honeypot — must stay empty; bots fill hidden inputs. */
  website: z.string().max(200).optional(),
});

const SITE_NAME = "dibyamishrablog";
const SENDER_DOMAIN = "notify.dibyamishra.co.in";
const FROM_DOMAIN = "notify.dibyamishra.co.in";
const OWNER_EMAILS = ["mishra.dibyaranjan@gmail.com", "contactme@dibyamishra.co.in"];

/** Ad-hoc throttle: max submissions per hashed IP inside the window. */
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MINUTES = 10;

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function clientIp(request: Request): string {
  const h = request.headers;
  const fwd = h.get("cf-connecting-ip") ?? h.get("x-real-ip") ?? h.get("x-forwarded-for") ?? "";
  return (fwd.split(",")[0] ?? "").trim();
}

async function hashIp(ip: string): Promise<string | null> {
  if (!ip) return null;
  const salt = process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 16) ?? "contact-salt";
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}:${ip}`));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
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

        // Honeypot: silently accept so bots do not learn they were filtered.
        if (data.website && data.website.trim() !== "") {
          return Response.json({ ok: true }, { headers: cors });
        }

        if (isBlockedEmail(data.email)) {
          return Response.json({ error: BLOCKED_EMAIL_MESSAGE }, { status: 400, headers: cors });
        }

        const ipHash = await hashIp(clientIp(request));
        const userAgent = request.headers.get("user-agent")?.slice(0, 500) ?? null;

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
          const [React, { render }, { createClient }, notification, confirmation, { sendLovableEmail }] =
            await Promise.all([
              import("react"),
              import("@react-email/render"),
              import("@supabase/supabase-js"),
              import("@/lib/email-templates/contact-notification"),
              import("@/lib/email-templates/contact-confirmation"),
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

          const supabase = createClient(supabaseUrl, supabaseServiceKey);

          // Rate limit per hashed IP.
          if (ipHash) {
            const { data: recent, error: rlErr } = await supabase.rpc(
              "count_recent_contact_submissions",
              { _ip_hash: ipHash, _minutes: RATE_LIMIT_WINDOW_MINUTES },
            );
            if (rlErr) console.error("contact: rate-limit check failed", rlErr);
            if (typeof recent === "number" && recent >= RATE_LIMIT_MAX) {
              return Response.json(
                {
                  error: `Too many messages sent recently. Please try again in ${RATE_LIMIT_WINDOW_MINUTES} minutes or email directly.`,
                },
                { status: 429, headers: cors },
              );
            }
          }

          const messageId = crypto.randomUUID();

          // Persist the enquiry first so nothing is lost if sending fails.
          const { data: enquiry, error: insertErr } = await supabase
            .from("contact_enquiries")
            .insert({
              name: data.name,
              email: data.email,
              subject: data.subject,
              message: data.message,
              ip_hash: ipHash,
              user_agent: userAgent,
              message_id: messageId,
            })
            .select("id")
            .maybeSingle();
          if (insertErr) console.error("contact: enquiry insert failed", insertErr);
          const enquiryId = enquiry?.id ?? null;

          const templateData = {
            name: data.name,
            email: data.email,
            subject: data.subject,
            message: data.message,
          };

          async function renderTemplate(entry: {
            component: any;
            subject: string | ((d: Record<string, any>) => string);
          }) {
            const element = React.createElement(entry.component, templateData);
            return {
              html: await render(element),
              text: await render(element, { plainText: true }),
              subject:
                typeof entry.subject === "function" ? entry.subject(templateData) : entry.subject,
            };
          }

          const notificationEmail = await renderTemplate(notification.template);
          const confirmationEmail = await renderTemplate(confirmation.template);

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

          async function sendTo(
            recipient: string,
            templateName: string,
            payload: { html: string; text: string; subject: string },
          ): Promise<{ ok: boolean; error?: string }> {
            const unsubscribeToken = await tokenFor(recipient);
            if (!unsubscribeToken) {
              const msg = "could not obtain unsubscribe token";
              console.error("contact:", msg, recipient);
              return { ok: false, error: msg };
            }

            await supabase.from("email_send_log").insert({
              message_id: messageId,
              template_name: templateName,
              recipient_email: recipient,
              status: "pending",
            });

            try {
              await sendLovableEmail(
                {
                  to: recipient,
                  from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
                  reply_to: templateName === "contact-notification" ? data.email : OWNER_EMAILS[1],
                  sender_domain: SENDER_DOMAIN,
                  subject: payload.subject,
                  html: payload.html,
                  text: payload.text,
                  purpose: "transactional",
                  label: templateName,
                  idempotency_key: `${templateName}-${messageId}-${recipient}`,
                  unsubscribe_token: unsubscribeToken,
                  message_id: messageId,
                } as Parameters<typeof sendLovableEmail>[0],
                { apiKey, sendUrl: process.env.LOVABLE_SEND_URL },
              );
              await supabase.from("email_send_log").insert({
                message_id: messageId,
                template_name: templateName,
                recipient_email: recipient,
                status: "sent",
              });
              return { ok: true };
            } catch (sendErr) {
              const msg = sendErr instanceof Error ? sendErr.message : String(sendErr);
              console.error("contact: sendLovableEmail failed", templateName, recipient, msg);
              await supabase.from("email_send_log").insert({
                message_id: messageId,
                template_name: templateName,
                recipient_email: recipient,
                status: "failed",
                error_message: msg.slice(0, 1000),
              });
              return { ok: false, error: msg };
            }
          }

          const ownerResults = await Promise.all(
            OWNER_EMAILS.map((recipient) =>
              sendTo(recipient, "contact-notification", notificationEmail),
            ),
          );
          const failedOwners = OWNER_EMAILS.filter((_, i) => !ownerResults[i]?.ok);
          const anySent = ownerResults.some((r) => r.ok);

          const confirmResult = await sendTo(
            data.email,
            "contact-confirmation",
            confirmationEmail,
          );

          if (enquiryId) {
            const notificationStatus =
              failedOwners.length === 0 ? "sent" : anySent ? "partial" : "failed";
            const errors = [
              ...ownerResults.filter((r) => !r.ok).map((r, i) => `${OWNER_EMAILS[i]}: ${r.error}`),
              ...(confirmResult.ok ? [] : [`${data.email}: ${confirmResult.error}`]),
            ];
            await supabase
              .from("contact_enquiries")
              .update({
                notification_status: notificationStatus,
                confirmation_status: confirmResult.ok ? "sent" : "failed",
                error_message: errors.length ? errors.join(" | ").slice(0, 1000) : null,
              })
              .eq("id", enquiryId);
          }

          if (!anySent) {
            return Response.json({ error: "Send failed" }, { status: 500, headers: cors });
          }

          return Response.json(
            { ok: true, messageId, confirmationSent: confirmResult.ok },
            { headers: cors },
          );
        } catch (err) {
          console.error("contact send failed", err);
          return Response.json({ error: "Send failed" }, { status: 500, headers: cors });
        }
      },
    },
  },
});
