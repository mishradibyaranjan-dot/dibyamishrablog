// Server-only helper used by public API routes to restrict cross-origin abuse.
export function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin") ?? request.headers.get("referer");
  if (!origin) return false;
  let host: string;
  try {
    host = new URL(origin).host;
  } catch {
    return false;
  }
  const selfHost = new URL(request.url).host;
  if (host === selfHost) return true;
  return (
    host.endsWith(".lovable.app") ||
    host.endsWith(".lovable.dev") ||
    host.endsWith(".lovableproject.com") ||
    host === "dibyamishrablog.lovable.app"
  );
}

export function corsHeadersFor(request: Request, methods = "POST, OPTIONS"): Record<string, string> {
  const origin = request.headers.get("origin");
  const allowed = origin && isAllowedOrigin(request) ? origin : "null";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Vary": "Origin",
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
