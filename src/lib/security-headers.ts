/**
 * Centralized HTTP security headers.
 *
 * Applied to every outgoing response from src/server.ts. Tested in
 * src/lib/__tests__/security-headers.test.ts — update the tests in lockstep
 * with any change here so misconfigurations are caught in CI.
 */

export const SECURITY_HEADERS: Readonly<Record<string, string>> = Object.freeze({
  // Content Security Policy — covers script, style, image, font, connect, frame.
  // Inline styles + scripts are allowed because TanStack Start emits inline
  // hydration scripts and shadcn/Tailwind emit inline style attrs.
  // 'unsafe-eval' + cdn.gpteng.co are allowed for the Lovable preview/editor
  // overlay widget; these are no-ops on the published site.
  // frame-ancestors locked to 'none'.
  "Content-Security-Policy": [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.gpteng.co https://translate.google.com https://translate.googleapis.com https://translate-pa.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com",
    "font-src 'self' https://fonts.gstatic.com https://cdn.gpteng.co data:",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https: wss:",
    "media-src 'self' blob: data:",
    // All site video is self-hosted; no third-party video embeds are allowed.
    "frame-src 'self' https://translate.google.com",
    // pdf.js renders the inline Learn PDF reader in a same-origin/blob worker.
    "worker-src 'self' blob:",
    "upgrade-insecure-requests",
  ].join("; "),

  // 1 year, include subdomains, allow preload list inclusion.
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",

  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Cross-Origin-Opener-Policy": "same-origin",
});

/**
 * Apply security headers to a Response. Existing values are preserved
 * (handlers may opt into stricter values per-route).
 */
export function applySecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    if (!headers.has(name)) headers.set(name, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Validate the configured headers. Returns the list of misconfigurations;
 * empty array means the configuration is safe. Used by tests AND by the
 * runtime so a bad edit fails fast instead of shipping silently.
 */
export function findHeaderMisconfigurations(
  headers: Record<string, string> = SECURITY_HEADERS,
): string[] {
  const problems: string[] = [];
  const get = (name: string) =>
    headers[name] ?? headers[name.toLowerCase()] ?? "";

  const csp = get("Content-Security-Policy");
  if (!csp) {
    problems.push("Content-Security-Policy is missing");
  } else {
    // 'unsafe-eval' is intentionally permitted for the Lovable editor overlay.
    if (/script-src[^;]*\*/.test(csp))
      problems.push("CSP script-src must not use wildcard '*'");
    if (!/frame-ancestors\s+'none'/.test(csp))
      problems.push("CSP frame-ancestors must be 'none'");
    if (!/object-src\s+'none'/.test(csp))
      problems.push("CSP object-src must be 'none'");
    if (!/default-src\s+'self'/.test(csp))
      problems.push("CSP default-src must be 'self'");
  }

  const hsts = get("Strict-Transport-Security");
  if (!hsts) {
    problems.push("Strict-Transport-Security is missing");
  } else {
    const match = /max-age=(\d+)/.exec(hsts);
    const maxAge = match ? Number(match[1]) : 0;
    if (maxAge < 31536000)
      problems.push("HSTS max-age must be at least 31536000 (1 year)");
    if (!/includeSubDomains/i.test(hsts))
      problems.push("HSTS must include includeSubDomains");
  }

  const xfo = get("X-Frame-Options").toUpperCase();
  if (xfo !== "DENY" && xfo !== "SAMEORIGIN")
    problems.push("X-Frame-Options must be DENY or SAMEORIGIN");

  if (get("X-Content-Type-Options").toLowerCase() !== "nosniff")
    problems.push("X-Content-Type-Options must be 'nosniff'");

  if (!get("Referrer-Policy")) problems.push("Referrer-Policy is missing");
  if (!get("Permissions-Policy")) problems.push("Permissions-Policy is missing");

  return problems;
}

// Fail-fast at module load: a misconfigured header set should never ship.
const _bootProblems = findHeaderMisconfigurations();
if (_bootProblems.length > 0) {
  throw new Error(
    `Insecure SECURITY_HEADERS configuration:\n - ${_bootProblems.join("\n - ")}`,
  );
}
