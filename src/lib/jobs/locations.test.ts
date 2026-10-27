import { describe, expect, it } from "vitest";
import { nearestLocation, rankLocations } from "./locations";

describe("job locations", () => {
  it("ranks places by number of jobs", () => {
    const r = rankLocations(["London", "Bengaluru", "London, UK", "Hybrid", null]);
    expect(r[0]).toEqual({ name: "London", count: 2 });
    expect(r.map((l) => l.name)).not.toContain("Hybrid");
  });
  it("picks an Indian city for an India time zone", () => {
    expect(nearestLocation("Asia/Kolkata", rankLocations(["London", "Bengaluru"]))).toBe("Bengaluru");
  });
});
