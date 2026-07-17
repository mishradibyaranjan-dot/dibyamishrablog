// Shared server-only helpers: AI generation + auto-send to registered users.
// Import only from other .server.ts files or inside server function/route handlers.

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80) || `issue-${Date.now()}`;

export async function generateNewsletterJSON(topicHint?: string) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY missing");
  const now = new Date();
  const monthYear = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const system = `You are Dibya R. Mishra, VP & Head of Engineering. Write a newsletter for a technical, senior audience. Voice: crisp, first-person, zero fluff. Cover Agentic AI, GenAI in Retail Supply Chains, Multi-Tenant SaaS, RAG systems, or Cloud Architecture. Return STRICT JSON: title (<=90 chars), summary (<=180 chars), body_markdown (500-900 words, ## H2 + short paragraphs; may use "- " bullets), linkedin_post (900-1200 chars, plain text, 3-5 hashtags).`;
  const user = `Write the ${monthYear} issue.${topicHint ? ` Focus: ${topicHint}.` : ""} Return JSON only.`;
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`AI generation failed (${res.status})`);
  const parsed = JSON.parse((await res.json())?.choices?.[0]?.message?.content ?? "{}");
  const title = String(parsed.title ?? `${monthYear} Notes`).slice(0, 120);
  return {
    title,
    slug: slugify(title),
    summary: String(parsed.summary ?? "").slice(0, 240),
    body_markdown: String(parsed.body_markdown ?? ""),
    linkedin_post: String(parsed.linkedin_post ?? ""),
  };
}

export async function autoSendNewsletter(opts: {
  topicHint?: string;
  createdBy?: string | null;
}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const draft = await generateNewsletterJSON(opts.topicHint);
  const nowIso = new Date().toISOString();

  const { data: issue, error: insErr } = await supabaseAdmin
    .from("newsletter_issues")
    .insert({
      slug: draft.slug,
      title: draft.title,
      summary: draft.summary,
      body_markdown: draft.body_markdown,
      linkedin_post: draft.linkedin_post,
      status: "published",
      approved_at: nowIso,
      approved_by: opts.createdBy ?? null,
      published_at: nowIso,
      emails_sent_at: nowIso,
      created_by: opts.createdBy ?? null,
    })
    .select("id, slug")
    .single();
  if (insErr || !issue) throw new Error(insErr?.message ?? "Insert failed");

  const [{ data: profs }, { data: subs }] = await Promise.all([
    supabaseAdmin.from("profiles").select("email"),
    supabaseAdmin.from("newsletter_subscribers").select("email").eq("status", "active"),
  ]);
  const emails = new Set<string>();
  for (const r of profs ?? []) if (r?.email) emails.add(String(r.email).toLowerCase());
  for (const r of subs ?? []) if (r?.email) emails.add(String(r.email).toLowerCase());

  let queued = 0;
  let errors = 0;
  for (const email of emails) {
    try {
      const { error } = await supabaseAdmin.rpc("enqueue_email", {
        queue_name: "transactional_emails",
        payload: {
          template_name: "newsletter-issue",
          recipient_email: email,
          template_data: {
            title: draft.title,
            summary: draft.summary,
            bodyMarkdown: draft.body_markdown,
            slug: issue.slug,
          },
          idempotency_key: `newsletter-${issue.id}-${email}`,
        },
      });
      if (error) throw error;
      queued++;
    } catch (e) {
      console.error("enqueue failed", email, e);
      errors++;
    }
  }

  return {
    issueId: issue.id,
    slug: issue.slug,
    title: draft.title,
    recipients: emails.size,
    emailsQueued: queued,
    emailErrors: errors,
  };
}

// Compute the next run timestamp (UTC) for a schedule.
export function computeNextRun(
  cadence: "daily" | "weekly" | "monthly",
  hourUtc: number,
  dayOfWeek: number | null,
  dayOfMonth: number | null,
  from: Date = new Date(),
): Date {
  const next = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate(), hourUtc, 0, 0, 0));
  if (cadence === "daily") {
    if (next <= from) next.setUTCDate(next.getUTCDate() + 1);
    return next;
  }
  if (cadence === "weekly") {
    const target = dayOfWeek ?? 1;
    let diff = (target - next.getUTCDay() + 7) % 7;
    if (diff === 0 && next <= from) diff = 7;
    next.setUTCDate(next.getUTCDate() + diff);
    return next;
  }
  // monthly
  const dom = Math.min(Math.max(dayOfMonth ?? 1, 1), 28);
  next.setUTCDate(dom);
  if (next <= from) next.setUTCMonth(next.getUTCMonth() + 1);
  return next;
}
