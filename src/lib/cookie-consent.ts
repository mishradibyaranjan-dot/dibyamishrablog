/**
 * Privacy-first cookie consent store.
 * Default state = everything optional is OFF until the visitor opts in.
 * Nothing is written to storage until the visitor makes a choice.
 */
import { useCallback, useEffect, useState } from "react";

export const COOKIE_CONSENT_KEY = "drm-cookie-consent";
export const CONSENT_VERSION = 1;

export type CookieCategory = "necessary" | "preferences" | "analytics";

export type CookiePreferences = {
  necessary: true;
  preferences: boolean;
  analytics: boolean;
};

export type ConsentRecord = {
  version: number;
  decidedAt: string;
  prefs: CookiePreferences;
};

export const DEFAULT_PREFS: CookiePreferences = {
  necessary: true,
  preferences: false,
  analytics: false,
};

export const COOKIE_CATEGORIES: Array<{
  id: CookieCategory;
  label: string;
  description: string;
  locked?: boolean;
}> = [
  {
    id: "necessary",
    label: "Strictly necessary",
    description:
      "Required for the site to work — sign-in sessions, security checks and spam protection. These cannot be switched off.",
    locked: true,
  },
  {
    id: "preferences",
    label: "Preferences",
    description:
      "Remembers your choices such as theme, caption settings and learning progress on this device.",
  },
  {
    id: "analytics",
    label: "Analytics",
    description:
      "Aggregated, privacy-first page and traffic measurement so I can see which content is useful. No advertising or cross-site profiling.",
  },
];

function read(): ConsentRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentRecord;
    if (!parsed || parsed.version !== CONSENT_VERSION) return null;
    return { ...parsed, prefs: { ...DEFAULT_PREFS, ...parsed.prefs, necessary: true } };
  } catch {
    return null;
  }
}

function write(prefs: CookiePreferences): ConsentRecord {
  const record: ConsentRecord = {
    version: CONSENT_VERSION,
    decidedAt: new Date().toISOString(),
    prefs: { ...prefs, necessary: true },
  };
  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(record));
  } catch {
    /* storage unavailable — consent stays session-only */
  }
  window.dispatchEvent(new CustomEvent("drm-cookie-consent", { detail: record }));
  return record;
}

/** Read-only helper usable outside React (returns false during SSR). */
export function hasConsent(category: CookieCategory): boolean {
  if (category === "necessary") return true;
  const rec = read();
  return rec ? Boolean(rec.prefs[category]) : false;
}

export function useCookieConsent() {
  const [record, setRecord] = useState<ConsentRecord | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setRecord(read());
    setHydrated(true);
    const onChange = (e: Event) => setRecord((e as CustomEvent<ConsentRecord>).detail ?? read());
    window.addEventListener("drm-cookie-consent", onChange);
    return () => window.removeEventListener("drm-cookie-consent", onChange);
  }, []);

  const save = useCallback((prefs: CookiePreferences) => setRecord(write(prefs)), []);
  const acceptAll = useCallback(
    () => save({ necessary: true, preferences: true, analytics: true }),
    [save],
  );
  const rejectAll = useCallback(() => save({ ...DEFAULT_PREFS }), [save]);
  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(COOKIE_CONSENT_KEY);
    } catch {
      /* ignore */
    }
    setRecord(null);
  }, []);

  return {
    hydrated,
    record,
    prefs: record?.prefs ?? DEFAULT_PREFS,
    decided: Boolean(record),
    save,
    acceptAll,
    rejectAll,
    reset,
  };
}
