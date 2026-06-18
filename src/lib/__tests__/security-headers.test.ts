import { describe, expect, it } from "vitest";

import {
  SECURITY_HEADERS,
  applySecurityHeaders,
  findHeaderMisconfigurations,
} from "../security-headers";

describe("SECURITY_HEADERS configuration", () => {
  it("has zero misconfigurations", () => {
    expect(findHeaderMisconfigurations()).toEqual([]);
  });

  it("sets a strict CSP", () => {
    const csp = SECURITY_HEADERS["Content-Security-Policy"];
    expect(csp).toMatch(/default-src 'self'/);
    expect(csp).toMatch(/frame-ancestors 'none'/);
    expect(csp).toMatch(/object-src 'none'/);
    expect(csp).not.toMatch(/script-src[^;]*\*/);
  });

  it("sets HSTS with >= 1 year and includeSubDomains", () => {
    const hsts = SECURITY_HEADERS["Strict-Transport-Security"];
    const maxAge = Number(/max-age=(\d+)/.exec(hsts)?.[1] ?? 0);
    expect(maxAge).toBeGreaterThanOrEqual(31536000);
    expect(hsts).toMatch(/includeSubDomains/);
  });

  it("denies framing and disables MIME sniffing", () => {
    expect(SECURITY_HEADERS["X-Frame-Options"]).toBe("DENY");
    expect(SECURITY_HEADERS["X-Content-Type-Options"]).toBe("nosniff");
  });
});

describe("applySecurityHeaders", () => {
  it("attaches every security header to a plain response", () => {
    const out = applySecurityHeaders(new Response("ok"));
    for (const name of Object.keys(SECURITY_HEADERS)) {
      expect(out.headers.get(name)).toBe(SECURITY_HEADERS[name]);
    }
  });

  it("preserves the original status, body, and content-type", async () => {
    const original = new Response(JSON.stringify({ ok: true }), {
      status: 201,
      headers: { "content-type": "application/json" },
    });
    const out = applySecurityHeaders(original);
    expect(out.status).toBe(201);
    expect(out.headers.get("content-type")).toBe("application/json");
    expect(await out.json()).toEqual({ ok: true });
  });

  it("does not overwrite a header the handler already set", () => {
    const original = new Response("ok", {
      headers: { "X-Frame-Options": "SAMEORIGIN" },
    });
    const out = applySecurityHeaders(original);
    expect(out.headers.get("X-Frame-Options")).toBe("SAMEORIGIN");
  });
});

describe("findHeaderMisconfigurations", () => {
  const valid = { ...SECURITY_HEADERS } as Record<string, string>;

  it("flags missing CSP", () => {
    const { ["Content-Security-Policy"]: _omit, ...rest } = valid;
    expect(findHeaderMisconfigurations(rest)).toContain(
      "Content-Security-Policy is missing",
    );
  });

  it("flags 'unsafe-eval' in CSP", () => {
    const bad = { ...valid, "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-eval'; object-src 'none'; frame-ancestors 'none'" };
    expect(findHeaderMisconfigurations(bad)).toContain(
      "CSP must not allow 'unsafe-eval'",
    );
  });

  it("flags weak HSTS max-age", () => {
    const bad = { ...valid, "Strict-Transport-Security": "max-age=3600; includeSubDomains" };
    expect(findHeaderMisconfigurations(bad)).toContain(
      "HSTS max-age must be at least 31536000 (1 year)",
    );
  });

  it("flags X-Frame-Options=ALLOWALL", () => {
    const bad = { ...valid, "X-Frame-Options": "ALLOWALL" };
    expect(findHeaderMisconfigurations(bad)).toContain(
      "X-Frame-Options must be DENY or SAMEORIGIN",
    );
  });

  it("flags missing nosniff", () => {
    const bad = { ...valid, "X-Content-Type-Options": "" };
    expect(findHeaderMisconfigurations(bad)).toContain(
      "X-Content-Type-Options must be 'nosniff'",
    );
  });
});
