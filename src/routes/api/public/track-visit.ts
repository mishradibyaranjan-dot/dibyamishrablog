import { createFileRoute } from "@tanstack/react-router";

function parseUA(ua: string) {
  const s = ua || "";
  let device = "desktop";
  if (/Tablet|iPad/i.test(s)) device = "tablet";
  else if (/Mobile|Android|iPhone|iPod/i.test(s)) device = "mobile";
  let os = "unknown";
  if (/Windows/i.test(s)) os = "Windows";
  else if (/Mac OS X|Macintosh/i.test(s)) os = "macOS";
  else if (/Android/i.test(s)) os = "Android";
  else if (/iPhone|iPad|iOS/i.test(s)) os = "iOS";
  else if (/Linux/i.test(s)) os = "Linux";
  let browser = "unknown";
  if (/Edg\//i.test(s)) browser = "Edge";
  else if (/OPR\/|Opera/i.test(s)) browser = "Opera";
  else if (/Chrome\//i.test(s) && !/Chromium/i.test(s)) browser = "Chrome";
  else if (/Firefox\//i.test(s)) browser = "Firefox";
  else if (/Safari\//i.test(s)) browser = "Safari";
  return { device, os, browser };
}

async function sha256Hex(input: string) {
  const buf = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type AuditRow = {
  outcome: "accepted" | "rejected" | "error";
  reason?: string | null;
  visitor_id?: string | null;
  session_id?: string | null;
  user_id?: string | null;
  identified?: boolean;
  path?: string | null;
  ip_hash?: string | null;
  country?: string | null;
  user_agent?: string | null;
  duration_ms?: number | null;
  error_message?: string | null;
  metadata?: Record<string, unknown>;
};

// Audit logging must never break tracking: failures are swallowed and logged.
async function writeAudit(row: AuditRow) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("visitor_tracking_audit").insert({
      outcome: row.outcome,
      reason: row.reason ?? null,
      visitor_id: row.visitor_id ?? null,
      session_id: row.session_id ?? null,
      user_id: row.user_id ?? null,
      identified: row.identified ?? false,
      path: row.path ?? null,
      ip_hash: row.ip_hash ?? null,
      country: row.country ?? null,
      user_agent: (row.user_agent ?? "").slice(0, 500) || null,
      duration_ms: row.duration_ms ?? null,
      error_message: row.error_message ? String(row.error_message).slice(0, 1000) : null,
      metadata: row.metadata ?? {},
    });
    if (error) console.error("[track-visit:audit]", error.message);
  } catch (e) {
    console.error("[track-visit:audit]", e);
  }
}

export const Route = createFileRoute("/api/public/track-visit")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        const startedAt = Date.now();
        const audit: AuditRow = { outcome: "error" };
        try {
          const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
          const h = request.headers;
          const ip =
            h.get("cf-connecting-ip") ||
            h.get("x-real-ip") ||
            (h.get("x-forwarded-for") || "").split(",")[0].trim() ||
            null;
          const country = h.get("cf-ipcountry") || h.get("x-vercel-ip-country") || null;
          const city = h.get("cf-ipcity") || h.get("x-vercel-ip-city") || null;
          const region = h.get("cf-region") || h.get("x-vercel-ip-country-region") || null;
          const ua = (body.userAgent as string) || h.get("user-agent") || "";
          const parsed = parseUA(ua);
          const ipHash = ip ? await sha256Hex(ip + "|v1") : null;
          audit.ip_hash = ipHash;
          audit.country = country;
          audit.user_agent = ua;
          audit.path = (body.path as string) ?? null;
          audit.session_id = (body.sessionId as string) ?? null;

          const visitorId = String(body.visitorId || "").slice(0, 128);
          audit.visitor_id = visitorId || null;
          if (!visitorId) {
            await writeAudit({ ...audit, outcome: "rejected", reason: "missing_visitor_id", duration_ms: Date.now() - startedAt });
            return new Response(JSON.stringify({ ok: false, error: "missing visitorId" }), { status: 400, headers: { "Content-Type": "application/json", ...CORS } });
          }

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          // SECURITY: Never trust client-supplied userId. Only accept a user
          // identity when the caller presents a valid Supabase JWT that we can
          // verify server-side. Anonymous visitors are stored without a user_id.
          let verifiedUserId: string | null = null;
          const authHeader = h.get("authorization") || h.get("Authorization");
          const bearer = authHeader?.toLowerCase().startsWith("bearer ")
            ? authHeader.slice(7).trim()
            : null;
          if (bearer) {
            const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(bearer);
            if (!userErr && userData?.user?.id) {
              verifiedUserId = userData.user.id;
            } else if (userErr) {
              audit.metadata = { ...(audit.metadata ?? {}), bearer_rejected: true };
            }
          }
          audit.user_id = verifiedUserId;
          audit.identified = Boolean(verifiedUserId);
          if (body.userId && body.userId !== verifiedUserId) {
            audit.metadata = { ...(audit.metadata ?? {}), client_user_id_ignored: true };
          }

          const row = {
            visitor_id: visitorId,
            session_id: (body.sessionId as string) ?? null,
            user_id: verifiedUserId,
            ip,
            ip_hash: ipHash,
            user_agent: ua,
            path: (body.path as string) ?? null,
            referrer: (body.referrer as string) ?? null,
            country,
            region,
            city,
            device: parsed.device,
            browser: parsed.browser,
            os: parsed.os,
            language: (body.language as string) ?? null,
            timezone: (body.timezone as string) ?? null,
            screen: (body.screen as string) ?? null,
            utm_source: (body.utm_source as string) ?? null,
            utm_medium: (body.utm_medium as string) ?? null,
            utm_campaign: (body.utm_campaign as string) ?? null,
            utm_term: (body.utm_term as string) ?? null,
            utm_content: (body.utm_content as string) ?? null,
          };

          const { error: logErr } = await supabaseAdmin.from("visitor_logs").insert(row);
          if (logErr) {
            await writeAudit({
              ...audit,
              outcome: "error",
              reason: "visitor_logs_insert_failed",
              error_message: logErr.message,
              duration_ms: Date.now() - startedAt,
            });
            return new Response(JSON.stringify({ ok: false }), {
              status: 200,
              headers: { "Content-Type": "application/json", ...CORS },
            });
          }

          // Upsert aggregated visitor
          const { data: existing } = await supabaseAdmin
            .from("visitors")
            .select("visitor_id, total_visits, total_pageviews, first_seen_at, identified_at, user_id")
            .eq("visitor_id", visitorId)
            .maybeSingle();

          const now = new Date().toISOString();
          let email: string | null = null;
          let displayName: string | null = null;
          if (row.user_id) {
            const { data: prof } = await supabaseAdmin
              .from("profiles")
              .select("email, display_name")
              .eq("id", row.user_id)
              .maybeSingle();
            email = prof?.email ?? null;
            displayName = prof?.display_name ?? null;
          }

          if (!existing) {
            await supabaseAdmin.from("visitors").insert({
              visitor_id: visitorId,
              user_id: row.user_id,
              email,
              display_name: displayName,
              first_ip: ip,
              last_ip: ip,
              first_country: country,
              last_country: country,
              last_city: city,
              first_referrer: row.referrer,
              first_utm_source: row.utm_source,
              first_utm_medium: row.utm_medium,
              first_utm_campaign: row.utm_campaign,
              user_agent: ua,
              device: parsed.device,
              browser: parsed.browser,
              os: parsed.os,
              total_visits: 1,
              total_pageviews: 1,
              first_seen_at: now,
              last_seen_at: now,
              identified_at: row.user_id ? now : null,
            });
          } else {
            await supabaseAdmin
              .from("visitors")
              .update({
                last_seen_at: now,
                last_ip: ip,
                last_country: country,
                last_city: city,
                total_pageviews: (existing.total_pageviews ?? 0) + 1,
                total_visits:
                  (existing.total_visits ?? 0) +
                  (body.isNewSession ? 1 : 0),
                user_id: row.user_id ?? existing.user_id,
                email: email ?? undefined,
                display_name: displayName ?? undefined,
                identified_at:
                  existing.identified_at ??
                  (row.user_id ? now : null),
              })
              .eq("visitor_id", visitorId);
          }

          await writeAudit({
            ...audit,
            outcome: "accepted",
            reason: existing ? "visitor_updated" : "visitor_created",
            duration_ms: Date.now() - startedAt,
          });

          return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { "Content-Type": "application/json", ...CORS },
          });
        } catch (err) {
          console.error("[track-visit]", err);
          await writeAudit({
            ...audit,
            outcome: "error",
            reason: "unhandled_exception",
            error_message: err instanceof Error ? err.message : String(err),
            duration_ms: Date.now() - startedAt,
          });
          return new Response(JSON.stringify({ ok: false }), {
            status: 200,
            headers: { "Content-Type": "application/json", ...CORS },
          });
        }
      },
    },
  },
});
