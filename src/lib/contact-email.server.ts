/**
 * Server-only contact email plumbing shared by the public contact form, the
 * automatic retry worker and the admin reply action, so every message uses the
 * same sender domain, reply-to addresses and delivery bookkeeping.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export const SITE_NAME = "dibyamishrablog";
export const SENDER_DOMAIN = "notify.dibyamishra.co.in";
export const FROM_DOMAIN = "notify.dibyamishra.co.in";
/** Owner inboxes that receive every enquiry notification. */
export const OWNER_EMAILS = [
  "mishra.dibyaranjan@gmail.com",
  "contactme@dibyamishra.co.in",
];
/** Address requesters see as reply-to on confirmations and replies. */
export const PUBLIC_REPLY_TO = "contactme@dibyamishra.co.in";

/** Attempts (including the original send) before automatic retries stop. */
export const MAX_RETRIES = 4;
/** Exponential backoff in minutes, indexed by retry_count. */
const BACKOFF_MINUTES = [5, 20, 60, 240];

export type EmailKind = "contact-notification" | "contact-confirmation" | "contact-reply";

export function nextRetryDelayMinutes(retryCount: number): number {
  return BACKOFF_MINUTES[Math.min(retryCount, BACKOFF_MINUTES.length - 1)] ?? 240;
}


export async function serviceClient(): Promise<SupabaseClient> {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env.SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("supabase_service_credentials_missing");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function renderTemplate(
  templateName: EmailKind,
  templateData: Record<string, unknown>,
): Promise<{ html: string; text: string; subject: string }> {
  const [React, { render }, { TEMPLATES }] = await Promise.all([
    import("react"),
    import("@react-email/render"),
    import("@/lib/email-templates/registry"),
  ]);
  const entry = TEMPLATES[templateName];
  if (!entry) throw new Error(`unknown_template:${templateName}`);
  const element = React.createElement(entry.component, templateData as never);
  return {
    html: await render(element),
    text: await render(element, { plainText: true }),
    subject:
      typeof entry.subject === "function"
        ? entry.subject(templateData as Record<string, any>)
        : entry.subject,
  };
}


export interface SendArgs {
  supabase: SupabaseClient;
  recipient: string;
  templateName: EmailKind;
  payload: { html: string; text: string; subject: string };
  messageId: string;
  /** Address the recipient replies to; owner notifications reply to the requester. */
  replyTo: string;
  /** Recorded on the attempt row for the admin history. */
  enquiryId?: string | null;
  attemptNo?: number;
  triggerSource?: "form" | "auto-retry" | "manual-retry" | "admin-reply";
  actorId?: string | null;
}

export async function sendContactEmail({
  supabase,
  recipient,
  templateName,
  payload,
  messageId,
  replyTo,
  enquiryId = null,
  attemptNo = 1,
  triggerSource = "form",
  actorId = null,
}: SendArgs): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) return { ok: false, error: "email_api_key_missing" };

  const { EmailAPIError, sendLovableEmail } = await import("@lovable.dev/email-js");

  const recordAttempt = async (status: "sent" | "failed", error?: string) => {
    if (!enquiryId) return;
    await supabase.from("contact_email_attempts").insert({
      enquiry_id: enquiryId,
      kind: templateName,
      recipient_email: recipient,
      status,
      attempt_no: attemptNo,
      trigger_source: triggerSource,
      error_message: error ? error.slice(0, 1000) : null,
      actor_id: actorId,
    });
  };

  const logSend = async (
    status: "sent" | "suppressed" | "failed",
    errorMessage?: string,
  ) => {
    const { error } = await supabase.from("email_send_log").insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: recipient,
      status,
      ...(errorMessage ? { error_message: errorMessage.slice(0, 1000) } : {}),
    });
    if (error) console.error("[contact-email] send log write failed", error.code, error.message);
  };

  try {
    await sendLovableEmail(
      {
        to: recipient,
        from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
        reply_to: replyTo,
        sender_domain: SENDER_DOMAIN,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        purpose: "transactional",
        label: templateName,
        idempotency_key: `${templateName}-${messageId}-${attemptNo}-${recipient}`,
      } as Parameters<typeof sendLovableEmail>[0],
      { apiKey, sendUrl: process.env.LOVABLE_SEND_URL ?? undefined } as Parameters<
        typeof sendLovableEmail
      >[1],
    );
    await logSend("sent");
    await recordAttempt("sent");
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // A suppressed recipient (earlier bounce, complaint or unsubscribe) is an
    // expected outcome enforced by Lovable — never retried around.
    if (err instanceof EmailAPIError && err.code === "recipient_suppressed") {
      await logSend("suppressed", msg);
      await recordAttempt("failed", "recipient_suppressed");
      return { ok: false, error: "recipient_suppressed" };
    }
    console.error("[contact-email] send failed", templateName, recipient, msg);
    await logSend("failed", msg);
    await recordAttempt("failed", msg);
    return { ok: false, error: msg };
  }

}

