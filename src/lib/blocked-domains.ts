// Blocklist for spam / disposable email domains.
// Add entries in lowercase. Subdomains are matched automatically.
export const BLOCKED_EMAIL_DOMAINS: ReadonlySet<string> = new Set([
  "luckfeed.com",
  // Common disposable / throwaway providers
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
]);

export function getEmailDomain(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at < 0 || at === trimmed.length - 1) return null;
  return trimmed.slice(at + 1);
}

export function isBlockedEmail(email: string): boolean {
  const domain = getEmailDomain(email);
  if (!domain) return false;
  if (BLOCKED_EMAIL_DOMAINS.has(domain)) return true;
  // Match subdomains: foo.luckfeed.com → blocked if luckfeed.com is blocked.
  for (const blocked of BLOCKED_EMAIL_DOMAINS) {
    if (domain.endsWith(`.${blocked}`)) return true;
  }
  return false;
}

export const BLOCKED_EMAIL_MESSAGE =
  "This email domain isn't allowed. Please use a different address.";
