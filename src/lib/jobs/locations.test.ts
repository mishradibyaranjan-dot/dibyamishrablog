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

import { splitLocations as _split } from "./locations";
describe("splitLocations", () => {
  it("lists every India hub and keeps international places separate", () => {
    const r = _split([{ name: "London", count: 5 }, { name: "Bangalore", count: 2 }]);
    expect(r.india.some((l) => l.name === "Pune" && l.count === 0)).toBe(true);
    expect(r.india[0]).toEqual({ name: "Bangalore", count: 2 });
    expect(r.international).toEqual([{ name: "London", count: 5 }]);
  });
});
