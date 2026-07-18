import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Security middleware: block requests from IPs on the blocklist and reject
// obvious scanner/probe paths (wp-admin, .env, .git, phpmyadmin, etc.).
// Runs on the server for every request. Falls open on any DB error so a
// backend outage never takes the site down.
const securityMiddleware = createMiddleware().server(async ({ next, request }) => {
  try {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Skip static assets and internal RPC to keep hot paths fast.
    if (
      pathname.startsWith("/_serverFn") ||
      pathname.startsWith("/assets/") ||
      pathname.startsWith("/lovable/") ||
      pathname === "/favicon.ico" ||
      pathname === "/robots.txt" ||
      pathname === "/sitemap.xml"
    ) {
      return next();
    }

    const { getClientIp, isScannerPath, isIpBlocked, recordSecurityEvent, blockIp, invalidateBlocklistCache, sendCriticalAlert } =
      await import("@/lib/security-events.server");
    const ip = getClientIp(request);
    const ua = request.headers.get("user-agent");

    // 1. Immediate block for known active malicious IPs.
    if (ip && (await isIpBlocked(ip))) {
      void recordSecurityEvent({
        severity: "medium",
        eventType: "blocked_ip_request",
        ip,
        userAgent: ua,
        targetPath: pathname,
        actionTaken: "request_denied",
      });
      return new Response("Forbidden", { status: 403 });
    }

    // 2. Scanner / probe paths → block IP for 24h + critical alert.
    if (isScannerPath(pathname)) {
      if (ip) {
        await blockIp({
          ip,
          reason: `Scanner probe: ${pathname}`,
          severity: "critical",
          minutes: 24 * 60,
          metadata: { path: pathname, userAgent: ua },
        });
        invalidateBlocklistCache();
      }
      await recordSecurityEvent({
        severity: "critical",
        eventType: "scanner_probe",
        ip,
        userAgent: ua,
        targetPath: pathname,
        actionTaken: ip ? "ip_blocked_24h" : "logged_only",
      });
      void sendCriticalAlert({
        type: "scanner_probe",
        ip,
        target: pathname,
        user: null,
        actionTaken: ip ? "ip_blocked_24h" : "logged_only",
        metadata: { userAgent: ua },
      });
      return new Response("Not Found", { status: 404 });
    }
  } catch (err) {
    // Never break the site on a security-middleware bug.
    console.error("securityMiddleware error", err);
  }
  return next();
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [securityMiddleware, errorMiddleware],
}));
