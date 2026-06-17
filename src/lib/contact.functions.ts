import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";

const ContactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  message: z.string().trim().min(1, "Message is required").max(5000),
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

    const subject = `[Portfolio Contact] ${data.subject}`;
    const replyTo = `${data.name} <${data.email}>`;
    const textBody = [
      `From: ${data.name} <${data.email}>`,
      `Subject: ${data.subject}`,
      "",
      data.message,
    ].join("\r\n");
    const htmlBody = `
      <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; line-height:1.5; color:#0f172a;">
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

    return { ok: true as const };
  });
