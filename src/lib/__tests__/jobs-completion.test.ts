import { describe, it, expect } from "vitest";
import { hasJobsAdminAccess } from "../jobs/access";
import { sourceDue, retryDelayMinutes } from "../jobs/scheduling";
import { validateClassification } from "../jobs/ai/schema";
import { approvedDestination, safeSnapshot, canonicalApplication } from "../jobs/verification";
import { CATEGORY_RULES, checkApplyUrl } from "../jobs/rules";

describe("Jobs administrator MFA", () => {
  it("requires the admin role and aal2", () => {
    expect(hasJobsAdminAccess("admin", "aal2")).toBe(true);
    expect(hasJobsAdminAccess("admin", "aal1")).toBe(false);
    expect(hasJobsAdminAccess("user", "aal2")).toBe(false);
    expect(hasJobsAdminAccess(undefined, undefined)).toBe(false);
  });
});

describe("Source verification safety", () => {
  it("requires the configured employer board", () => {
    expect(approvedDestination("https://jobs.ashbyhq.com/openai/123", "ashby", "openai", "https://jobs.ashbyhq.com/openai/123")).toBe(true);
    expect(approvedDestination("https://jobs.ashbyhq.com/attacker/123", "ashby", "openai", "https://jobs.ashbyhq.com/openai/123")).toBe(false);
  });
  it("rejects arbitrary and internal redirect destinations", () => {
    expect(approvedDestination("https://evil.example/123", "ashby", "openai", "https://jobs.ashbyhq.com/openai/123")).toBe(false);
    expect(checkApplyUrl("https://[::ffff:127.0.0.1]/").ok).toBe(false);
    expect(checkApplyUrl("https://user:pass@jobs.ashbyhq.com/openai/123").ok).toBe(false);
  });
  it("does not close jobs from a suspiciously incomplete snapshot", () => {
    expect(safeSnapshot(100, 20)).toBe(false);
    expect(safeSnapshot(100, 100)).toBe(true);
  });
  it("canonicalizes tracking variants for duplicate detection", () => {
    expect(canonicalApplication("https://jobs.ashbyhq.com/openai/123?utm_source=x#apply")).toBe("https://jobs.ashbyhq.com/openai/123");
  });
});
it("supports all requested functional categories", () => {
  const names = CATEGORY_RULES.map(([name]) => name);
  for (const category of ["IT","Delivery Management","Technical Support","BFSI","Supply Chain","Logistics","Shipping","Retail","E-commerce","Consulting","Manufacturing","Healthcare","Education","General Management"]) expect(names).toContain(category);
});
describe("Configured polling", () => {
  it("honors a 30-minute source interval", () => {
    const start = "2026-10-27T10:00:00Z";
    expect(sourceDue(start, 30, Date.parse("2026-10-27T10:29:59Z"))).toBe(false);
    expect(sourceDue(start, 30, Date.parse("2026-10-27T10:30:00Z"))).toBe(true);
  });
  it("defaults to the requested 15-minute interval", () => {
    expect(sourceDue("2026-10-27T10:00:00Z", 15, Date.parse("2026-10-27T10:15:00Z"))).toBe(true);
  });
  it("backs off failed sources with a one-day maximum", () => {
    expect(retryDelayMinutes(1)).toBe(15);
    expect(retryDelayMinutes(2)).toBe(30);
    expect(retryDelayMinutes(10)).toBe(1440);
  });
});
describe("AI factual evidence", () => {
  it("rejects evidence absent from the employer text", () => {
    expect(() => validateClassification({ career_level: "Director", categories: ["Software Engineering"], skills: [], evidence: "lead 400 engineers" }, "Software Engineer")).toThrow();
  });
  it("retains only skills explicitly named by the employer", () => {
    expect(validateClassification({ career_level: "Senior Individual Contributor", categories: ["Software Engineering"], skills: ["Python", "AWS"], evidence: "Senior Engineer" }, "Senior Engineer using Python").skills).toEqual(["Python"]);
  });
});