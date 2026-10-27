import { describe, it, expect } from "vitest";
import { parsePostedAt, isFresh, expiresAt, classifyLevel, checkApplyUrl, dedupeKey } from "@/lib/jobs/rules";

const now = new Date("2026-10-27T12:00:00Z");

describe("posting timestamps", () => {
  it("parses ISO with offset", () => expect(parsePostedAt("2026-10-27T10:00:00+05:30")?.toISOString()).toBe("2026-10-27T04:30:00.000Z"));
  it("parses epoch seconds and ms", () => {
    expect(parsePostedAt(1793001600)?.toISOString()).toBe(new Date(1793001600000).toISOString());
    expect(parsePostedAt(1793001600000)?.getTime()).toBe(1793001600000);
  });
  it("rejects missing timezone", () => expect(parsePostedAt("2026-10-27T10:00:00")).toBeNull());
  it("rejects date-only", () => expect(parsePostedAt("2026-10-27")).toBeNull());
  it("rejects unknown", () => { expect(parsePostedAt(null)).toBeNull(); expect(parsePostedAt("soon")).toBeNull(); });
});

describe("7-day freshness", () => {
  it("1 hour old is fresh", () => expect(isFresh(new Date(now.getTime() - 3600_000), now)).toBe(true));
  it("3 days old is fresh", () => expect(isFresh(new Date(now.getTime() - 3 * 86_400_000), now)).toBe(true));
  it("exactly 7 days old is not fresh", () => expect(isFresh(new Date(now.getTime() - 7 * 86_400_000), now)).toBe(false));
  it("7 days + 1s old is not fresh", () => expect(isFresh(new Date(now.getTime() - 7 * 86_400_000 - 1000), now)).toBe(false));
  it("future-dated is not fresh", () => expect(isFresh(new Date(now.getTime() + 60_000), now)).toBe(false));
  it("expiry is the earlier of 7 days and closing time", () => {
    const p = new Date("2026-10-27T00:00:00Z");
    expect(expiresAt(p).toISOString()).toBe("2026-11-03T00:00:00.000Z");
    expect(expiresAt(p, new Date("2026-10-28T06:00:00Z")).toISOString()).toBe("2026-10-28T06:00:00.000Z");
  });
});

describe("seniority", () => {
  it("VP", () => expect(classifyLevel("Vice President, Engineering")).toBe("Vice President"));
  it("SVP before VP", () => expect(classifyLevel("Senior Vice President of Sales")).toBe("Senior Vice President"));
  it("Country head", () => expect(classifyLevel("Country Head - India")).toBe("Country Head / Managing Director"));
  it("product manager is not people manager", () => expect(classifyLevel("Product Manager")).toBe("Intermediate"));
  it("intern", () => expect(classifyLevel("Software Engineering Intern")).toBe("Intern"));
  it("unknown stays unclassified", () => expect(classifyLevel("Barista")).toBe("unclassified"));
});

describe("apply links", () => {
  it("accepts https employer URL", () => expect(checkApplyUrl("https://stripe.com/jobs/1").ok).toBe(true));
  it("rejects http", () => expect(checkApplyUrl("http://x.com").ok).toBe(false));
  it("rejects internal metadata host", () => expect(checkApplyUrl("https://169.254.169.254/latest").ok).toBe(false));
  it("rejects messaging shorteners", () => expect(checkApplyUrl("https://wa.me/123").ok).toBe(false));
  it("rejects payment pages", () => expect(checkApplyUrl("https://jobs.example.com/registration-fee").ok).toBe(false));
});

it("duplicates across providers share a key", () =>
  expect(dedupeKey("Stripe", "Software Engineer, Payments", "Bengaluru")).toBe(dedupeKey("stripe", "Software Engineer - Payments", "bengaluru")));
