import { describe, expect, it } from "vitest";
import { TOUR_CUES, cueAt } from "@/lib/video-captions";
describe("cues", () => {
  it("returns cue for mid-video time", () => {
    const c = cueAt(TOUR_CUES, 11.5);
    expect(c).toBeTruthy();
    expect(c!.start).toBeLessThanOrEqual(11.5);
    expect(c!.end).toBeGreaterThan(11.5);
  });
  it("is ordered and non-overlapping", () => {
    for (let i = 1; i < TOUR_CUES.length; i++) {
      expect(TOUR_CUES[i].start).toBeGreaterThanOrEqual(TOUR_CUES[i - 1].end - 0.001);
    }
  });
  it("returns null past the end", () => {
    expect(cueAt(TOUR_CUES, 99999)).toBeNull();
  });
});
