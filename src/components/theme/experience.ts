export const FUTURE_THEMES = [
  { id: 'future-v2', label: 'Future Experience 2.0', mode: 'light', swatches: ['#3859E9', '#7356E8', '#14B8D4'] },
  { id: 'original', label: 'Original Theme', mode: 'light', swatches: ['#2684FF', '#8CC8FF', '#EAF4FF'] },
  { id: 'future', label: 'Future Experience', mode: 'light', swatches: ['#2458C6', '#087D87', '#F7F9FC'] },
  { id: 'future-light', label: 'Future Light', mode: 'light', swatches: ['#2458C6', '#087D87', '#FFFFFF'] },
  { id: 'future-dark', label: 'Future Dark', mode: 'dark', swatches: ['#83B9FF', '#63D6C9', '#101722'] },
  { id: 'comfort', label: 'Comfort Reading', mode: 'light', swatches: ['#234D76', '#28675F', '#FAFAF9'] },
  { id: 'system', label: 'System appearance', mode: 'light', swatches: ['#2458C6', '#83B9FF', '#F7F9FC'] },
] as const;
export type Density = 'compact' | 'comfortable';
export const DEFAULT_EXPERIENCE = 'future-v2';
export function initialExperience(saved: string | null) {
  const known = [...FUTURE_THEMES.map(t => t.id), 'glacier', 'cinematic', 'midnight', 'aurora', 'sunset', 'noir', 'emerald', 'light', 'paper', 'sand', 'arctic'];
  return saved && known.includes(saved) ? saved : DEFAULT_EXPERIENCE;
}
export function readDensity(value: string | null): Density { return value === 'compact' ? 'compact' : 'comfortable'; }
/** Every palette now renders the redesigned layout; saved themes change colours only. */
export function isFutureTheme(_theme: string) { return true; }
/** Bumping this once clears pre-redesign saved palettes so returning visitors see the new default. */
export const DESIGN_VERSION = '3';
export function resolveAppearance(theme: string, darkSystem: boolean) {
  const resolved = theme === 'system' ? (darkSystem ? 'future-dark' : 'future-light') : theme;
  return { theme: resolved, future: isFutureTheme(theme) };
}