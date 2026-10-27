import { describe, expect, it } from "vitest";
import { countryOf } from "./sync.server";
import { approvedDestination } from "./verification";

describe("India location matching", () => {
  it("recognises Indian states, old city names and NCR", () => {
    expect(countryOf("Patna, Bihar")).toBe("India");
    expect(countryOf("Bangalore, Karnataka")).toBe("India");
    expect(countryOf("Delhi-NCR")).toBe("India");
    expect(countryOf("Gurgaon")).toBe("India");
  });
  it("does not treat Indonesia as India", () => {
    expect(countryOf("Jakarta, Indonesia")).toBe("Indonesia");
  });
});

describe("Adzuna link approval", () => {
  it("accepts only Adzuna landing links", () => {
    const ok = "https://www.adzuna.in/land/ad/12345?se=x";
    expect(approvedDestination(ok, "adzuna", "in", ok)).toBe(true);
    const bad = "https://evil.example.com/land/ad/1";
    expect(approvedDestination(bad, "adzuna", "in", bad)).toBe(false);
  });
});
