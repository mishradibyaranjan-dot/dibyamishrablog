import { useCallback, useEffect, useState } from "react";

export type CaptionSize = "sm" | "md" | "lg" | "xl";

export type CaptionPrefs = {
  enabled: boolean;
  size: CaptionSize;
  highContrast: boolean;
};

const KEY = "video-caption-prefs";

const DEFAULTS: CaptionPrefs = { enabled: true, size: "md", highContrast: false };

export const CAPTION_SIZE_LABEL: Record<CaptionSize, string> = {
  sm: "Small",
  md: "Medium",
  lg: "Large",
  xl: "Extra large",
};

/** Tailwind text classes per size step (also drives line height). */
export const CAPTION_SIZE_CLASS: Record<CaptionSize, string> = {
  sm: "text-xs leading-snug sm:text-sm",
  md: "text-sm leading-snug sm:text-base",
  lg: "text-base leading-snug sm:text-lg",
  xl: "text-lg leading-snug sm:text-2xl",
};

/**
 * Caption preferences persisted per browser. Reads happen after hydration so
 * the server and first client render always agree.
 */
export function useCaptionPrefs() {
  const [prefs, setPrefs] = useState<CaptionPrefs>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setPrefs({ ...DEFAULTS, ...(JSON.parse(raw) as Partial<CaptionPrefs>) });
    } catch {
      // ignore unreadable storage
    }
  }, []);

  const update = useCallback((patch: Partial<CaptionPrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // ignore write failures (private mode)
      }
      return next;
    });
  }, []);

  return { prefs, update };
}
