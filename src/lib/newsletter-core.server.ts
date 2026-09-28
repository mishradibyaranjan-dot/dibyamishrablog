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

  const { data: suppressed, error: suppressionError } = await supabaseAdmin
    .from("suppressed_emails")
    .select("id")
    .eq("email", to)
    .maybeSingle();
  if (suppressionError) throw new Error("suppression check failed");
  if (suppressed) {
    await supabaseAdmin.from("email_send_log").insert({
      message_id: messageId,
      template_name: opts.templateName,
      recipient_email: to,
      status: "suppressed",
    });
    return { queued: false, reason: "recipient_suppressed" };
  }

  let unsubscribeToken: string | undefined;
  if (opts.templateName === "newsletter-issue") {
    const { data: current, error: tokenReadError } = await supabaseAdmin
      .from("email_unsubscribe_tokens")
      .select("token, used_at")
      .eq("email", to)
      .maybeSingle();
    if (tokenReadError) throw new Error("unsubscribe token lookup failed");
    if (current?.token && !current.used_at) {
      unsubscribeToken = current.token;
    } else {
      const bytes = new Uint8Array(32);
      crypto.getRandomValues(bytes);
      const token = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
      const { data: stored, error: tokenWriteError } = await supabaseAdmin
        .from("email_unsubscribe_tokens")
        .upsert({ email: to, token, used_at: null }, { onConflict: "email" })
        .select("token")
        .single();
      if (tokenWriteError || !stored) throw new Error("unsubscribe token creation failed");
      unsubscribeToken = stored.token;
    }
  }

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

  const send = () => {
    const templateData = unsubscribeToken
      ? {
          ...opts.templateData,
          unsubscribeUrl: `https://www.dibyamishra.co.in/email/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`,
        }
      : opts.templateData;
    return sendTemplateEmail(opts.templateName, to, {
      templateData: templateData as Record<string, any>,
      idempotencyKey: opts.idempotencyKey || messageId,
      unsubscribeToken,
    });
  };

  try {
    const result = await send();
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

export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  task: (item: T) => Promise<R>,
): Promise<Array<PromiseSettledResult<R>>> {
  const results: Array<PromiseSettledResult<R>> = new Array(items.length);
  let nextIndex = 0;
  const workers = Array.from({ length: Math.min(Math.max(1, limit), items.length) }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      try {
        results[index] = { status: "fulfilled", value: await task(items[index]) };
      } catch (reason) {
        results[index] = { status: "rejected", reason };
      }
    }
  });
  await Promise.all(workers);
  return results;
}


const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80) || `issue-${Date.now()}`;

// Streams a JSON newsletter draft from the AI gateway (Responses API).
async function streamNewsletterJSON(apiKey: string, system: string, user: string) {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      Authorization: `Bearer ${apiKey}`,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: "openai/gpt-6-astra",
      stream: true,
      store: false,
      reasoning: { effort: "low" },
      text: { format: { type: "json_object" } },
      instructions: system,
      input: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok || !res.body) {
    const t = await res.text().catch(() => "");
    throw new Error(`AI generation failed (${res.status}) ${t.slice(0, 300)}`);
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let out = "";
  let finalText = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const ev = JSON.parse(payload);
        if (ev.type === "response.output_text.delta") out += ev.delta ?? "";
        else if (ev.type === "response.output_text.done") finalText = ev.text ?? "";
        else if (ev.type === "response.failed" || ev.type === "error")
          throw new Error(`AI generation failed: ${ev.response?.error?.message ?? ev.message ?? "unknown"}`);
      } catch (e) {
        if (e instanceof Error && e.message.startsWith("AI generation failed")) throw e;
      }
    }
  }
  const text = (finalText || out).trim();
  if (!text) throw new Error("AI returned an empty newsletter");
  return JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, ""));
}

