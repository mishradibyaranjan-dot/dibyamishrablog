// Shared server-only helpers: AI generation + auto-send to registered users.
// Import only from other .server.ts files or inside server function/route handlers.

/**
 * Renders a registered template and sends it through Lovable's managed email
 * delivery, recording the outcome in the app's own send history.
 */
export async function enqueueRenderedTemplate(opts: {
  templateName: string;
  recipientEmail: string;
  templateData: Record<string, unknown>;
  idempotencyKey?: string;
}): Promise<{ queued: boolean; reason?: string; messageId?: string }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
  const { TEMPLATES } = await import("@/lib/email-templates/registry");

  const template = TEMPLATES[opts.templateName];
  if (!template) throw new Error(`Template '${opts.templateName}' not registered`);

  const to = (template.to || opts.recipientEmail).toLowerCase();
  const messageId = crypto.randomUUID();

  const logOutcome = async (
    status: "sent" | "suppressed" | "failed",
    errorMessage?: string,
  ) => {
    const { error } = await supabaseAdmin.from("email_send_log").insert({
      message_id: messageId,
      template_name: opts.templateName,
      recipient_email: to,
      status,
      ...(errorMessage ? { error_message: errorMessage.slice(0, 1000) } : {}),
    });
    if (error) console.error("[newsletter] send log write failed", error.code, error.message);
  };

  const send = () =>
    sendTemplateEmail(opts.templateName, to, {
      templateData: opts.templateData as Record<string, any>,
      idempotencyKey: opts.idempotencyKey || messageId,
    });

  try {
    let result;
    try {
      result = await send();
    } catch (err) {
      // Rate limited: wait the advertised window once, then retry this send.
      const { EmailAPIError } = await import("@lovable.dev/email-js");
      if (err instanceof EmailAPIError && err.status === 429) {
        const waitMs = (err.retryAfterSeconds ?? 60) * 1000;
        await new Promise((r) => setTimeout(r, waitMs));
        result = await send();
      } else {
        throw err;
      }
    }
    if (!result.sent) {
      await logOutcome("suppressed");
      return { queued: false, reason: result.reason };
    }
    await logOutcome("sent");
    return { queued: true, messageId };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await logOutcome("failed", msg);
    throw err;
  }

}


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

export type NewsletterTriggerSource = "schedule" | "manual_run" | "one_click" | "cron";

export async function autoSendNewsletter(opts: {
  topicHint?: string;
  createdBy?: string | null;
  scheduleId?: string | null;
  triggerSource?: NewsletterTriggerSource;
}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const triggerSource: NewsletterTriggerSource = opts.triggerSource ?? "one_click";

  // Start a run row up-front so failures during generation are still visible.
  const { data: runStart } = await supabaseAdmin
    .from("newsletter_send_runs")
    .insert({
      schedule_id: opts.scheduleId ?? null,
      trigger_source: triggerSource,
      triggered_by: opts.createdBy ?? null,
      status: "running",
    })
    .select("id")
    .single();
  const runId: string | null = runStart?.id ?? null;

  const finishRun = async (patch: Record<string, unknown>) => {
    if (!runId) return;
    await supabaseAdmin
      .from("newsletter_send_runs")
      .update({ ...patch, finished_at: new Date().toISOString() })
      .eq("id", runId);
  };

  let draft: Awaited<ReturnType<typeof generateNewsletterJSON>>;
  try {
    draft = await generateNewsletterJSON(opts.topicHint);
  } catch (e) {
    await finishRun({ status: "failed", error_message: e instanceof Error ? e.message : String(e) });
    throw e;
  }

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
  if (insErr || !issue) {
    await finishRun({ status: "failed", error_message: insErr?.message ?? "Insert failed", title: draft.title });
    throw new Error(insErr?.message ?? "Insert failed");
  }

  if (runId) {
    await supabaseAdmin
      .from("newsletter_send_runs")
      .update({ issue_id: issue.id, title: draft.title })
      .eq("id", runId);
  }

  const [{ data: profs }, { data: subs }] = await Promise.all([
    supabaseAdmin.from("profiles").select("email"),
    supabaseAdmin.from("newsletter_subscribers").select("email").eq("status", "active"),
  ]);
  const emails = new Set<string>();
  for (const r of profs ?? []) if (r?.email) emails.add(String(r.email).toLowerCase());
  for (const r of subs ?? []) if (r?.email) emails.add(String(r.email).toLowerCase());

  let queued = 0;
  let errors = 0;
  const recipientRows: Array<{ run_id: string; email: string; status: "queued" | "failed"; error_message: string | null }> = [];
  for (const email of emails) {
    try {
      const r = await enqueueRenderedTemplate({
        templateName: "newsletter-issue",
        recipientEmail: email,
        templateData: {
          title: draft.title,
          summary: draft.summary,
          bodyMarkdown: draft.body_markdown,
          slug: issue.slug,
        },
        idempotencyKey: `newsletter-${issue.id}-${email}`,
      });
      if (r.queued) {
        queued++;
        if (runId) recipientRows.push({ run_id: runId, email, status: "queued", error_message: null });
      } else {
        if (runId) recipientRows.push({ run_id: runId, email, status: "failed", error_message: r.reason ?? "not queued" });
      }
    } catch (e) {
      console.error("enqueue failed", email, e);
      errors++;
      if (runId)
        recipientRows.push({
          run_id: runId,
          email,
          status: "failed",
          error_message: e instanceof Error ? e.message : String(e),
        });
    }
  }

  if (runId && recipientRows.length > 0) {
    // Chunk inserts to stay within row-size limits.
    for (let i = 0; i < recipientRows.length; i += 500) {
      await supabaseAdmin.from("newsletter_send_recipients").insert(recipientRows.slice(i, i + 500));
    }
  }

  await finishRun({
    status: "completed",
    recipients_total: emails.size,
    queued_count: queued,
    failed_count: errors,
    title: draft.title,
  });

  return {
    runId,
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
