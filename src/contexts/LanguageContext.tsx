import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { localeDir, translate, type LocaleId, type TranslationKey } from "@/lib/i18n";

type Ctx = {
  locale: string;
  dir: "ltr" | "rtl";
  setLocale: (locale: LocaleId) => void;
  translationStatus: "idle" | "loading" | "ready" | "error";
  setTranslationStatus: (status: "idle" | "loading" | "ready" | "error") => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<Ctx>({
  locale: "en",
  dir: "ltr",
  setLocale: () => {},
  translationStatus: "idle",
  setTranslationStatus: () => {},
  t: (key) => translate("en", key),
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { prefs, setPref } = useAccessibility();
  const locale = prefs.locale;
  const dir = localeDir(locale);
  const [translationStatus, setTranslationStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const setLocale = useCallback((next: LocaleId) => setPref("locale", next), [setPref]);

  // Keep the document language/direction in sync with the chosen locale.
  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = dir;
  }, [locale, dir]);

  const value = useMemo<Ctx>(
    () => ({
      locale,
      dir,
      setLocale,
      translationStatus,
      setTranslationStatus,
      t: (key) => translate(locale, key),
    }),
    [locale, dir, setLocale, translationStatus],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  return useContext(LanguageContext);
}