// Posts an issue to the owner's LinkedIn via the connector gateway.
export async function postIssueToLinkedIn(issue: { id: string; slug: string; linkedin_post: string | null }) {
  const lovKey = process.env.LOVABLE_API_KEY;
  const liKey = process.env.LINKEDIN_API_KEY;
  if (!lovKey || !liKey) throw new Error("LinkedIn connector not configured");
  if (!issue.linkedin_post) throw new Error("No LinkedIn text");
  const headers = { Authorization: `Bearer ${lovKey}`, "X-Connection-Api-Key": liKey };
  const meRes = await fetch("https://connector-gateway.lovable.dev/linkedin/v2/userinfo", { headers });
  if (!meRes.ok) throw new Error(`userinfo ${meRes.status}: ${await meRes.text()}`);
  const sub = (await meRes.json())?.sub;
  if (!sub) throw new Error("No LinkedIn member sub");
  const text = `${issue.linkedin_post}\n\nRead the full issue: https://www.dibyamishra.co.in/newsletter/${issue.slug}`;
  const postRes = await fetch("https://connector-gateway.lovable.dev/linkedin/v2/ugcPosts", {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json", "X-Restli-Protocol-Version": "2.0.0" },
    body: JSON.stringify({
      author: `urn:li:person:${sub}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": { shareCommentary: { text }, shareMediaCategory: "NONE" },
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    }),
  });
  if (!postRes.ok) throw new Error(`ugcPosts ${postRes.status}: ${await postRes.text()}`);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("newsletter_issues").update({ linkedin_posted_at: new Date().toISOString() }).eq("id", issue.id);
}

export async function generateNewsletterJSON(topicHint?: string, cadenceLabel = "latest") {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY missing");
  const now = new Date();
  const monthYear = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const system = `You are Dibya R. Mishra, VP & Head of Engineering. Write a newsletter for a technical, senior audience. Voice: crisp, first-person, zero fluff. Cover Agentic AI, GenAI in Retail Supply Chains, Multi-Tenant SaaS, RAG systems, or Cloud Architecture. Return STRICT JSON: title (<=90 chars), summary (<=180 chars), body_markdown (500-900 words, ## H2 + short paragraphs; may use "- " bullets), linkedin_post (900-1200 chars, plain text, 3-5 hashtags).`;
  const user = `Write the ${cadenceLabel} issue for ${monthYear}.${topicHint ? ` Focus: ${topicHint}.` : ""} Return JSON only.`;
  const parsed = await streamNewsletterJSON(apiKey, system, user);
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
  const emailList = Array.from(emails);
  const deliveries = await mapWithConcurrency(emailList, 5, async (email) =>
    enqueueRenderedTemplate({
        templateName: "newsletter-issue",
        recipientEmail: email,
        templateData: {
          title: draft.title,
          summary: draft.summary,
          bodyMarkdown: draft.body_markdown,
          slug: issue.slug,
        },
        idempotencyKey: `newsletter-${issue.id}-${email}`,
      }),
  );
  deliveries.forEach((delivery, index) => {
    const email = emailList[index];
    if (delivery.status === "fulfilled") {
      if (delivery.value.queued) {
        queued++;
        if (runId) recipientRows.push({ run_id: runId, email, status: "queued", error_message: null });
      } else {
        errors++;
        if (runId) recipientRows.push({ run_id: runId, email, status: "failed", error_message: delivery.value.reason ?? "not queued" });
      }
    } else {
      console.error("newsletter send failed", delivery.reason);
      errors++;
      if (runId)
        recipientRows.push({
          run_id: runId,
          email,
          status: "failed",
          error_message: delivery.reason instanceof Error ? delivery.reason.message : String(delivery.reason),
        });
    }
  });

  if (runId && recipientRows.length > 0) {
    // Chunk inserts to stay within row-size limits.
    for (let i = 0; i < recipientRows.length; i += 500) {
      await supabaseAdmin.from("newsletter_send_recipients").insert(recipientRows.slice(i, i + 500));
    }
  }

  let linkedInPosted = false;
  let linkedInError: string | null = null;
  try {
    await postIssueToLinkedIn({ id: issue.id, slug: issue.slug, linkedin_post: draft.linkedin_post });
    linkedInPosted = true;
  } catch (e) {
    linkedInError = e instanceof Error ? e.message : String(e);
    console.error("LinkedIn auto-post failed", linkedInError);
  }

  await finishRun({
    status: "completed",
    error_message: linkedInError ? `LinkedIn: ${linkedInError}`.slice(0, 500) : null,
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
    linkedInPosted,
    linkedInError,
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
