import { describe, it, expect } from "vitest";
import { hasJobsAdminAccess } from "../jobs/access";
import { sourceDue, retryDelayMinutes } from "../jobs/scheduling";
import { validateClassification } from "../jobs/ai/schema";

describe("Jobs administrator MFA", () => {
  it("requires the admin role and aal2", () => {
    expect(hasJobsAdminAccess("admin", "aal2")).toBe(true);
    expect(hasJobsAdminAccess("admin", "aal1")).toBe(false);
    expect(hasJobsAdminAccess("user", "aal2")).toBe(false);
    expect(hasJobsAdminAccess(undefined, undefined)).toBe(false);
  });
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