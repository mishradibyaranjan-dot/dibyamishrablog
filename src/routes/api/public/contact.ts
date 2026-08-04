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

/** Sender identity, owner inboxes and reply-to addresses live in contact-email.server. */

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
          const {
            serviceClient,
            renderTemplate,
            sendContactEmail,
            OWNER_EMAILS,
            PUBLIC_REPLY_TO,
            MAX_RETRIES,
            nextRetryDelayMinutes,
          } = await import("@/lib/contact-email.server");

          if (!process.env.LOVABLE_API_KEY) {
            console.error("contact: missing email api key");
            return Response.json({ error: "Server not configured" }, { status: 500, headers: cors });
          }

          let supabase;
          try {
            supabase = await serviceClient();
          } catch (e) {
            console.error("contact: service client unavailable", e);
            return Response.json({ error: "Server not configured" }, { status: 500, headers: cors });
          }

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
          const enquiryId = (enquiry?.id as string | undefined) ?? null;

          const templateData = {
            name: data.name,
            email: data.email,
            subject: data.subject,
            message: data.message,
          };

          const notificationEmail = await renderTemplate("contact-notification", templateData);
          const confirmationEmail = await renderTemplate("contact-confirmation", templateData);

          const ownerResults = await Promise.all(
            OWNER_EMAILS.map((recipient) =>
              sendContactEmail({
                supabase,
                recipient,
                templateName: "contact-notification",
                payload: notificationEmail,
                messageId,
                replyTo: data.email,
                enquiryId,
                triggerSource: "form",
              }),
            ),
          );
          const anySent = ownerResults.some((r) => r.ok);
          const allOwnersSent = ownerResults.every((r) => r.ok);

          const confirmResult = await sendContactEmail({
            supabase,
            recipient: data.email,
            templateName: "contact-confirmation",
            payload: confirmationEmail,
            messageId,
            replyTo: PUBLIC_REPLY_TO,
            enquiryId,
            triggerSource: "form",
          });

          if (enquiryId) {
            const notificationStatus = allOwnersSent ? "sent" : anySent ? "partial" : "failed";
            const errors = [
              ...ownerResults
                .map((r, i) => (r.ok ? null : `${OWNER_EMAILS[i]}: ${r.error}`))
                .filter((v): v is string => Boolean(v)),
              ...(confirmResult.ok ? [] : [`${data.email}: ${confirmResult.error}`]),
            ];
            const needsRetry = notificationStatus !== "sent" || !confirmResult.ok;
            await supabase
              .from("contact_enquiries")
              .update({
                notification_status: notificationStatus,
                confirmation_status: confirmResult.ok ? "sent" : "failed",
                error_message: errors.length ? errors.join(" | ").slice(0, 1000) : null,
                last_attempt_at: new Date().toISOString(),
                next_retry_at:
                  needsRetry && MAX_RETRIES > 0
                    ? new Date(Date.now() + nextRetryDelayMinutes(0) * 60000).toISOString()
                    : null,
              })
              .eq("id", enquiryId);
          }

          // A failed owner notification is retried automatically; the requester
          // still gets a success response because the enquiry is safely stored.
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
