import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const NewsletterSchema = z.object({
  email: z.string().trim().email().max(255).regex(/^[^\r\n]*$/),
});

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/public/newsletter")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      POST: async ({ request }) => {
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
          const { sendGmail, escapeHtml } = await import("@/lib/gmail-send.server");
          const safe = escapeHtml(email);
          await sendGmail({
            subject: `[Newsletter] New subscriber: ${email}`,
            text: `New newsletter subscriber: ${email}`,
            html: `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.5;color:#0f172a;">
              <h2 style="margin:0 0 12px;">New newsletter subscriber</h2>
              <p style="margin:0;"><strong>Email:</strong> ${safe}</p>
            </div>`,
            replyTo: email,
          });
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
