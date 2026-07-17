import { createFileRoute } from "@tanstack/react-router";

/**
 * Called monthly by pg_cron. Generates the next newsletter DRAFT and stores it
 * as `pending_approval`. No emails are sent and no LinkedIn post is made —
 * the owner must review and approve the draft in the admin panel before it
 * goes out to subscribers or LinkedIn (human-in-the-loop gate).
 */
export const Route = createFileRoute("/api/public/cron/monthly-newsletter")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Authenticate with a true server-only secret (never the publishable/anon key).
        // Supports either Authorization: Bearer <CRON_SECRET> or x-cron-secret header.
        const cronSecret = process.env.CRON_SECRET;
        if (!cronSecret) {
          return new Response("Server misconfigured", { status: 500 });
        }
        const authHeader = request.headers.get("authorization") ?? "";
        const bearer = authHeader.toLowerCase().startsWith("bearer ")
          ? authHeader.slice(7).trim()
          : "";
        const provided = bearer || request.headers.get("x-cron-secret") || "";
        // Constant-time compare
        const a = new TextEncoder().encode(provided);
        const b = new TextEncoder().encode(cronSecret);
        let ok = a.length === b.length;
        for (let i = 0; i < b.length; i++) ok = ok && a[i % a.length] === b[i];
        if (!ok || provided.length === 0) {
          return new Response("Unauthorized", { status: 401 });
        }

        try {
          const lovKey = process.env.LOVABLE_API_KEY;
          if (!lovKey) throw new Error("LOVABLE_API_KEY missing");

          const now = new Date();
          const monthYear = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

          const system = `You are Dibya R. Mishra, VP & Head of Engineering. Write a monthly newsletter for a technical senior audience. Voice: crisp, first-person, zero fluff. Cover Agentic AI, GenAI in Retail Supply Chains, Multi-Tenant SaaS, RAG systems, or Cloud Architecture. Return STRICT JSON: title (<=90 chars), summary (<=180 chars), body_markdown (500-900 words, ## H2 + short paragraphs; may use "- " bullets), linkedin_post (900-1200 chars, plain text, 3-5 hashtags).`;
          const user = `Write the ${monthYear} issue. Return JSON only.`;

          const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${lovKey}` },
            body: JSON.stringify({
              model: "google/gemini-2.5-pro",
              response_format: { type: "json_object" },
              messages: [
                { role: "system", content: system },
                { role: "user", content: user },
              ],
            }),
          });
          if (!aiRes.ok) {
            const t = await aiRes.text();
            console.error("cron AI gen failed", aiRes.status, t);
            return Response.json({ error: "AI failed", status: aiRes.status }, { status: 500 });
          }
          const j = await aiRes.json();
          const parsed = JSON.parse(j?.choices?.[0]?.message?.content ?? "{}");
          const title = String(parsed.title ?? `${monthYear} Notes`).slice(0, 120);
          const summary = String(parsed.summary ?? "").slice(0, 240);
          const body_markdown = String(parsed.body_markdown ?? "");
          const linkedin_post = String(parsed.linkedin_post ?? "");

          const slug =
            title
              .toLowerCase()
              .replace(/[^\w\s-]/g, "")
              .trim()
              .replace(/\s+/g, "-")
              .slice(0, 80) || `issue-${Date.now()}`;

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          const { data: issue, error: insErr } = await supabaseAdmin
            .from("newsletter_issues")
            .insert({
              slug,
              title,
              summary,
              body_markdown,
              linkedin_post,
              status: "pending_approval",
            })
            .select("id, slug, status")
            .single();
          if (insErr) throw insErr;

          return Response.json({
            ok: true,
            issueId: issue.id,
            slug: issue.slug,
            status: issue.status,
            note: "Draft saved as pending_approval. Owner must approve before emails or LinkedIn post.",
          });
        } catch (err) {
          console.error("monthly-newsletter cron failed", err);
          return Response.json({ error: "Cron failed" }, { status: 500 });
        }
      },
    },
  },
});
