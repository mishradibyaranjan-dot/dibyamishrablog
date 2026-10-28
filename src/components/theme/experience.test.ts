import { describe, expect, it } from 'vitest';
import { FUTURE_THEMES, readDensity, resolveAppearance } from './experience';
describe('optional experience preferences', () => {
  it('offers all requested additions without reusing original theme IDs', () => {
    expect(FUTURE_THEMES.map(t => t.label)).toEqual(['Original Theme','Future Experience','Future Light','Future Dark','Comfort Reading','System appearance']);
  });
  it('keeps original appearance out of the future rollout', () => expect(resolveAppearance('glacier', true)).toEqual({ theme:'glacier',future:false }));
  it('follows dark system preference only when selected', () => expect(resolveAppearance('system', true).theme).toBe('future-dark'));
  it('follows light system preference only when selected', () => expect(resolveAppearance('system', false).theme).toBe('future-light'));
  it('preserves explicit light preference on dark systems', () => expect(resolveAppearance('future-light', true).theme).toBe('future-light'));
  it('defaults unknown density to comfortable', () => expect(readDensity('unexpected')).toBe('comfortable'));
  it('accepts compact density', () => expect(readDensity('compact')).toBe('compact'));
});