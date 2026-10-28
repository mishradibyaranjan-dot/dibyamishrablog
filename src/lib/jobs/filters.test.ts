import { describe, expect, it } from 'vitest';
import { jobFilters } from './jobs.functions';
import { parseJobSearch } from '@/components/jobs/jobs-head';

describe('requested publication windows', () => {
  it('defaults to seven days', () => expect(jobFilters.parse({}).hours).toBe(168));
  for (const hours of [24, 48, 72, 168]) {
    it(`accepts ${hours} hours in server filters and links`, () => {
      expect(jobFilters.parse({ hours }).hours).toBe(hours);
      expect(parseJobSearch({ hours: String(hours) }).hours ?? 168).toBe(hours);
    });
  }
  it('rejects windows longer than seven days', () => expect(jobFilters.safeParse({ hours: 192 }).success).toBe(false));
});