interface RetryRow {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  message_id: string | null;
  notification_status: string;
  confirmation_status: string;
  retry_count: number;
}

/**
 * Retries only the legs that are still failing for one enquiry and updates its
 * delivery status, retry counter and next backoff window.
 */
export async function retryEnquiryDelivery(
  supabase: SupabaseClient,
  row: RetryRow,
  trigger: "auto-retry" | "manual-retry",
  actorId: string | null = null,
): Promise<{
  enquiryId: string;
  attempted: string[];
  notification_status: string;
  confirmation_status: string;
}> {
  const templateData = {
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
  };
  const messageId = row.message_id ?? crypto.randomUUID();
  const attemptNo = (row.retry_count ?? 0) + 2; // attempt 1 was the original send
  const attempted: string[] = [];
  const errors: string[] = [];

  let notificationStatus = row.notification_status;
  if (notificationStatus !== "sent") {
    const payload = await renderTemplate("contact-notification", templateData);
    const results = await Promise.all(
      OWNER_EMAILS.map(async (recipient) => {
        attempted.push(recipient);
        return sendContactEmail({
          supabase,
          recipient,
          templateName: "contact-notification",
          payload,
          messageId,
          replyTo: row.email,
          enquiryId: row.id,
          attemptNo,
          triggerSource: trigger,
          actorId,
        });
      }),
    );
    results.forEach((r, i) => {
      if (!r.ok) errors.push(`${OWNER_EMAILS[i]}: ${r.error}`);
    });
    const okCount = results.filter((r) => r.ok).length;
    notificationStatus = okCount === OWNER_EMAILS.length ? "sent" : okCount > 0 ? "partial" : "failed";
  }

  let confirmationStatus = row.confirmation_status;
  if (confirmationStatus !== "sent") {
    const payload = await renderTemplate("contact-confirmation", templateData);
    attempted.push(row.email);
    const result = await sendContactEmail({
      supabase,
      recipient: row.email,
      templateName: "contact-confirmation",
      payload,
      messageId,
      replyTo: PUBLIC_REPLY_TO,
      enquiryId: row.id,
      attemptNo,
      triggerSource: trigger,
      actorId,
    });
    confirmationStatus = result.ok ? "sent" : "failed";
    if (!result.ok) errors.push(`${row.email}: ${result.error}`);
  }

  const stillFailing = notificationStatus !== "sent" || confirmationStatus !== "sent";
  const retryCount = (row.retry_count ?? 0) + 1;

  await supabase
    .from("contact_enquiries")
    .update({
      notification_status: notificationStatus,
      confirmation_status: confirmationStatus,
      error_message: errors.length ? errors.join(" | ").slice(0, 1000) : null,
      retry_count: retryCount,
      last_attempt_at: new Date().toISOString(),
      next_retry_at:
        stillFailing && retryCount < MAX_RETRIES
          ? new Date(Date.now() + nextRetryDelayMinutes(retryCount) * 60000).toISOString()
          : null,
    })
    .eq("id", row.id);

  return {
    enquiryId: row.id,
    attempted,
    notification_status: notificationStatus,
    confirmation_status: confirmationStatus,
  };
}

/** Processes every enquiry whose delivery failed and whose backoff has elapsed. */
export async function runContactRetrySweep(limit = 10) {
  const supabase = await serviceClient();
  const { data, error } = await supabase.rpc("contact_enquiries_due_for_retry", {
    _max_retries: MAX_RETRIES,
    _limit: limit,
  });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as RetryRow[];
  const processed = [];
  for (const row of rows) {
    processed.push(await retryEnquiryDelivery(supabase, row, "auto-retry"));
  }
  return { due: rows.length, processed };
}
