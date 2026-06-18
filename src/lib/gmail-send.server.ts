// Server-only Gmail send helper, shared by /api/public/contact and /api/public/newsletter.
const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";

function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function gatewayHeaders() {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const gmailKey = process.env.GOOGLE_MAIL_API_KEY;
  if (!lovableKey || !gmailKey) {
    throw new Error("Gmail connector is not configured");
  }
  return {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": gmailKey,
    "Content-Type": "application/json",
  };
}

async function getOwnerEmail(headers: HeadersInit): Promise<string> {
  const res = await fetch(`${GATEWAY_URL}/users/me/profile`, { headers });
  if (!res.ok) {
    throw new Error(`Gmail profile lookup failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { emailAddress?: string };
  if (!data.emailAddress) throw new Error("Gmail profile missing emailAddress");
  return data.emailAddress;
}

export async function sendGmail(opts: {
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}): Promise<{ id?: string; threadId?: string; recipient: string }> {
  const headers = gatewayHeaders();
  const owner = await getOwnerEmail(headers);
  const domain = owner.split("@")[1] ?? "localhost";
  const messageId = `<${Date.now()}.${Math.random().toString(36).slice(2)}@${domain}>`;
  const boundary = `bnd_${Math.random().toString(36).slice(2)}`;

  const rfcHeaders = [
    `From: ${owner}`,
    `To: ${owner}`,
    ...(opts.replyTo ? [`Reply-To: ${opts.replyTo}`] : []),
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: ${messageId}`,
    `Subject: ${opts.subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "X-Mailer: Portfolio (Lovable)",
  ];

  const raw = [
    ...rfcHeaders,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 7bit",
    "",
    opts.text,
    "",
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: 7bit",
    "",
    opts.html,
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
    throw new Error(`Gmail send failed: ${res.status} ${await res.text()}`);
  }
  const sent = (await res.json()) as { id?: string; threadId?: string };
  return { id: sent.id, threadId: sent.threadId, recipient: owner };
}
