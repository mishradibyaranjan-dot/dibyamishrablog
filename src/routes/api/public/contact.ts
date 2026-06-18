import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const noCRLF = /^[^\r\n]*$/;
const ContactSchema = z.object({
  name: z.string().trim().min(1).max(100).regex(noCRLF),
  email: z.string().trim().email().max(255).regex(noCRLF),
  subject: z.string().trim().min(1).max(200).regex(noCRLF),
  message: z.string().trim().min(1).max(5000),
});

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/public/contact")({
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
        const parsed = ContactSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json(
            { error: "Invalid input", issues: parsed.error.flatten() },
            { status: 400, headers: cors },
          );
        }
        const data = parsed.data;

        try {
          const { sendGmail, escapeHtml } = await import("@/lib/gmail-send.server");
          const html = `
            <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.5;color:#0f172a;">
              <h2 style="margin:0 0 12px;">New message from your portfolio</h2>
              <p style="margin:0 0 4px;"><strong>Name:</strong> ${escapeHtml(data.name)}</p>
              <p style="margin:0 0 4px;"><strong>Email:</strong> ${escapeHtml(data.email)}</p>
              <p style="margin:0 0 12px;"><strong>Subject:</strong> ${escapeHtml(data.subject)}</p>
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;" />
              <pre style="white-space:pre-wrap;font-family:inherit;margin:0;">${escapeHtml(data.message)}</pre>
            </div>`.trim();
          const text = `From: ${data.name} <${data.email}>\nSubject: ${data.subject}\n\n${data.message}`;
          const sent = await sendGmail({
            subject: `[Portfolio Contact] ${data.subject}`,
            html,
            text,
            replyTo: `${data.name} <${data.email}>`,
          });
          return Response.json({ ok: true, messageId: sent.id }, { headers: cors });
        } catch (err) {
          console.error("contact send failed", err);
          return Response.json(
            { error: err instanceof Error ? err.message : "Send failed" },
            { status: 500, headers: cors },
          );
        }
      },
    },
  },
});
