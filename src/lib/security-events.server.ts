// Server-only helpers for security event logging, IP blocking, and alerts.
// Not client-safe: uses the Supabase admin client.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type Severity = "low" | "medium" | "critical";

export interface RecordEventInput {
  severity: Severity;
  eventType: string;
  ip?: string | null;
  userAgent?: string | null;
  targetPath?: string | null;
  userId?: string | null;
  userEmail?: string | null;
  actionTaken?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Extract best-effort client IP from a Cloudflare / edge request.
 */
export function getClientIp(request: Request): string | null {
  const h = request.headers;
  const cf = h.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const xr = h.get("x-real-ip");
  if (xr) return xr.trim();
  return null;
}

// Common scanner / bot probe paths. If the app receives any of these, the
// caller is not a legitimate user of a React/Vite site.
export const SCANNER_PATH_PATTERNS = [
  /^\/wp-(login|admin|content|includes|json)/i,
  /^\/xmlrpc\.php/i,
  /^\/\.env/i,
  /^\/\.git\//i,
  /^\/config\.(php|json|yml)$/i,
  /^\/phpmyadmin/i,
  /^\/(administrator|admin\.php)/i,
  /^\/vendor\/phpunit/i,
  /^\/actuator(\/|$)/i,
  /^\/server-status/i,
  /^\/backup\.(zip|sql|tar|gz)$/i,
  /\.(bak|old|orig|swp)$/i,
];

export function isScannerPath(pathname: string): boolean {
  return SCANNER_PATH_PATTERNS.some((r) => r.test(pathname));
}

export async function recordSecurityEvent(input: RecordEventInput): Promise<void> {
  try {
    await supabaseAdmin.from("security_events").insert({
      severity: input.severity,
      event_type: input.eventType,
      ip_address: input.ip ?? null,
      user_agent: input.userAgent ?? null,
      target_path: input.targetPath ?? null,
      user_id: input.userId ?? null,
      user_email: input.userEmail ?? null,
      action_taken: input.actionTaken ?? null,
      metadata: (input.metadata ?? {}) as never,
    });
  } catch (err) {
    console.error("recordSecurityEvent failed", err);
  }
}

/**
 * Block an IP for `minutes` (null = permanent). Idempotent by IP.
 */
export async function blockIp(params: {
  ip: string;
  reason: string;
  severity: Severity;
  minutes?: number | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const expires_at =
      params.minutes == null ? null : new Date(Date.now() + params.minutes * 60_000).toISOString();
    await supabaseAdmin
      .from("ip_blocks")
      .upsert(
        {
          ip_address: params.ip,
          reason: params.reason,
          severity: params.severity,
          metadata: (params.metadata ?? {}) as never,
          expires_at,
        },
        { onConflict: "ip_address" },
      );
  } catch (err) {
    console.error("blockIp failed", err);
  }
}

// tiny in-memory blocklist cache (per Worker instance) so we don't hit the DB
// on every request. Auto-expires every 60s.
let cache: { ips: Set<string>; loadedAt: number } | null = null;
const CACHE_TTL_MS = 60_000;

async function loadBlocklist(): Promise<Set<string>> {
  const now = Date.now();
  if (cache && now - cache.loadedAt < CACHE_TTL_MS) return cache.ips;
  try {
    const { data } = await supabaseAdmin
      .from("ip_blocks")
      .select("ip_address, expires_at")
      .limit(1000);
    const ips = new Set<string>();
    for (const row of data ?? []) {
      if (!row.expires_at || new Date(row.expires_at as string).getTime() > now) {
        ips.add(row.ip_address as string);
      }
    }
    cache = { ips, loadedAt: now };
    return ips;
  } catch {
    return cache?.ips ?? new Set<string>();
  }
}

export async function isIpBlocked(ip: string | null | undefined): Promise<boolean> {
  if (!ip) return false;
  const set = await loadBlocklist();
  return set.has(ip);
}

export function invalidateBlocklistCache(): void {
  cache = null;
}

/**
 * Failed-login evaluator: after N failures in a window, block the IP + alert.
 */
export async function evaluateFailedLogin(params: {
  ip: string | null;
  email: string;
  userAgent: string | null;
  reason: string;
}): Promise<void> {
  await recordSecurityEvent({
    severity: "low",
    eventType: "failed_login",
    ip: params.ip,
    userAgent: params.userAgent,
    userEmail: params.email,
    actionTaken: null,
    metadata: { reason: params.reason },
  });

  if (!params.ip) return;
  try {
    const { data: count } = await supabaseAdmin.rpc("count_recent_failed_logins", {
      _ip: params.ip,
      _minutes: 15,
    });
    if (typeof count === "number" && count >= 5) {
      await blockIp({
        ip: params.ip,
        reason: `Brute-force: ${count} failed logins in 15m`,
        severity: "critical",
        minutes: 60,
        metadata: { email: params.email },
      });
      invalidateBlocklistCache();
      await recordSecurityEvent({
        severity: "critical",
        eventType: "brute_force_block",
        ip: params.ip,
        userAgent: params.userAgent,
        userEmail: params.email,
        actionTaken: "ip_blocked_60m",
      });
      await sendCriticalAlert({
        type: "brute_force_attempt",
        ip: params.ip,
        target: "/auth (sign-in)",
        user: params.email,
        actionTaken: "ip_blocked_60m",
        metadata: { failures_15m: count },
      });
    }
  } catch (err) {
    console.error("evaluateFailedLogin failed", err);
  }
}

// ---------- Critical email alert ----------

const OWNER_EMAILS = ["mishra.dibyaranjan@gmail.com", "contactme@dibyamishra.co.in"];
const SITE_NAME = "dibyamishrablog";
const SENDER_DOMAIN = "notify.dibyamishra.co.in";
const FROM_DOMAIN = "notify.dibyamishra.co.in";

export interface AlertPayload {
  type: string;
  ip?: string | null;
  target?: string | null;
  user?: string | null;
  actionTaken?: string | null;
  metadata?: Record<string, unknown>;
}

// simple in-memory dedupe so we don't email on every event during a burst
const recentAlerts = new Map<string, number>();
const ALERT_DEDUPE_MS = 10 * 60_000;

export async function sendCriticalAlert(payload: AlertPayload): Promise<void> {
  const key = `${payload.type}::${payload.ip ?? ""}::${payload.user ?? ""}`;
  const now = Date.now();
  const last = recentAlerts.get(key) ?? 0;
  if (now - last < ALERT_DEDUPE_MS) return;
  recentAlerts.set(key, now);

  try {
    const [React, { render }, { template }, { sendLovableEmail }] = await Promise.all([
      import("react"),
      import("@react-email/render"),
      import("@/lib/email-templates/security-alert"),
      import("@lovable.dev/email-js"),
    ]);
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return;
    const data = {
      severity: "critical" as const,
      type: payload.type,
      ip: payload.ip ?? null,
      target: payload.target ?? null,
      user: payload.user ?? null,
      actionTaken: payload.actionTaken ?? null,
      metadata: payload.metadata ?? {},
      timestamp: new Date().toISOString(),
    };
    const el = React.createElement(template.component, data);
    const html = await render(el);
    const text = await render(el, { plainText: true });
    const subject = `[Security] ${payload.type} from ${payload.ip ?? "unknown IP"}`;
    const messageId = crypto.randomUUID();
    for (const recipient of OWNER_EMAILS) {
    await sendLovableEmail(
      {
        to: recipient,
        from: `${SITE_NAME} <security@${FROM_DOMAIN}>`,
        sender_domain: SENDER_DOMAIN,
        subject,
        html,
        text,
        purpose: "transactional",
        label: "security-alert",
        idempotency_key: `security-alert-${key}-${Math.floor(now / ALERT_DEDUPE_MS)}-${recipient}`,
        message_id: messageId,
      },
      { apiKey, sendUrl: process.env.LOVABLE_SEND_URL },
    );
    }
  } catch (err) {
    console.error("sendCriticalAlert failed", err);
  }
}
