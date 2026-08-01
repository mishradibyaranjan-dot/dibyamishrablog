// Server-only helpers for visitor tracking audit analytics, retention and alerts.
// Not client-safe: uses the Supabase admin client.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface AuditSettings {
  retention_days: number;
  alerts_enabled: boolean;
  alert_window_minutes: number;
  alert_min_events: number;
  alert_failure_pct: number;
  alert_email_enabled: boolean;
  alert_slack_enabled: boolean;
  last_alert_at: string | null;
}

const DEFAULTS: AuditSettings = {
  retention_days: 30,
  alerts_enabled: true,
  alert_window_minutes: 60,
  alert_min_events: 20,
  alert_failure_pct: 30,
  alert_email_enabled: true,
  alert_slack_enabled: false,
  last_alert_at: null,
};

export async function loadSettings(): Promise<AuditSettings> {
  const { data } = await supabaseAdmin
    .from("visitor_audit_settings")
    .select(
      "retention_days, alerts_enabled, alert_window_minutes, alert_min_events, alert_failure_pct, alert_email_enabled, alert_slack_enabled, last_alert_at",
    )
    .eq("id", 1)
    .maybeSingle();
  return { ...DEFAULTS, ...(data ?? {}) } as AuditSettings;
}


export function percentile(sorted: number[], p: number): number | null {
  if (sorted.length === 0) return null;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx] ?? null;
}

type AuditRow = {
  outcome: string;
  reason: string | null;
  path: string | null;
  country: string | null;
  ip_hash: string | null;
  visitor_id: string | null;
  identified: boolean;
  duration_ms: number | null;
  created_at: string;
};

