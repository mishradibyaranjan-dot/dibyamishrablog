export const FUTURE_THEMES = [
  { id: 'original', label: 'Original Theme', mode: 'light', swatches: ['#2684FF', '#8CC8FF', '#EAF4FF'] },
  { id: 'future', label: 'Future Experience', mode: 'light', swatches: ['#2458C6', '#087D87', '#F7F9FC'] },
  { id: 'future-light', label: 'Future Light', mode: 'light', swatches: ['#2458C6', '#087D87', '#FFFFFF'] },
  { id: 'future-dark', label: 'Future Dark', mode: 'dark', swatches: ['#83B9FF', '#63D6C9', '#101722'] },
  { id: 'comfort', label: 'Comfort Reading', mode: 'light', swatches: ['#234D76', '#28675F', '#FAFAF9'] },
  { id: 'system', label: 'System appearance', mode: 'light', swatches: ['#2458C6', '#83B9FF', '#F7F9FC'] },
] as const;
export type Density = 'compact' | 'comfortable';
export function readDensity(value: string | null): Density { return value === 'compact' ? 'compact' : 'comfortable'; }
export function isFutureTheme(theme: string) { return ['future', 'future-light', 'future-dark', 'comfort', 'system'].includes(theme); }
export function resolveAppearance(theme: string, darkSystem: boolean) {
  const resolved = theme === 'system' ? (darkSystem ? 'future-dark' : 'future-light') : theme;
  return { theme: resolved, future: isFutureTheme(theme) };
}