import { createFileRoute } from "@tanstack/react-router";

const TOKEN_PATTERN = /^[a-f0-9]{64}$/;
const headers = { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" };

const page = (token: string, message?: string) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Newsletter unsubscribe</title></head>
<body style="margin:0;font-family:system-ui,sans-serif;background:#fff;color:#111"><main style="max-width:36rem;margin:10vh auto;padding:2rem;text-align:center">
<h1>${message ? "Subscription updated" : "Unsubscribe from the newsletter"}</h1><p>${message ?? "Confirm that you no longer want to receive newsletter emails."}</p>
${message ? '<p><a href="/">Return to the website</a></p>' : `<form method="post" action="/email/unsubscribe?token=${token}"><button type="submit" style="min-height:44px;padding:.7rem 1rem">Unsubscribe</button></form>`}
</main></body></html>`;

async function unsubscribe(token: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: record, error } = await supabaseAdmin.from("email_unsubscribe_tokens").select("email, used_at").eq("token", token).maybeSingle();
  if (error || !record) return { ok: false, status: 404, message: "This unsubscribe link is invalid or expired." };
  if (record.used_at) return { ok: true, status: 200, message: "This email address is already unsubscribed." };

  const now = new Date().toISOString();
  const { error: updateError } = await supabaseAdmin.from("email_unsubscribe_tokens").update({ used_at: now }).eq("token", token).is("used_at", null);
  if (updateError) return { ok: false, status: 500, message: "We could not update your subscription. Please try again." };
  await Promise.all([
    supabaseAdmin.from("newsletter_subscribers").update({ status: "unsubscribed", unsubscribed_at: now }).eq("email", record.email),
    supabaseAdmin.from("suppressed_emails").upsert({ email: record.email.toLowerCase(), reason: "unsubscribe" }, { onConflict: "email" }),
  ]);

  const apiKey = process.env.LOVABLE_API_KEY;
  if (apiKey) {
    try {
      const { setEmailUnsubscribe } = await import("@lovable.dev/email-js");
      await setEmailUnsubscribe({ recipient: record.email, domain: "notify.dibyamishra.co.in", subscribed: false }, { apiKey });
    } catch (managedError) {
      console.error("[newsletter-unsubscribe] managed state sync failed", managedError instanceof Error ? managedError.message : String(managedError));
    }
  }
  return { ok: true, status: 200, message: "You have been unsubscribed from newsletter emails." };
}

export const Route = createFileRoute("/email/unsubscribe")({
  server: { handlers: {
    GET: async ({ request }) => {
      const token = new URL(request.url).searchParams.get("token") ?? "";
      if (!TOKEN_PATTERN.test(token)) return new Response(page("", "This unsubscribe link is invalid or expired."), { status: 400, headers });
      return new Response(page(token), { headers });
    },
    POST: async ({ request }) => {
      const token = new URL(request.url).searchParams.get("token") ?? "";
      if (!TOKEN_PATTERN.test(token)) return new Response(page("", "This unsubscribe link is invalid or expired."), { status: 400, headers });
      const result = await unsubscribe(token);
      if (!(request.headers.get("accept")?.includes("text/html") ?? false)) return Response.json({ success: result.ok, message: result.message }, { status: result.status, headers: { "cache-control": "no-store" } });
      return new Response(page("", result.message), { status: result.status, headers });
    },
  } },
});