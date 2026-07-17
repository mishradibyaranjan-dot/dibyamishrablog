import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80) || `issue-${Date.now()}`;

async function assertAdmin(context: {
  supabase: { rpc?: unknown; from: (t: string) => any };
  userId: string;
}) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error("Role check failed");
  if (!data) throw new Error("Forbidden");
}

// ============ GENERATE (Gemini 2.5 Pro) ============
export const generateNewsletterDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { topicHint?: string } | undefined) =>
    z.object({ topicHint: z.string().max(500).optional() }).parse(d ?? {}),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const now = new Date();
    const monthYear = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    const system = `You are Dibya R. Mishra, VP & Head of Engineering. Write a monthly newsletter for a technical, senior audience (CTOs, VPs, architects). Voice: crisp, insightful, first-person, zero fluff. Cover Agentic AI, GenAI in Retail Supply Chains, Multi-Tenant SaaS, RAG systems, or Cloud Architecture.
Return STRICT JSON with keys: title (string, <=90 chars), summary (string, <=180 chars), body_markdown (string, 500-900 words, use ## H2 and short paragraphs; may include bullet lists with "- "), linkedin_post (string, 900-1200 chars, plain text, 3-5 line breaks, ends with 3-5 hashtags).`;

    const user = `Write the ${monthYear} issue.${data.topicHint ? ` Focus hint: ${data.topicHint}.` : ""} Return JSON only, no prose outside.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) {
      const txt = await res.text();
      console.error("AI gateway error", res.status, txt);
      throw new Error(`AI generation failed (${res.status})`);
    }
    const j = await res.json();
    const raw = j?.choices?.[0]?.message?.content ?? "{}";
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("AI returned invalid JSON");
    }
    const title = String(parsed.title ?? `${monthYear} Notes`).slice(0, 120);
    const summary = String(parsed.summary ?? "").slice(0, 240);
    const body_markdown = String(parsed.body_markdown ?? "");
    const linkedin_post = String(parsed.linkedin_post ?? "");

    return { title, summary, body_markdown, linkedin_post };
  });

// ============ SAVE (create or update) ============
export const saveNewsletterIssue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        title: z.string().min(3).max(200),
        summary: z.string().max(500).default(""),
        body_markdown: z.string().min(20),
        linkedin_post: z.string().max(3000).default(""),
        hero_emoji: z.string().max(8).default("📰"),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const slug = slugify(data.title);
    if (data.id) {
      const { data: row, error } = await context.supabase
        .from("newsletter_issues")
        .update({
          title: data.title,
          summary: data.summary,
          body_markdown: data.body_markdown,
          linkedin_post: data.linkedin_post,
          hero_emoji: data.hero_emoji,
        })
        .eq("id", data.id)
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      return row;
    }
    const { data: row, error } = await context.supabase
      .from("newsletter_issues")
      .insert({
        slug,
        title: data.title,
        summary: data.summary,
        body_markdown: data.body_markdown,
        linkedin_post: data.linkedin_post,
        hero_emoji: data.hero_emoji,
        created_by: context.userId,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

// ============ LIST (admin) ============
export const listAllIssues = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("newsletter_issues")
      .select(
        "id, slug, title, summary, body_markdown, linkedin_post, hero_emoji, status, approved_at, approved_by, published_at, linkedin_posted_at, emails_sent_at, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// ============ SUBMIT FOR APPROVAL ============
export const submitForApproval = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("newsletter_issues")
      .update({ status: "pending_approval", approved_at: null, approved_by: null })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============ APPROVE (owner sign-off) ============
export const approveNewsletterIssue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("newsletter_issues")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: context.userId,
      })
      .eq("id", data.id)
      .in("status", ["draft", "pending_approval", "approved"]);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============ PUBLISH: requires approval. Emails subscribers + posts to LinkedIn. ============
export const publishNewsletterIssue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        sendEmails: z.boolean().default(true),
        postToLinkedIn: z.boolean().default(true),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { data: issue, error: fetchErr } = await context.supabase
      .from("newsletter_issues")
      .select("*")
      .eq("id", data.id)
      .single();
    if (fetchErr || !issue) throw new Error("Issue not found");

    // Human-in-the-loop gate: nothing goes out until the owner has approved.
    if (!issue.approved_at || (issue.status !== "approved" && issue.status !== "published")) {
      throw new Error("Approval required before publishing. Approve the issue first.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Mark published
    if (issue.status !== "published") {
      const { error } = await supabaseAdmin
        .from("newsletter_issues")
        .update({ status: "published", published_at: new Date().toISOString() })
        .eq("id", data.id);
      if (error) throw new Error(error.message);
    }


    const result: {
      emailsQueued: number;
      emailErrors: number;
      linkedInPosted: boolean;
      linkedInError?: string;
    } = { emailsQueued: 0, emailErrors: 0, linkedInPosted: false };

    // 2. Email subscribers
    if (data.sendEmails) {
      const { data: subs, error: subErr } = await supabaseAdmin
        .from("newsletter_subscribers")
        .select("email")
        .eq("status", "active");
      if (subErr) throw new Error(subErr.message);
      const list: { email: string }[] = subs ?? [];

      // Enqueue one at a time using the internal /lovable/email/transactional/send route
      // via the RPC enqueue_email (which is exactly what /send does under the hood).
      for (const s of list) {
        try {
          const { error: enqErr } = await supabaseAdmin.rpc("enqueue_email", {
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
          if (enqErr) throw enqErr;
          result.emailsQueued++;
        } catch (e) {
          console.error("enqueue failed", s.email, e);
          result.emailErrors++;
        }
      }

      await supabaseAdmin
        .from("newsletter_issues")
        .update({ emails_sent_at: new Date().toISOString() })
        .eq("id", data.id);
    }

    // 3. LinkedIn
    if (data.postToLinkedIn && issue.linkedin_post) {
      try {
        const lovKey = process.env.LOVABLE_API_KEY;
        const liKey = process.env.LINKEDIN_API_KEY;
        if (!lovKey || !liKey) throw new Error("LinkedIn connector not configured");

        // Fetch member URN
        const meRes = await fetch("https://connector-gateway.lovable.dev/linkedin/v2/userinfo", {
          headers: {
            Authorization: `Bearer ${lovKey}`,
            "X-Connection-Api-Key": liKey,
          },
        });
        if (!meRes.ok) throw new Error(`userinfo ${meRes.status}: ${await meRes.text()}`);
        const me = await meRes.json();
        const sub = me?.sub;
        if (!sub) throw new Error("No LinkedIn member sub");

        const shareUrl = `https://www.dibyamishra.co.in/newsletter/${issue.slug}`;
        const text = `${issue.linkedin_post}\n\nRead the full issue: ${shareUrl}`;

        const postRes = await fetch("https://connector-gateway.lovable.dev/linkedin/v2/ugcPosts", {
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
                shareCommentary: { text },
                shareMediaCategory: "NONE",
              },
            },
            visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
          }),
        });
        if (!postRes.ok) {
          const errBody = await postRes.text();
          throw new Error(`ugcPosts ${postRes.status}: ${errBody}`);
        }
        await supabaseAdmin
          .from("newsletter_issues")
          .update({ linkedin_posted_at: new Date().toISOString() })
          .eq("id", data.id);
        result.linkedInPosted = true;
      } catch (e) {
        result.linkedInError = e instanceof Error ? e.message : String(e);
        console.error("LinkedIn post failed", e);
      }
    }

    return result;
  });
