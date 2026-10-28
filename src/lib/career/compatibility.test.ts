import { describe, expect, it } from 'vitest';
import { calculateCompatibility, COMPATIBILITY_WEIGHTS } from './compatibility';
import type { ResumeReview } from './schema';
const review: ResumeReview = { summary:'',sections:[],formatting:[],limitations:[],recommendations:[],requirements:[{requirement:'Python skill',jd_evidence:'Python skill',resume_evidence:'Python',assessment:'Clearly demonstrated',action:''}] };
describe('internal compatibility estimate', () => {
  for (const [key,weight] of Object.entries({skills:30,experience:25,achievements:15,formatting:15,keywords:10,completeness:5})) {
    it(`uses the approved ${key} weight`, () => expect(COMPATIBILITY_WEIGHTS[key as keyof typeof COMPATIBILITY_WEIGHTS]).toBe(weight));
  }
  it('excludes unverifiable original formatting', () => {
    const result = calculateCompatibility(review,'Python skill','Python');
    expect(result.factors.find(f => f.key === 'formatting')?.value).toBeNull();
    expect(result.assessedWeight).toBe(45);
    expect(result.score).toBe(78);
  });
  it('does not credit fabricated evidence', () => {
    const result = calculateCompatibility(review,'Python skill','Java only');
    expect(result.factors.find(f => f.key === 'skills')?.value).toBeNull();
    expect(result.score).toBe(0);
  });
});