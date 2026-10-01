/**
 * Accessibility & preference model.
 *
 * A single versioned JSON object in localStorage under `a11y:preferences`.
 * Everything is applied as `data-*` attributes / CSS variables on <html>, so all
 * styling stays in the global design tokens (see src/styles.css).
 */

export const A11Y_STORAGE_KEY = "a11y:preferences";
export const A11Y_PREFS_VERSION = 1;

export type ColorFilter = "none" | "protanopia" | "deuteranopia" | "tritanopia" | "monochrome";
export type FontFamilyPref = "system" | "sans" | "serif" | "dyslexic";
export type SpacingPref = "normal" | "relaxed" | "loose";
export type ThemeModePref = "light" | "dark" | "system";

export type A11yPreferences = {
  version: number;
  themeMode: ThemeModePref;
  highContrast: boolean;
  colorFilter: ColorFilter;
  fontScale: number;
  fontFamily: FontFamilyPref;
  spacing: SpacingPref;
  boldText: boolean;
  underlineLinks: boolean;
  reduceMotion: boolean | null;
  focusRing: boolean;
  largeCursor: boolean;
  pauseMedia: boolean;
  speechRate: number;
  speechPitch: number;
  speechVolume: number;
  readOnSelection: boolean;
  locale: string;
};

export const FONT_SCALES = [0.9, 1, 1.15, 1.3, 1.5] as const;

export const DEFAULT_A11Y_PREFS: A11yPreferences = {
  version: A11Y_PREFS_VERSION,
  themeMode: "system",
  highContrast: false,
  colorFilter: "none",
  fontScale: 1,
  fontFamily: "system",
  spacing: "normal",
  boldText: false,
  underlineLinks: false,
  reduceMotion: null,
  focusRing: false,
  largeCursor: false,
  pauseMedia: false,
  speechRate: 1,
  speechPitch: 1,
  speechVolume: 0.9,
  readOnSelection: false,
  locale: "en",
};

const COLOR_FILTERS: ColorFilter[] = [
  "none",
  "protanopia",
  "deuteranopia",
  "tritanopia",
  "monochrome",
];

export function normalizePrefs(raw: unknown): A11yPreferences {
  const d = DEFAULT_A11Y_PREFS;
  if (!raw || typeof raw !== "object") return { ...d };
  const p = raw as Partial<A11yPreferences>;
  const num = (v: unknown, fallback: number, min: number, max: number) =>
    typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
  return {
    version: A11Y_PREFS_VERSION,
    themeMode:
      p.themeMode === "light" || p.themeMode === "dark" || p.themeMode === "system"
        ? p.themeMode
        : d.themeMode,
    highContrast: p.highContrast === true,
    colorFilter: COLOR_FILTERS.includes(p.colorFilter as ColorFilter)
      ? (p.colorFilter as ColorFilter)
      : d.colorFilter,
    fontScale: (FONT_SCALES as readonly number[]).includes(p.fontScale as number)
      ? (p.fontScale as number)
      : d.fontScale,
    fontFamily:
      p.fontFamily === "sans" || p.fontFamily === "serif" || p.fontFamily === "dyslexic"
        ? p.fontFamily
        : d.fontFamily,
    spacing: p.spacing === "relaxed" || p.spacing === "loose" ? p.spacing : d.spacing,
    boldText: p.boldText === true,
    underlineLinks: p.underlineLinks === true,
    reduceMotion: p.reduceMotion === true || p.reduceMotion === false ? p.reduceMotion : null,
    focusRing: p.focusRing === true,
    largeCursor: p.largeCursor === true,
    pauseMedia: p.pauseMedia === true,
    speechRate: num(p.speechRate, d.speechRate, 0.5, 1.5),
    speechPitch: num(p.speechPitch, d.speechPitch, 0.5, 1.5),
    speechVolume: num(p.speechVolume, d.speechVolume, 0, 1),
    readOnSelection: p.readOnSelection === true,
    locale: typeof p.locale === "string" && p.locale.length <= 16 ? p.locale : d.locale,
  };
}

export function readStoredPrefs(): A11yPreferences {
  if (typeof window === "undefined") return { ...DEFAULT_A11Y_PREFS };
  try {
    const raw = window.localStorage.getItem(A11Y_STORAGE_KEY);
    return normalizePrefs(raw ? JSON.parse(raw) : null);
  } catch {
    return { ...DEFAULT_A11Y_PREFS };
  }
}

export function writeStoredPrefs(prefs: A11yPreferences) {
  try {
    window.localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* storage unavailable — preferences stay session-only */
  }
}

/** Applies every preference to <html>. Safe to call repeatedly. */
export function applyA11yPrefs(prefs: A11yPreferences) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const systemReduce =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
  const reduce = prefs.reduceMotion ?? systemReduce;

  root.style.setProperty("--font-scale", String(prefs.fontScale));
  root.dataset.a11yContrast = prefs.highContrast ? "high" : "normal";
  root.dataset.a11yFilter = prefs.colorFilter;
  root.dataset.a11yFont = prefs.fontFamily;
  root.dataset.a11ySpacing = prefs.spacing;
  root.dataset.a11yBold = prefs.boldText ? "on" : "off";
  root.dataset.a11yLinks = prefs.underlineLinks ? "underline" : "default";
  root.dataset.a11yMotion = reduce ? "reduce" : "full";
  root.dataset.a11yFocus = prefs.focusRing ? "enhanced" : "default";
  root.dataset.a11yCursor = prefs.largeCursor ? "large" : "default";
}

/**
 * Inline bootstrap executed before first paint so a saved font scale, filter or
 * reduced-motion choice never flashes the default appearance.
 */
export const A11Y_BOOTSTRAP = `(function(){try{
var p=JSON.parse(localStorage.getItem('${A11Y_STORAGE_KEY}')||'{}')||{};
var r=document.documentElement,d=r.dataset;
var s=[0.9,1,1.15,1.3,1.5].indexOf(p.fontScale)>=0?p.fontScale:1;
r.style.setProperty('--font-scale',String(s));
d.a11yContrast=p.highContrast?'high':'normal';
d.a11yFilter=['protanopia','deuteranopia','tritanopia','monochrome'].indexOf(p.colorFilter)>=0?p.colorFilter:'none';
d.a11yFont=['sans','serif','dyslexic'].indexOf(p.fontFamily)>=0?p.fontFamily:'system';
d.a11ySpacing=['relaxed','loose'].indexOf(p.spacing)>=0?p.spacing:'normal';
d.a11yBold=p.boldText?'on':'off';
d.a11yLinks=p.underlineLinks?'underline':'default';
var sys=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
d.a11yMotion=(p.reduceMotion===true||(p.reduceMotion!==false&&sys))?'reduce':'full';
d.a11yFocus=p.focusRing?'enhanced':'default';
d.a11yCursor=p.largeCursor?'large':'default';
}catch(e){}})();`;