/** Aggregate audit rows for the admin analytics dashboard. */
export async function buildAnalytics(days: number) {
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  const rows: AuditRow[] = [];
  const PAGE = 1000;
  for (let page = 0; page < 20; page++) {
    const { data, error } = await supabaseAdmin
      .from("visitor_tracking_audit")
      .select("outcome, reason, path, country, ip_hash, visitor_id, identified, duration_ms, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .range(page * PAGE, page * PAGE + PAGE - 1);
    if (error) throw error;
    const batch = (data ?? []) as AuditRow[];
    rows.push(...batch);
    if (batch.length < PAGE) break;
  }

  const totals = { accepted: 0, rejected: 0, error: 0 };
  const byDay = new Map<string, { day: string; accepted: number; rejected: number; error: number }>();
  const paths = new Map<string, number>();
  const countries = new Map<string, number>();
  const reasons = new Map<string, number>();
  const ips = new Map<string, number>();
  const latencies: number[] = [];
  let identified = 0;

  for (const r of rows) {
    const key = (r.outcome === "accepted" || r.outcome === "rejected" || r.outcome === "error"
      ? r.outcome
      : "error") as keyof typeof totals;
    totals[key] += 1;
    const day = r.created_at.slice(0, 10);
    const bucket = byDay.get(day) ?? { day, accepted: 0, rejected: 0, error: 0 };
    bucket[key] += 1;
    byDay.set(day, bucket);
    if (r.path) paths.set(r.path, (paths.get(r.path) ?? 0) + 1);
    if (r.country) countries.set(r.country, (countries.get(r.country) ?? 0) + 1);
    if (r.reason && key !== "accepted") reasons.set(r.reason, (reasons.get(r.reason) ?? 0) + 1);
    if (r.ip_hash) ips.set(r.ip_hash, (ips.get(r.ip_hash) ?? 0) + 1);
    if (typeof r.duration_ms === "number") latencies.push(r.duration_ms);
    if (r.identified) identified += 1;
  }

  latencies.sort((a, b) => a - b);
  const top = (m: Map<string, number>, n = 10) =>
    [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([label, count]) => ({ label, count }));

  const total = rows.length;
  return {
    windowDays: days,
    totals,
    total,
    identified,
    failureRate: total ? Math.round(((totals.rejected + totals.error) / total) * 1000) / 10 : 0,
    series: [...byDay.values()].sort((a, b) => a.day.localeCompare(b.day)),
    topPaths: top(paths),
    topCountries: top(countries),
    topReasons: top(reasons),
    topIpHashes: top(ips, 8),
    latency: {
      count: latencies.length,
      p50: percentile(latencies, 50),
      p75: percentile(latencies, 75),
      p90: percentile(latencies, 90),
      p95: percentile(latencies, 95),
      p99: percentile(latencies, 99),
      max: latencies.length ? latencies[latencies.length - 1]! : null,
    },
  };
}

export interface SpikeResult {
  checked: boolean;
  alerted: boolean;
  reason?: string;
  stats?: Record<string, unknown>;
}

/**
 * Look at the recent alert window and email the owner when the rejected/error
 * rate spikes or one IP hash floods the tracking endpoint.
 */
export async function evaluateAuditSpike(): Promise<SpikeResult> {
  const s = await loadSettings();
  if (!s.alerts_enabled) return { checked: false, alerted: false, reason: "alerts_disabled" };

  const windowMs = Math.max(5, s.alert_window_minutes) * 60_000;
  const since = new Date(Date.now() - windowMs).toISOString();
  const { data, error } = await supabaseAdmin
    .from("visitor_tracking_audit")
    .select("outcome, reason, ip_hash, path")
    .gte("created_at", since)
    .limit(5000);
  if (error) throw error;
  const rows = (data ?? []) as { outcome: string; reason: string | null; ip_hash: string | null; path: string | null }[];

  const total = rows.length;
  if (total < Math.max(1, s.alert_min_events)) {
    return { checked: true, alerted: false, reason: "below_min_events", stats: { total } };
  }

  const failures = rows.filter((r) => r.outcome !== "accepted").length;
  const failurePct = Math.round((failures / total) * 100);

  const ipCounts = new Map<string, number>();
  for (const r of rows) if (r.ip_hash) ipCounts.set(r.ip_hash, (ipCounts.get(r.ip_hash) ?? 0) + 1);
  const [topIp, topIpCount] = [...ipCounts.entries()].sort((a, b) => b[1] - a[1])[0] ?? [null, 0];
  const floodShare = total ? Math.round(((topIpCount as number) / total) * 100) : 0;

  const problems: string[] = [];
  if (failurePct >= s.alert_failure_pct) problems.push(`failure_rate_${failurePct}pct`);
  if (floodShare >= 70 && (topIpCount as number) >= 100) problems.push(`single_ip_flood_${floodShare}pct`);

  if (problems.length === 0) {
    return { checked: true, alerted: false, reason: "healthy", stats: { total, failurePct, floodShare } };
  }

  // Rate-limit alerts to at most one per window.
  if (s.last_alert_at && Date.now() - new Date(s.last_alert_at).getTime() < windowMs) {
    return { checked: true, alerted: false, reason: "recently_alerted", stats: { total, failurePct } };
  }

  const reasonCounts = new Map<string, number>();
  for (const r of rows) if (r.outcome !== "accepted" && r.reason) reasonCounts.set(r.reason, (reasonCounts.get(r.reason) ?? 0) + 1);

  const { recordSecurityEvent, sendCriticalAlert } = await import("@/lib/security-events.server");
  const metadata = {
    window_minutes: s.alert_window_minutes,
    total_events: total,
    failures,
    failure_pct: failurePct,
    top_ip_hash: topIp,
    top_ip_events: topIpCount,
    top_ip_share_pct: floodShare,
    top_reasons: [...reasonCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5),
    problems,
  };

  await recordSecurityEvent({
    severity: "medium",
    eventType: "visitor_tracking_audit_spike",
    targetPath: "/api/public/track-visit",
    actionTaken: "owner_alerted",
    metadata,
  });
  await sendCriticalAlert({
    type: "visitor_tracking_audit_spike",
    target: "/api/public/track-visit",
    actionTaken: "Review /admin/visitor-audit",
    metadata,
  });

  await supabaseAdmin
    .from("visitor_audit_settings")
    .update({ last_alert_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", 1);

  return { checked: true, alerted: true, stats: metadata };
}

// ---------- Drill-down: focused slice of the audit log ----------

export interface DrilldownFilter {
  from?: string | null;
  to?: string | null;
  path?: string | null;
  country?: string | null;
  outcome?: "all" | "accepted" | "rejected" | "error";
  reason?: string | null;
  sampleLimit?: number;
}

/**
 * Aggregate a narrow slice (time window / path / country) and return the top
 * failure reasons plus sample events, for the admin drill-down panel.
 */
export async function buildDrilldown(f: DrilldownFilter) {
  const sampleLimit = Math.min(50, Math.max(5, f.sampleLimit ?? 20));
  const from = f.from ? new Date(f.from).toISOString() : new Date(Date.now() - 86_400_000).toISOString();
  const to = f.to ? new Date(f.to).toISOString() : new Date().toISOString();

  const base = () => {
    let q = supabaseAdmin
      .from("visitor_tracking_audit")
      .select(
        "id, outcome, reason, path, country, ip_hash, visitor_id, user_id, identified, duration_ms, error_message, user_agent, created_at",
      )
      .gte("created_at", from)
      .lte("created_at", to);
    if (f.path) q = q.eq("path", f.path);
    if (f.country) q = q.eq("country", f.country.toUpperCase());
    if (f.reason) q = q.eq("reason", f.reason);
    if (f.outcome && f.outcome !== "all") q = q.eq("outcome", f.outcome);
    return q;
  };

  type Row = AuditRow & {
    id: string;
    user_id: string | null;
    error_message: string | null;
    user_agent: string | null;
  };

  const rows: Row[] = [];
  const PAGE = 1000;
  for (let page = 0; page < 10; page++) {
    const { data, error } = await base()
      .order("created_at", { ascending: false })
      .range(page * PAGE, page * PAGE + PAGE - 1);
    if (error) throw error;
    const batch = (data ?? []) as Row[];
    rows.push(...batch);
    if (batch.length < PAGE) break;
  }

  const totals = { accepted: 0, rejected: 0, error: 0 };
  const reasons = new Map<string, number>();
  const paths = new Map<string, number>();
  const countries = new Map<string, number>();
  const ips = new Map<string, number>();
  const latencies: number[] = [];
  let identified = 0;

  for (const r of rows) {
    const key = (r.outcome === "accepted" || r.outcome === "rejected" ? r.outcome : "error") as keyof typeof totals;
    totals[key] += 1;
    if (r.reason && key !== "accepted") reasons.set(r.reason, (reasons.get(r.reason) ?? 0) + 1);
    if (r.path) paths.set(r.path, (paths.get(r.path) ?? 0) + 1);
    if (r.country) countries.set(r.country, (countries.get(r.country) ?? 0) + 1);
    if (r.ip_hash) ips.set(r.ip_hash, (ips.get(r.ip_hash) ?? 0) + 1);
    if (typeof r.duration_ms === "number") latencies.push(r.duration_ms);
    if (r.identified) identified += 1;
  }
  latencies.sort((a, b) => a - b);
  const top = (m: Map<string, number>, n = 8) =>
    [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([label, count]) => ({ label, count }));

  const total = rows.length;
  return {
    filter: { from, to, path: f.path ?? null, country: f.country ?? null, reason: f.reason ?? null, outcome: f.outcome ?? "all" },
    total,
    totals,
    identified,
    failureRate: total ? Math.round(((totals.rejected + totals.error) / total) * 1000) / 10 : 0,
    topReasons: top(reasons),
    topPaths: top(paths),
    topCountries: top(countries),
    topIpHashes: top(ips, 6),
    latency: {
      count: latencies.length,
      p50: percentile(latencies, 50),
      p90: percentile(latencies, 90),
      p99: percentile(latencies, 99),
    },
    samples: rows.slice(0, sampleLimit).map((r) => ({
      id: r.id,
      created_at: r.created_at,
      outcome: r.outcome,
      reason: r.reason,
      path: r.path,
      country: r.country,
      ip_hash: r.ip_hash,
      visitor_id: r.visitor_id,
      user_id: r.user_id,
      identified: r.identified,
      duration_ms: r.duration_ms,
      error_message: r.error_message,
      user_agent: r.user_agent ? r.user_agent.slice(0, 160) : null,
    })),
  };
}

// ---------- Slack webhook delivery ----------

/**
 * Post a spike/suspicious-pattern alert to a Slack incoming webhook.
 * Webhook URL comes from the SECURITY_ALERT_SLACK_WEBHOOK_URL secret.
 */
export async function sendSlackAlert(params: {
  title: string;
  summary: string;
  fields: { label: string; value: string }[];
  link?: string;
}): Promise<{ delivered: boolean; reason?: string }> {
  const url = process.env["SECURITY_ALERT_SLACK_WEBHOOK_URL"];
  if (!url) return { delivered: false, reason: "missing_webhook_url" };
  try {
    const lines = params.fields.map((f) => `• *${f.label}:* ${f.value}`).join("\n");
    const text = `:rotating_light: *${params.title}*\n${params.summary}\n${lines}${
      params.link ? `\n<${params.link}|Open admin dashboard>` : ""
    }`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`Slack alert failed [${res.status}]: ${body.slice(0, 300)}`);
      return { delivered: false, reason: `slack_${res.status}` };
    }
    return { delivered: true };
  } catch (err) {
    console.error("sendSlackAlert failed", err);
    return { delivered: false, reason: "slack_exception" };
  }
}
