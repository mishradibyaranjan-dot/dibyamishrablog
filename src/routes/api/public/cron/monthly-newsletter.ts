import { createFileRoute } from "@tanstack/react-router";

/**
 * Called monthly by pg_cron. Generates + publishes the next newsletter issue.
 * Auth via Supabase anon apikey header (pg_cron pattern).
 */
export const Route = createFileRoute("/api/public/cron/monthly-newsletter")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apikey = request.headers.get("apikey");
        const expected = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!expected || apikey !== expected) {
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
              status: "published",
              published_at: new Date().toISOString(),
            })
            .select("*")
            .single();
          if (insErr) throw insErr;

          // Enqueue emails to all subscribers
          const { data: subs } = await supabaseAdmin
            .from("newsletter_subscribers")
            .select("email")
            .eq("status", "active");
          let queued = 0;
          for (const s of subs ?? []) {
            const { error: eErr } = await supabaseAdmin.rpc("enqueue_email", {
              queue_name: "transactional_emails",
              payload: {
                template_name: "newsletter-issue",
                recipient_email: s.email,
                template_data: {
                  title: issue.title,
                  summary: issue.summary,
                  bodyMarkdown: issue.body_markdown,
                  slug: issue.slug,
                },
                idempotency_key: `newsletter-${issue.id}-${s.email}`,
              },
            });
            if (!eErr) queued++;
          }

          await supabaseAdmin
            .from("newsletter_issues")
            .update({ emails_sent_at: new Date().toISOString() })
            .eq("id", issue.id);

          // LinkedIn (best-effort)
          let linkedinPosted = false;
          try {
            const liKey = process.env.LINKEDIN_API_KEY;
            if (liKey && linkedin_post) {
              const meRes = await fetch(
                "https://connector-gateway.lovable.dev/linkedin/v2/userinfo",
                { headers: { Authorization: `Bearer ${lovKey}`, "X-Connection-Api-Key": liKey } },
              );
              if (meRes.ok) {
                const me = await meRes.json();
                const sub = me?.sub;
                if (sub) {
                  const shareUrl = `https://www.dibyamishra.co.in/newsletter/${issue.slug}`;
                  const postRes = await fetch(
                    "https://connector-gateway.lovable.dev/linkedin/v2/ugcPosts",
                    {
                      method: "POST",
                      headers: {
                        Authorization: `Bearer ${lovKey}`,
                        "X-Connection-Api-Key": liKey,
                        "Content-Type": "application/json",
                        "X-Restli-Protocol-Version": "2.0.0",
                      },
                      body: JSON.stringify({
                        author: `urn:li:person:${sub}`,
                        lifecycleState: "PUBLISHED",
                        specificContent: {
                          "com.linkedin.ugc.ShareContent": {
                            shareCommentary: { text: `${linkedin_post}\n\nRead: ${shareUrl}` },
                            shareMediaCategory: "NONE",
                          },
                        },
                        visibility: {
                          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
                        },
                      }),
                    },
                  );
                  if (postRes.ok) {
                    linkedinPosted = true;
                    await supabaseAdmin
                      .from("newsletter_issues")
                      .update({ linkedin_posted_at: new Date().toISOString() })
                      .eq("id", issue.id);
                  } else {
                    console.error("LinkedIn post failed", postRes.status, await postRes.text());
                  }
                }
              }
            }
          } catch (e) {
            console.error("LinkedIn error", e);
          }

          return Response.json({
            ok: true,
            issueId: issue.id,
            slug: issue.slug,
            emailsQueued: queued,
            linkedinPosted,
          });
        } catch (err) {
          console.error("monthly-newsletter cron failed", err);
          return Response.json({ error: "Cron failed" }, { status: 500 });
        }
      },
    },
  },
});
