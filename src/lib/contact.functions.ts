import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";

const ContactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  message: z.string().trim().min(1, "Message is required").max(5000),
  testMode: z.boolean().optional(),
});

export type ContactInput = z.infer<typeof ContactSchema>;

function base64UrlEncode(str: string): string {
  // btoa works in Node 18+ / workers for latin1; encode UTF-8 safely
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function getOwnerEmail(headers: HeadersInit): Promise<string> {
  const res = await fetch(`${GATEWAY_URL}/users/me/profile`, { headers });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gmail profile lookup failed: ${res.status} ${body}`);
  }
  const data = (await res.json()) as { emailAddress?: string };
  if (!data.emailAddress) throw new Error("Gmail profile missing emailAddress");
  return data.emailAddress;
}

export const sendContactMessage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => ContactSchema.parse(data))
  .handler(async ({ data }) => {
    const lovableKey = process.env.LOVABLE_API_KEY;
    const gmailKey = process.env.GOOGLE_MAIL_API_KEY;
    if (!lovableKey || !gmailKey) {
      throw new Error("Gmail connector is not configured");
    }

    const headers = {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": gmailKey,
      "Content-Type": "application/json",
    };

    const owner = await getOwnerEmail(headers);

    const subjectPrefix = data.testMode ? "[TEST]" : "[Portfolio Contact]";
    const testTag = data.testMode ? ` (test-${Date.now()})` : "";
    const subject = `${subjectPrefix} ${data.subject}${testTag}`;
    const replyTo = `${data.name} <${data.email}>`;
    const textBody = [
      data.testMode ? "*** This is an automated test message ***" : "",
      `From: ${data.name} <${data.email}>`,
      `Subject: ${data.subject}`,
      "",
      data.message,
    ].filter(Boolean).join("\r\n");
    const htmlBody = `
      <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; line-height:1.5; color:#0f172a;">
        ${data.testMode ? '<p style="background:#fef3c7;padding:8px 12px;border-radius:6px;margin:0 0 12px;font-weight:600;">⚙️ Automated test message — verifying Gmail delivery pipeline</p>' : ""}
        <h2 style="margin:0 0 12px;">New message from your portfolio</h2>
        <p style="margin:0 0 4px;"><strong>Name:</strong> ${escapeHtml(data.name)}</p>
        <p style="margin:0 0 4px;"><strong>Email:</strong> ${escapeHtml(data.email)}</p>
        <p style="margin:0 0 12px;"><strong>Subject:</strong> ${escapeHtml(data.subject)}</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;" />
        <pre style="white-space:pre-wrap;font-family:inherit;margin:0;">${escapeHtml(data.message)}</pre>
      </div>
    `.trim();

    const boundary = `bnd_${Math.random().toString(36).slice(2)}`;
    const raw = [
      `From: ${owner}`,
      `To: ${owner}`,
      `Reply-To: ${replyTo}`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      'Content-Type: text/plain; charset="UTF-8"',
      "Content-Transfer-Encoding: 7bit",
      "",
      textBody,
      "",
      `--${boundary}`,
      'Content-Type: text/html; charset="UTF-8"',
      "Content-Transfer-Encoding: 7bit",
      "",
      htmlBody,
      "",
      `--${boundary}--`,
      "",
    ].join("\r\n");

    const res = await fetch(`${GATEWAY_URL}/users/me/messages/send`, {
      method: "POST",
      headers,
      body: JSON.stringify({ raw: base64UrlEncode(raw) }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Gmail send failed: ${res.status} ${body}`);
    }

    const sent = (await res.json()) as { id?: string; threadId?: string };
    return {
      ok: true as const,
      testMode: !!data.testMode,
      messageId: sent.id,
      threadId: sent.threadId,
      recipient: owner,
      subject,
    };
  });

/**
 * Verify the full contact pipeline:
 *  1. Connector env vars are present
 *  2. Gmail profile lookup works
 *  3. A test email is sent
 *  4. The sent message is fetched back from Gmail to confirm receipt
 */
export const verifyContactPipeline = createServerFn({ method: "POST" })
  .handler(async () => {
    const steps: Array<{ step: string; ok: boolean; detail?: string }> = [];
    const lovableKey = process.env.LOVABLE_API_KEY;
    const gmailKey = process.env.GOOGLE_MAIL_API_KEY;

    steps.push({
      step: "Connector configured",
      ok: !!(lovableKey && gmailKey),
      detail: !lovableKey ? "LOVABLE_API_KEY missing" : !gmailKey ? "GOOGLE_MAIL_API_KEY missing" : "ok",
    });
    if (!lovableKey || !gmailKey) return { ok: false, steps };

    const headers = {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": gmailKey,
      "Content-Type": "application/json",
    };

    let owner: string;
    try {
      owner = await getOwnerEmail(headers);
      steps.push({ step: "Gmail profile lookup", ok: true, detail: owner });
    } catch (e) {
      steps.push({ step: "Gmail profile lookup", ok: false, detail: (e as Error).message });
      return { ok: false, steps };
    }

    const stamp = Date.now();
    const testSubject = `[TEST] Portfolio pipeline check (test-${stamp})`;
    const textBody = "Automated verification — please ignore.";
    const raw = [
      `From: ${owner}`,
      `To: ${owner}`,
      `Subject: ${testSubject}`,
      "MIME-Version: 1.0",
      'Content-Type: text/plain; charset="UTF-8"',
      "Content-Transfer-Encoding: 7bit",
      "",
      textBody,
      "",
    ].join("\r\n");

    let messageId: string | undefined;
    try {
      const sendRes = await fetch(`${GATEWAY_URL}/users/me/messages/send`, {
        method: "POST",
        headers,
        body: JSON.stringify({ raw: base64UrlEncode(raw) }),
      });
      if (!sendRes.ok) throw new Error(`${sendRes.status} ${await sendRes.text()}`);
      const sent = (await sendRes.json()) as { id?: string };
      messageId = sent.id;
      steps.push({ step: "Send test email", ok: true, detail: `id=${messageId}` });
    } catch (e) {
      steps.push({ step: "Send test email", ok: false, detail: (e as Error).message });
      return { ok: false, steps };
    }

    // Verify receipt by fetching the message we just sent
    try {
      if (!messageId) throw new Error("No messageId returned");
      const getRes = await fetch(
        `${GATEWAY_URL}/users/me/messages/${messageId}?format=metadata`,
        { headers },
      );
      if (!getRes.ok) throw new Error(`${getRes.status} ${await getRes.text()}`);
      const msg = (await getRes.json()) as {
        labelIds?: string[];
        payload?: { headers?: Array<{ name: string; value: string }> };
      };
      const subjHeader = msg.payload?.headers?.find((h) => h.name.toLowerCase() === "subject")?.value;
      const matched = subjHeader === testSubject;
      steps.push({
        step: "Verify message in Gmail",
        ok: matched,
        detail: matched
          ? `Subject confirmed; labels=${(msg.labelIds || []).join(",")}`
          : `Subject mismatch (got "${subjHeader}")`,
      });
      return { ok: matched, steps, messageId, recipient: owner };
    } catch (e) {
      steps.push({ step: "Verify message in Gmail", ok: false, detail: (e as Error).message });
      return { ok: false, steps };
    }
  });
