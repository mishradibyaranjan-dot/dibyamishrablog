// Spam / disposable email domain blocklist.
// The authoritative list lives in the `blocked_email_domains` DB table
// (enforced at the DB level via triggers on profiles and newsletter_subscribers).
// This module provides fast client/server-side pre-checks so users get an
// immediate error instead of a generic DB failure.
import { supabase } from "@/integrations/supabase/client";

// Baseline list — kept in code so validation still works if the DB is unreachable
// and so tests run without a network call. Add or remove entries via the DB
// table (`blocked_email_domains`) for runtime updates.
export const BASELINE_BLOCKED_DOMAINS: readonly string[] = [
  "luckfeed.com",
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.info",
  "sharklasers.com",
  "10minutemail.com",
  "10minutemail.net",
  "tempmail.com",
  "temp-mail.org",
  "tempmailo.com",
  "yopmail.com",
  "trashmail.com",
  "throwawaymail.com",
  "getnada.com",
  "dispostable.com",
  "maildrop.cc",
  "fakeinbox.com",
  "mintemail.com",
  "mohmal.com",
  "spam4.me",
  "mailnesia.com",
  "moakt.com",
  "emailondeck.com",
  "mytemp.email",
  "tempail.com",
  "dropmail.me",
  "mailpoof.com",
  "inboxbear.com",
];

let cache: Set<string> = new Set(BASELINE_BLOCKED_DOMAINS.map((d) => d.toLowerCase()));
let cacheLoadedAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

export function getEmailDomain(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at < 0 || at === trimmed.length - 1) return null;
  return trimmed.slice(at + 1);
}

function matchesSet(domain: string, set: Set<string>): boolean {
  if (set.has(domain)) return true;
  for (const blocked of set) {
    if (domain.endsWith(`.${blocked}`)) return true;
  }
  return false;
}

/** Synchronous check against the in-memory cache (baseline + last DB refresh). */
export function isBlockedEmail(email: string): boolean {
  const domain = getEmailDomain(email);
  if (!domain) return false;
  return matchesSet(domain, cache);
}

/** Refresh the client cache from the DB (safe to call opportunistically). */
export async function refreshBlockedDomains(force = false): Promise<void> {
  if (!force && Date.now() - cacheLoadedAt < CACHE_TTL_MS) return;
  try {
    const { data, error } = await supabase
      .from("blocked_email_domains")
      .select("domain");
    if (error || !data) return;
    const next = new Set<string>(BASELINE_BLOCKED_DOMAINS.map((d) => d.toLowerCase()));
    for (const row of data) {
      if (row.domain) next.add(String(row.domain).toLowerCase());
    }
    cache = next;
    cacheLoadedAt = Date.now();
  } catch {
    // Ignore — baseline list is still active.
  }
}

/**
 * Server-side authoritative check: consults the DB via a Supabase client.
 * Falls back to the baseline list on error.
 */
export async function isBlockedEmailServer(
  email: string,
  client: { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }> },
): Promise<boolean> {
  const domain = getEmailDomain(email);
  if (!domain) return false;
  try {
    const { data, error } = await client.rpc("is_blocked_email", { _email: email });
    if (!error && typeof data === "boolean") return data;
  } catch {
    // fall through
  }
  return matchesSet(domain, cache);
}

export const BLOCKED_EMAIL_MESSAGE =
  "This email domain isn't allowed. Please use a different address.";
